require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.EBAY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkEbayTables() {
  try {
    // テーブル一覧を取得
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'ebay_%'
      ORDER BY table_name
    `);

    console.log("🗄️  eBay自動化ツールのテーブル一覧:");
    tablesResult.rows.forEach((row) => {
      console.log("  ✅", row.table_name);
    });

    // ユーザー一覧を取得
    const usersResult = await pool.query(
      "SELECT id, username, email, full_name FROM ebay_users"
    );
    console.log("\n👥 作成されたテストユーザー:");
    usersResult.rows.forEach((user) => {
      console.log(`  📧 ${user.username} (${user.email}) - ${user.full_name}`);
    });
  } catch (error) {
    console.error("❌ エラー:", error.message);
  } finally {
    await pool.end();
  }
}

checkEbayTables();
