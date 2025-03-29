import { sql } from "@vercel/postgres";

export async function POST() {
  console.log("VERCEL_GIT_COMMIT_REF:", process.env.VERCEL_GIT_COMMIT_REF);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("VERCEL_ENV:", process.env.VERCEL_ENV);

  // デフォルトでマイグレーション処理をスキップ（明示的に許可された場合のみ実行）
  if (process.env.EXPLICITLY_ALLOW_MIGRATION !== "true") {
    console.log("マイグレーション処理をスキップします。理由: 明示的に許可されていません");
    return Response.json({
      success: false,
      message: "マイグレーション処理はスキップされます。ローカル環境で明示的に許可する場合は EXPLICITLY_ALLOW_MIGRATION=true を設定してください。",
    });
  }

  console.log("マイグレーション処理を実行します。明示的に許可されています。");

  try {
    // 既存のテーブルを削除せずに、必要に応じて作成のみ行う
    // 列挙型の作成（存在しない場合のみ）
    await sql`
      DO $$ BEGIN
        CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'member');
        CREATE TYPE IF NOT EXISTS task_status AS ENUM ('pending', 'in_progress', 'completed');
        CREATE TYPE IF NOT EXISTS task_priority AS ENUM ('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // usersテーブルの作成（存在しない場合のみ）
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

    // projectsテーブルの作成（存在しない場合のみ）
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

    // tasksテーブルの作成（存在しない場合のみ）
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

    // shared_itemsテーブルの作成（存在しない場合のみ）
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

    // daily_logsテーブルの作成（存在しない場合のみ）
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
      message: "データベースのマイグレーション処理が完了しました",
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
