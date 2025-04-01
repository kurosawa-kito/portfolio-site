import { sql } from "@vercel/postgres";
import dotenv from "dotenv";

// 環境変数を読み込む
dotenv.config({ path: ".env.local" });

async function checkUsers() {
  try {
    console.log("usersテーブルの確認を開始します...");

    // usersテーブルの構造を確認
    const schema = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'users'
      ORDER BY 
        ordinal_position;
    `;

    console.log("\nusersテーブルの構造:");
    schema.rows.forEach((column) => {
      console.log(`- ${column.column_name}`);
      console.log(`  型: ${column.data_type}`);
      console.log(`  NULL許可: ${column.is_nullable === "YES" ? "YES" : "NO"}`);
      console.log(`  デフォルト値: ${column.column_default || "なし"}`);
    });

    // usersテーブルのデータを確認
    const users = await sql`
      SELECT * FROM users;
    `;

    console.log("\nusersテーブルのデータ:");
    users.rows.forEach((user) => {
      console.log(`\nID: ${user.id}`);
      console.log(`ユーザー名: ${user.username}`);
      console.log(`Eメール: ${user.email || "なし"}`);
      console.log(`ログインID: ${user.login_id || "なし"}`);
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

checkUsers();
