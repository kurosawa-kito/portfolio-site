import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { sql } from "@vercel/postgres";

// タスク型の定義
interface Task {
  id: string;
  title: string;
  description?: string;
  created_by: number;
  // 他の必要なプロパティを追加
}

// ユーザータスク型の定義
interface UserAddedTask {
  taskIds: string[];
  // 他の必要なプロパティを追加
}

// 共有タスクを削除するAPI（管理者または作成者のみ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    console.log("動的ルート - 共有タスク削除リクエスト:", {
      taskId,
      url: request.url,
      params,
    });

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
        return NextResponse.json(
          { error: "ユーザー情報のデコードに失敗しました" },
          { status: 400 }
        );
      }
    }

    if (!userStr) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userStr) as User;

    // タスクの存在確認
    const taskResult = await sql`
      SELECT * FROM tasks 
      WHERE id = ${taskId} AND is_shared = true
    `;

    if (taskResult.rows.length === 0) {
      return NextResponse.json(
        { error: "指定されたタスクが見つかりません" },
        { status: 404 }
      );
    }

    const task = taskResult.rows[0];

    // 管理者または作成者のみタスク削除可能
    if (user.role !== "admin" && task.created_by !== user.id) {
      return NextResponse.json(
        { error: "このタスクを削除する権限がありません" },
        { status: 403 }
      );
    }

    // タスクを削除
    const deleteResult = await sql`
      DELETE FROM tasks
      WHERE id = ${taskId} AND is_shared = true
      RETURNING *
    `;

    const deletedTask = deleteResult.rows[0];

    return NextResponse.json(
      { message: "タスクを削除しました", deletedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error("動的ルート - 共有タスク削除エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの削除に失敗しました" },
      { status: 500 }
    );
  }
}
