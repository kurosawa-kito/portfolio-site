import { sql } from "@vercel/postgres";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// 環境変数を読み込む
dotenv.config({ path: ".env.local" });

async function checkAndUpdateAdminPassword() {
  try {
    // adminユーザーの情報を取得
    const result = await sql`
      SELECT id, username, login_id, password, role
      FROM users
      WHERE login_id = 'admin'
    `;

    if (result.rows.length === 0) {
      return;
    }

    const admin = result.rows[0];

    // パスワードが期待値と異なる場合は更新
    const expectedPassword = "admin123";

    // パスワードがハッシュ化されていないか、bcryptハッシュでない場合は更新
    const passwordNeedsUpdate =
      !admin.password || !admin.password.startsWith("$2b$");

    if (passwordNeedsUpdate) {
      // bcryptを使用してパスワードをハッシュ化
      const hashedPassword = await bcrypt.hash(expectedPassword, 10);

      await sql`
        UPDATE users
        SET password = ${hashedPassword}
        WHERE id = ${admin.id}
      `;

      // 更新後の管理者情報を取得
      const updatedResult = await sql`
        SELECT id, username, login_id, password, role
        FROM users
        WHERE id = ${admin.id}
      `;

      const updatedAdmin = updatedResult.rows[0];
    } else {
    }
  } catch (error) {
  } finally {
    process.exit();
  }
}

checkAndUpdateAdminPassword();
