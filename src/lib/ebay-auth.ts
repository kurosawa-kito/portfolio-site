import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ebayDb } from "./ebay-db";

export interface EbayUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  subscriptionPlan: "free" | "basic" | "pro" | "enterprise";
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface EbaySession {
  id: number;
  userId: number;
  sessionToken: string;
  expiresAt: Date;
}

class EbayAuthService {
  private static readonly JWT_SECRET =
    process.env.EBAY_JWT_SECRET || "ebay-automation-secret-key";
  private static readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  // ユーザー登録
  static async registerUser(userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }): Promise<EbayUser> {
    const { username, email, password, fullName } = userData;

    // パスワードハッシュ化
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO ebay_users (username, email, password_hash, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, full_name, subscription_plan, is_active, created_at
    `;

    const result = await ebayDb.query(query, [
      username,
      email,
      passwordHash,
      fullName,
    ]);
    const user = result.rows[0];

    // デフォルト設定を作成
    await this.createDefaultSettings(user.id);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      subscriptionPlan: user.subscription_plan,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }

  // ユーザーログイン
  static async loginUser(
    username: string,
    password: string
  ): Promise<{ user: EbayUser; sessionToken: string }> {
    const query = `
      SELECT id, username, email, password_hash, full_name, subscription_plan, is_active, created_at
      FROM ebay_users
      WHERE (username = $1 OR email = $1) AND is_active = true
    `;

    const result = await ebayDb.query(query, [username]);

    if (result.rows.length === 0) {
      throw new Error("ユーザーが見つかりません");
    }

    const user = result.rows[0];

    // パスワード確認
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error("パスワードが正しくありません");
    }

    // 最終ログイン時刻を更新
    await ebayDb.query(
      "UPDATE ebay_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    );

    // セッション作成
    const sessionToken = await this.createSession(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        subscriptionPlan: user.subscription_plan,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
      sessionToken,
    };
  }

  // セッション作成
  static async createSession(userId: number): Promise<string> {
    const sessionToken = jwt.sign(
      { userId, type: "ebay-session" },
      this.JWT_SECRET
    );
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

    const query = `
      INSERT INTO ebay_sessions (user_id, session_token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING session_token
    `;

    await ebayDb.query(query, [userId, sessionToken, expiresAt]);
    return sessionToken;
  }

  // セッション検証
  static async validateSession(sessionToken: string): Promise<EbayUser | null> {
    try {
      const decoded = jwt.verify(sessionToken, this.JWT_SECRET) as any;

      const query = `
        SELECT u.id, u.username, u.email, u.full_name, u.subscription_plan, u.is_active, u.created_at, u.last_login
        FROM ebay_users u
        JOIN ebay_sessions s ON u.id = s.user_id
        WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = true
      `;

      const result = await ebayDb.query(query, [sessionToken]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];

      // セッションの最終アクセス時刻を更新
      await ebayDb.query(
        "UPDATE ebay_sessions SET last_accessed = CURRENT_TIMESTAMP WHERE session_token = $1",
        [sessionToken]
      );

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        subscriptionPlan: user.subscription_plan,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      };
    } catch (error) {
      console.error("Session validation error:", error);
      return null;
    }
  }

  // セッション削除（ログアウト）
  static async revokeSession(sessionToken: string): Promise<void> {
    await ebayDb.query("DELETE FROM ebay_sessions WHERE session_token = $1", [
      sessionToken,
    ]);
  }

  // デフォルト設定作成
  private static async createDefaultSettings(userId: number): Promise<void> {
    const query = `
      INSERT INTO ebay_user_settings (user_id)
      VALUES ($1)
    `;
    await ebayDb.query(query, [userId]);
  }

  // 期限切れセッションクリーンアップ
  static async cleanupExpiredSessions(): Promise<void> {
    await ebayDb.query(
      "DELETE FROM ebay_sessions WHERE expires_at < CURRENT_TIMESTAMP"
    );
  }
}

export default EbayAuthService;
