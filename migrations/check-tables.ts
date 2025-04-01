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
  } catch (error) {}
}

checkTables();
