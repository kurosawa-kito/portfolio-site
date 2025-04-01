require("dotenv").config();
import sql, { QueryResultRow } from "./db";

async function checkTables() {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log("データベース内のテーブル一覧:");
    result.rows.forEach((row: QueryResultRow) => {
      console.log(`- ${row.table_name}`);
    });
  } catch (error) {
    console.error("テーブル一覧の取得中にエラーが発生しました:", error);
  }
}

checkTables();
