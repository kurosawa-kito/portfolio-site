import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { sql } from "@vercel/postgres";

// タスクインターフェース
interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  priority: string;
  assigned_to: number;
  assigned_to_username: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
  updated_at: string;
  is_all_day?: boolean;
}

// タスクの更新APIエンドポイント
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    const body = await request.json();
    const { title, description, due_date, priority, is_all_day } = body;

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // タスクの存在確認と権限チェック
    const taskResult = await sql`
      SELECT * FROM tasks 
      WHERE id = ${taskId} AND assigned_to = ${user.id}
    `;

    if (taskResult.rows.length === 0) {
      return NextResponse.json(
        { error: "タスクが見つからないか、更新権限がありません" },
        { status: 404 }
      );
    }

    // タスクを更新
    const updatedTask = await sql`
      UPDATE tasks 
      SET 
        title = ${title},
        description = ${description},
        due_date = ${due_date},
        priority = ${priority},
        is_all_day = ${is_all_day},
        updated_at = NOW()
      WHERE id = ${taskId}
      RETURNING *;
    `;

    return NextResponse.json(updatedTask.rows[0], { status: 200 });
  } catch (error) {
    console.error("タスク更新エラー:", error);
    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// タスクを削除するAPI
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    console.log(`タスク削除リクエスト: ${taskId}`);

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // タスクの存在確認と権限チェック
    const taskResult = await sql`
      SELECT * FROM tasks 
      WHERE id = ${taskId} AND assigned_to = ${user.id}
    `;

    if (taskResult.rows.length === 0) {
      console.log(`タスク ${taskId} が見つからないか、削除権限がありません`);
      return NextResponse.json(
        { error: "タスクが見つからないか、削除権限がありません" },
        { status: 404 }
      );
    }

    // タスクを削除
    const deletedTask = await sql`
      DELETE FROM tasks 
      WHERE id = ${taskId}
      RETURNING *;
    `;

    console.log(`タスク ${taskId} を削除しました`);
    return NextResponse.json(
      { message: "タスクを削除しました", deletedTask: deletedTask.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("タスク削除エラー:", error);
    return NextResponse.json(
      { error: "タスクの削除に失敗しました" },
      { status: 500 }
    );
  }
}
