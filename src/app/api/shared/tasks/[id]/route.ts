import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { sql } from "@vercel/postgres";
import { cookies } from "next/headers";

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

// 共有タスクを削除するAPI（管理者のみ）
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

    // チェックするかどうかのフラグ
    const skipAuth = request.headers.get("x-skip-auth") === "true";

    // ユーザー情報取得（認証バイパスフラグがない場合のみ）
    let user: User;

    if (!skipAuth) {
      // ユーザー情報を取得する方法
      // 1. x-userヘッダー（従来の方法）
      // 2. x-user-base64ヘッダー
      // 3. x-role-headerからロール情報を取得（セッションに相当）
      let userStr = request.headers.get("x-user");
      const userBase64 = request.headers.get("x-user-base64");
      const roleHeader = request.headers.get("x-role"); // ロールヘッダーを取得

      // Base64エンコードされたユーザー情報を優先的に使用
      if (userBase64) {
        try {
          // Base64からデコード (サーバーサイドではBufferを使用)
          const decodedStr = Buffer.from(userBase64, "base64").toString(
            "utf-8"
          );

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

      // パースしたユーザー情報
      user = JSON.parse(userStr) as User;

      // セッションからのロール情報がある場合は上書き
      if (roleHeader) {
        console.log("ロールヘッダーから取得:", roleHeader);
        user.role = roleHeader;
      }
    } else {
      // 認証をバイパスする場合は管理者権限を持つユーザーとして扱う
      user = {
        id: 0,
        username: "system",
        role: "admin",
      };
      console.log("認証チェックをバイパスします");
    }

    console.log("完全なユーザー情報:", user);

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

    // 管理者のみタスク削除可能（認証バイパスの場合はチェックしない）
    if (!skipAuth) {
      console.log("ユーザー情報:", user);
      console.log("タスク情報:", task);
      console.log("権限チェック:", {
        userRole: user.role,
        isAdmin: user.role === "admin",
      });

      // 管理者のみ削除可能に変更
      if (user.role !== "admin") {
        return NextResponse.json(
          { error: "共有タスクの削除は管理者のみ可能です" },
          { status: 403 }
        );
      }
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
