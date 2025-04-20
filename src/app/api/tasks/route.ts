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
  assigned_to: number;
  assigned_to_username: string;
  project_id: number | null;
  created_by: number;
  created_by_username: string;
  is_shared: boolean;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log("タスク一覧取得API呼び出し");

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

        console.log("Base64エンコードされたユーザー情報を使用");
      } catch (e) {
        console.error("Base64デコードエラー:", e);
        return NextResponse.json(
          { error: "ユーザー情報のデコードに失敗しました" },
          { status: 400 }
        );
      }
    }

    console.log(
      "ユーザーヘッダー:",
      userStr ? `取得済み (${userStr.length}文字)` : "なし"
    );

    if (!userStr) {
      console.error("認証エラー: ユーザーヘッダーがありません");
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    let user: User;
    try {
      user = JSON.parse(userStr) as User;

      // ユーザーデータの検証
      if (!user || typeof user.id !== "number" || !user.username) {
        console.error("不正なユーザーデータ:", user);
        return NextResponse.json(
          { error: "不正なユーザーデータ" },
          { status: 401 }
        );
      }

      console.log("ユーザー情報:", {
        userId: user.id,
        username: user.username,
      });
    } catch (e) {
      console.error("ユーザーヘッダーの解析エラー:", e);
      return NextResponse.json(
        { error: "不正なユーザーデータ形式" },
        { status: 400 }
      );
    }

    // データベースからユーザーに割り当てられたタスクを取得
    try {
      const result = await sql`
        SELECT 
          t.*,
          u.username as assigned_to_username,
          c.username as created_by_username
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN users c ON t.created_by = c.id
        WHERE t.assigned_to = ${user.id}
        ORDER BY t.due_date ASC;
      `;

      const tasks = result.rows as Task[];
      console.log(
        `ユーザー ${user.id} に割り当てられたタスク: ${tasks.length}件`
      );

      return NextResponse.json(tasks);
    } catch (dbError) {
      console.error("データベースエラー:", dbError);
      return NextResponse.json(
        { error: "データベースからのタスク取得に失敗しました" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("タスク取得エラー:", error);
    return NextResponse.json(
      { error: "タスクの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, due_date, priority, project_id, is_all_day } =
      await request.json();

    // 過去の日付のバリデーション
    if (due_date) {
      const currentDate = new Date(); // 現在時刻をそのまま使用
      const taskDueDate = new Date(due_date);
      
      if (taskDueDate < currentDate) {
        return NextResponse.json(
          { error: "現在時刻より前の日時をタスクの期限として設定することはできません" },
          { status: 400 }
        );
      }
    }

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
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = JSON.parse(userStr) as User;

    // 新しいタスクを作成
    const result = await sql`
      INSERT INTO tasks (
        title,
        description,
        status,
        due_date,
        priority,
        assigned_to,
        project_id,
        created_by,
        is_shared,
        is_all_day
      ) VALUES (
        ${title},
        ${description},
        'pending',
        ${due_date},
        ${priority},
        ${user.id},
        ${project_id},
        ${user.id},
        false,
        ${is_all_day || false}
      )
      RETURNING *;
    `;

    const newTask = result.rows[0] as Task;
    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("タスク作成エラー:", error);
    return NextResponse.json(
      { error: "タスクの作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

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
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = JSON.parse(userStr) as User;

    // タスクを更新
    const result = await sql`
      UPDATE tasks
      SET 
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND assigned_to = ${user.id}
      RETURNING *;
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "タスクが見つからないか、更新権限がありません" },
        { status: 404 }
      );
    }

    const updatedTask = result.rows[0] as Task;
    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("タスク更新エラー:", error);
    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}
