import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { tasks } from "../route";

// タスクインターフェース（APIルートと一致させる）
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  priority: string;
  assigned_to: string;
  assigned_to_username: string;
  created_by: string;
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
    const taskId = params.id;
    const body = await request.json();
    const { title, description, due_date, priority, is_all_day } = body;

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // タスクの存在確認
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "指定されたタスクが見つかりません" },
        { status: 404 }
      );
    }

    // 管理者または割り当てられた人のみタスク更新可能
    if (user.role !== "admin" && tasks[taskIndex].assigned_to !== user.id) {
      return NextResponse.json(
        { error: "このタスクを更新する権限がありません" },
        { status: 403 }
      );
    }

    // タスクを更新
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title,
      description,
      due_date,
      priority,
      is_all_day,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(tasks[taskIndex], { status: 200 });
  } catch (error) {
    console.error("タスク更新エラー:", error);
    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// タスクの削除APIエンドポイント
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // タスクの存在確認
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "指定されたタスクが見つかりません" },
        { status: 404 }
      );
    }

    // タスクを削除
    const deletedTask = tasks.splice(taskIndex, 1)[0];

    return NextResponse.json(
      { message: "タスクを削除しました", deletedTask },
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
