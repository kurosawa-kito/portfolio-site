import { sql } from "@vercel/postgres";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// 環境変数を読み込む
dotenv.config({ path: ".env.local" });

async function checkAndUpdateAdminPassword() {
  try {
    console.log("管理者パスワードの確認を開始します...");

    // adminユーザーの情報を取得
    const result = await sql`
      SELECT id, username, login_id, password, role
      FROM users
      WHERE login_id = 'admin'
    `;

    if (result.rows.length === 0) {
      console.log("adminユーザーが見つかりません。");
      return;
    }

    const admin = result.rows[0];
    console.log("現在の管理者情報:");
    console.log(`- ID: ${admin.id}`);
    console.log(`- ユーザー名: ${admin.username}`);
    console.log(`- ログインID: ${admin.login_id}`);
    console.log(`- パスワード: ${admin.password}`);
    console.log(`- ロール: ${admin.role}`);

    // パスワードが期待値と異なる場合は更新
    const expectedPassword = "admin123";

    // パスワードがハッシュ化されていないか、bcryptハッシュでない場合は更新
    const passwordNeedsUpdate =
      !admin.password || !admin.password.startsWith("$2b$");

    if (passwordNeedsUpdate) {
      console.log(
        `パスワードが安全にハッシュ化されていません。パスワードを'${expectedPassword}'にハッシュ化して更新します...`
      );

      // bcryptを使用してパスワードをハッシュ化
      const hashedPassword = await bcrypt.hash(expectedPassword, 10);

      await sql`
        UPDATE users
        SET password = ${hashedPassword}
        WHERE id = ${admin.id}
      `;

      console.log("パスワードを更新しました。");

      // 更新後の管理者情報を取得
      const updatedResult = await sql`
        SELECT id, username, login_id, password, role
        FROM users
        WHERE id = ${admin.id}
      `;

      const updatedAdmin = updatedResult.rows[0];
      console.log("\n更新後の管理者情報:");
      console.log(`- ID: ${updatedAdmin.id}`);
      console.log(`- ユーザー名: ${updatedAdmin.username}`);
      console.log(`- ログインID: ${updatedAdmin.login_id}`);
      console.log(`- パスワード: ${updatedAdmin.password}`);
      console.log(`- ロール: ${updatedAdmin.role}`);
    } else {
      console.log(`パスワードは既にハッシュ化されています。更新は不要です。`);
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
  } finally {
    process.exit();
  }
}

checkAndUpdateAdminPassword();
