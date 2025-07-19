require("dotenv").config();
import { sql } from "@vercel/postgres";

async function migrate() {
  try {
    // usersテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("usersテーブルの作成が完了しました");

    // projectsテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        github_url VARCHAR(255),
        live_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("projectsテーブルの作成が完了しました");

    // Excel履歴ファイルテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS excel_history (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        path TEXT NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        size INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Excelファイルテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS excel_files (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        file_data BYTEA NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("全てのマイグレーションが正常に完了しました");
  } catch (error) {
    console.error("マイグレーション中にエラーが発生しました:", error);
  }
}

migrate().catch((err) => {
  console.error("Failed to create tables:", err);
  process.exit(1);
});
