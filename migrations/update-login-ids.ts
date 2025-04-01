import { sql } from "@vercel/postgres";
import dotenv from "dotenv";

// 環境変数を読み込む
dotenv.config({ path: ".env.local" });

async function updateLoginIds() {
  try {
    console.log("login_idの更新を開始します...");

    // 既存ユーザーのlogin_idを英数字形式に更新
    await sql`
      UPDATE users
      SET login_id = 'admin'
      WHERE id = 1;
    `;

    await sql`
      UPDATE users
      SET login_id = 'user2'
      WHERE id = 2;
    `;

    await sql`
      UPDATE users
      SET login_id = 'dev1'
      WHERE id = 3;
    `;

    await sql`
      UPDATE users
      SET login_id = 'dev2'
      WHERE id = 4;
    `;

    console.log("login_idの更新が完了しました");

    // 更新後のusersテーブルのデータを確認
    const users = await sql`
      SELECT * FROM users;
    `;

    console.log("\n更新後のusersテーブルのデータ:");
    users.rows.forEach((user) => {
      console.log(`\nID: ${user.id}`);
      console.log(`ユーザー名: ${user.username}`);
      console.log(`ログインID: ${user.login_id}`);
      console.log(`パスワード: ${user.password ? "設定済み" : "なし"}`);
      console.log(`ロール: ${user.role}`);
      console.log(`作成日時: ${user.created_at}`);
      console.log(`更新日時: ${user.updated_at}`);
    });
  } catch (error) {
    console.error("エラーが発生しました:", error);
  } finally {
    process.exit();
  }
}

updateLoginIds();
