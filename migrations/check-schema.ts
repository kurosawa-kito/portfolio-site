require("dotenv").config();
import sql, { QueryResultRow } from "./db";

async function checkSchema() {
  try {
    // テーブル一覧の取得
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    // 各テーブルのスキーマを確認
    for (const table of tables.rows) {
      const columns = await sql`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = ${table.table_name}
        ORDER BY ordinal_position;
      `;

      console.log(`\n【${table.table_name}】テーブルの構造:`);
      columns.rows.forEach((column: QueryResultRow) => {
        console.log(`- ${column.column_name}`);
        console.log(`  型: ${column.data_type}`);
        console.log(`  NULL許可: ${column.is_nullable}`);
        console.log(`  デフォルト値: ${column.column_default || "なし"}`);
      });
    }
  } catch (error) {
    console.error("スキーマの取得中にエラーが発生しました:", error);
  }
}

checkSchema();
