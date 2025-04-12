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
    let userStr = request.headers.get("x-user");
    const userBase64 = request.headers.get("x-user-base64");

    // Base64エンコードされたユーザー情報を優先的に使用
    if (userBase64) {
      try {
        // Base64からデコード
        const decodedStr = Buffer.from(userBase64, "base64").toString("utf-8");
        userStr = decodedStr;
      } catch (e) {
        console.error("Base64デコードエラー:", e);
      }
    }

    // 認証チェックをコメントアウト
    if (!userStr) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    // セッションストレージから取得したユーザー情報を解析
    const user = JSON.parse(userStr) as User;

    // ユーザーIDが文字列の場合は数値に変換
    if (typeof user.id === "string") {
      user.id = parseInt(user.id);
    }

    console.log("ユーザー情報:", user);

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
    let userStr = request.headers.get("x-user");
    const userBase64 = request.headers.get("x-user-base64");

    // Base64エンコードされたユーザー情報を優先的に使用
    if (userBase64) {
      try {
        // Base64からデコード
        const decodedStr = Buffer.from(userBase64, "base64").toString("utf-8");
        userStr = decodedStr;
      } catch (e) {
        console.error("Base64デコードエラー:", e);
      }
    }

    // 認証チェックをコメントアウト
    if (!userStr) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    // セッションストレージから取得したユーザー情報を解析
    const user = JSON.parse(userStr) as User;

    // ユーザーIDが文字列の場合は数値に変換
    if (typeof user.id === "string") {
      user.id = parseInt(user.id);
    }

    console.log("ユーザー情報:", user);

    // タスクの存在確認（権限チェックを行わない）
    const taskResult = await sql`
      SELECT * FROM tasks 
      WHERE id = ${taskId}
    `;

    if (taskResult.rows.length === 0) {
      console.log(`タスク ${taskId} が見つかりません`);
      return NextResponse.json(
        { error: "タスクが見つかりません" },
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
