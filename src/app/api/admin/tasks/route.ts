import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { sql } from "@vercel/postgres";

// タスクのインターフェース定義
interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  assigned_to: string | number;
  assigned_to_username?: string;
  project_id?: number | null;
  created_by: number;
  created_by_username?: string;
  is_shared?: boolean;
  shared_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function GET(request: NextRequest) {
  try {
    // ユーザー情報を取得（通常のx-userヘッダーとBase64エンコードされたx-user-base64ヘッダーの両方をサポート）
    let userStr = request.headers.get("x-user");
    const userBase64 = request.headers.get("x-user-base64");

    // Base64エンコードされたユーザー情報を優先的に使用
    if (userBase64) {
      try {
        // Base64からデコード (サーバーサイドではBufferを使用)
        const decodedStr = Buffer.from(userBase64, "base64").toString("utf-8");

        // UTF-8エンコードされたURLエンコード文字列かどうかをチェックして適切に処理
        try {
          if (decodedStr.includes("%")) {
            // URLエンコード文字列の場合はデコード
            userStr = decodeURIComponent(decodedStr);
          } else {
            // 通常の文字列の場合はそのまま使用
            userStr = decodedStr;
          }
        } catch (decodeErr) {
          // デコードエラーの場合は元の文字列を使用
          userStr = decodedStr;
        }
      } catch (e) {
        console.error("Base64デコードエラー:", e);
        return NextResponse.json(
          { error: "ユーザー情報のデコードに失敗しました" },
          { status: 400 }
        );
      }
    }

    if (!userStr) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const requestingUser = JSON.parse(userStr) as User;

    // 管理者のみアクセス可能
    if (requestingUser.role !== "admin") {
      return NextResponse.json(
        { error: "この操作には管理者権限が必要です" },
        { status: 403 }
      );
    }

    // URLからユーザーIDを取得
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ユーザーIDが指定されていません" },
        { status: 400 }
      );
    }

    // 数値に変換
    const userIdNum = parseInt(userId);

    // データベースから指定されたユーザーのタスクを取得
    const result = await sql`
      SELECT 
        t.*,
        u.username as assigned_to_username,
        c.username as created_by_username
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.assigned_to = ${userIdNum}
      ORDER BY t.due_date ASC;
    `;

    const userTasks = result.rows as Task[];

    console.log(
      `ユーザー ${userId} に割り当てられたタスク: ${userTasks.length}件`
    );

    return NextResponse.json({
      success: true,
      tasks: userTasks,
    });
  } catch (error) {
    console.error("管理者タスク取得エラー:", error);
    return NextResponse.json(
      { success: false, message: "タスク情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
