import { sql } from "@vercel/postgres";

export async function POST() {
  try {
    // 既存のテーブルを削除
    await sql`DROP TABLE IF EXISTS daily_logs CASCADE;`;
    await sql`DROP TABLE IF EXISTS shared_items CASCADE;`;
    await sql`DROP TABLE IF EXISTS tasks CASCADE;`;
    await sql`DROP TABLE IF EXISTS projects CASCADE;`;
    await sql`DROP TABLE IF EXISTS users CASCADE;`;
    await sql`DROP TYPE IF EXISTS task_status CASCADE;`;
    await sql`DROP TYPE IF EXISTS task_priority CASCADE;`;
    await sql`DROP TYPE IF EXISTS user_role CASCADE;`;

    // 列挙型の作成
    await sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'member');
        CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // usersテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // projectsテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // tasksテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status task_status DEFAULT 'pending',
        priority task_priority DEFAULT 'medium',
        due_date DATE,
        assigned_to INT,
        project_id INT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `;

    // shared_itemsテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS shared_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `;

    // daily_logsテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id SERIAL PRIMARY KEY,
        user_id INT,
        date DATE NOT NULL,
        todo TEXT,
        done TEXT,
        estimated_time INT,
        actual_time INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    return Response.json({
      success: true,
      message: "データベースのマイグレーションが正常に完了しました",
    });
  } catch (error) {
    console.error("マイグレーション中にエラーが発生しました:", error);
    return Response.json(
      {
        success: false,
        message: "マイグレーション中にエラーが発生しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  }
}
