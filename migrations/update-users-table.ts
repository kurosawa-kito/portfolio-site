import { sql } from "@vercel/postgres";
import dotenv from "dotenv";

// 環境変数を読み込む
dotenv.config({ path: ".env.local" });

async function updateUsersTable() {
  try {
    console.log("usersテーブル更新を開始します...");

    // login_idカラムが存在するか確認
    const checkColumn = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'login_id';
    `;

    // login_idカラムが存在しない場合のみ追加
    if (checkColumn.rowCount === 0) {
      console.log("login_idカラムを追加します...");

      // login_idカラムを追加
      await sql`
        ALTER TABLE users
        ADD COLUMN login_id VARCHAR(50) UNIQUE;
      `;

      // 既存ユーザーにデフォルトのlogin_idを設定（usernameと同じ値）
      await sql`
        UPDATE users
        SET login_id = username
        WHERE login_id IS NULL;
      `;

      // login_idカラムをNOT NULL制約に変更
      await sql`
        ALTER TABLE users
        ALTER COLUMN login_id SET NOT NULL;
      `;

      console.log("login_idカラムの追加が完了しました");
    } else {
      console.log("login_idカラムはすでに存在します");
    }

    // 更新後のusersテーブルの構造を確認
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

    console.log("\n更新後のusersテーブルの構造:");
    schema.rows.forEach((column) => {
      console.log(`- ${column.column_name}`);
      console.log(`  型: ${column.data_type}`);
      console.log(`  NULL許可: ${column.is_nullable === "YES" ? "YES" : "NO"}`);
      console.log(`  デフォルト値: ${column.column_default || "なし"}`);
    });

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

updateUsersTable();
