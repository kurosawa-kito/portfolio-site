import { sql } from "@vercel/postgres";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 環境変数を読み込む
dotenv.config({ path: ".env.local" });

async function seedTasks() {
  try {
    console.log("サンプルタスクの追加を開始します...");

    // サンプルタスクを追加
    await sql`
      INSERT INTO tasks (
        title,
        description,
        status,
        priority,
        due_date,
        assigned_to,
        project_id,
        created_by,
        is_shared
      ) VALUES 
      (
        'ポートフォリオサイトの作成',
        'Next.jsを使用してポートフォリオサイトを作成する',
        'in_progress',
        'high',
        '2024-04-30',
        1,
        1,
        1,
        false
      ),
      (
        'タスク管理機能の実装',
        'タスクの作成、編集、削除機能を実装する',
        'pending',
        'medium',
        '2024-04-25',
        1,
        1,
        1,
        false
      );
    `;

    console.log("サンプルタスクの追加が完了しました");

    // 追加されたタスクを確認
    const result = await sql`
      SELECT 
        t.*,
        u.username as assigned_to_username,
        c.username as created_by_username
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.assigned_to = 1
      ORDER BY t.due_date ASC;
    `;

    console.log("\n追加されたタスク一覧:");
    result.rows.forEach((task) => {
      console.log(`
ID: ${task.id}
タイトル: ${task.title}
説明: ${task.description}
状態: ${task.status}
優先度: ${task.priority}
期限: ${task.due_date}
担当者: ${task.assigned_to_username}
作成者: ${task.created_by_username}
-------------------`);
    });
  } catch (error) {
    console.error("エラーが発生しました:", error);
  } finally {
    process.exit();
  }
}

seedTasks();
