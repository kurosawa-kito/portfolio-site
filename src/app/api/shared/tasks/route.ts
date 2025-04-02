import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { sql } from "@vercel/postgres";

// 共有タスク一覧を取得するAPI
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const taskId = pathSegments[pathSegments.length - 1];

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

    // '/api/shared/tasks/[taskId]' の形式の場合、特定のタスクを返す
    if (taskId && taskId !== "tasks") {
      console.log(`特定の共有タスクを取得するリクエスト: ID=${taskId}`);

      const result = await sql`
        SELECT 
          t.*,
          u.username as created_by_username
        FROM tasks t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.id = ${taskId} AND t.is_shared = true
      `;

      if (result.rows.length > 0) {
        console.log(
          `タスクID ${taskId} が見つかりました:`,
          result.rows[0].title
        );
        return NextResponse.json(result.rows[0], { status: 200 });
      } else {
        console.log(`タスクID ${taskId} が見つかりませんでした`);
        return NextResponse.json(
          { error: "指定されたタスクが見つかりません" },
          { status: 404 }
        );
      }
    }

    // 共有タスク一覧を取得
    console.log("共有タスク一覧を取得するリクエスト");

    const result = await sql`
      SELECT 
        t.*,
        u.username as created_by_username
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.is_shared = true
      ORDER BY t.created_at DESC
    `;

    // キャッシュを防止するためのヘッダーを追加
    return NextResponse.json(result.rows, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("共有タスク取得エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 共有タスクを作成するAPI（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, due_date, priority } = body;

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

    const user = JSON.parse(userStr) as User;
    const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;

    // 管理者のみタスク作成可能
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "共有タスクの作成は管理者のみ可能です" },
        { status: 403 }
      );
    }

    // 新しいタスクをデータベースに追加
    const result = await sql`
      INSERT INTO tasks (
        title,
        description,
        status,
        priority,
        due_date,
        assigned_to,
        created_by,
        is_shared,
        shared_at
      ) VALUES (
        ${title},
        ${description},
        'pending',
        ${priority},
        ${due_date},
        ${userId},
        ${userId},
        true,
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    const newTask = result.rows[0];

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("共有タスク作成エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの作成に失敗しました" },
      { status: 500 }
    );
  }
}

// 共有タスクを更新するAPI（管理者または作成者のみ）
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const taskId = pathSegments[pathSegments.length - 1];

    const body = await request.json();
    const { title, description, due_date, priority, is_all_day } = body;

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

    const user = JSON.parse(userStr) as User;
    const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;

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

    // 管理者または作成者のみタスク更新可能
    if (user.role !== "admin" && task.created_by !== userId) {
      return NextResponse.json(
        { error: "このタスクを更新する権限がありません" },
        { status: 403 }
      );
    }

    // タスクを更新
    const updateResult = await sql`
      UPDATE tasks
      SET 
        title = ${title},
        description = ${description},
        due_date = ${due_date},
        priority = ${priority},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${taskId} AND is_shared = true
      RETURNING *
    `;

    return NextResponse.json(updateResult.rows[0], { status: 200 });
  } catch (error) {
    console.error("共有タスク更新エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// 共有タスクを削除するAPI（管理者または作成者のみ）
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    // パスからIDを取得する
    const pathId = url.pathname.split("/").pop();
    // クエリパラメータからIDを取得する
    const queryId = url.searchParams.get("id");

    // いずれかの方法でIDを取得
    const taskId = queryId || pathId;

    console.log("共有タスク削除リクエスト:", {
      pathId,
      queryId,
      usedTaskId: taskId,
      url: request.url,
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

    const user = JSON.parse(userStr) as User;
    const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;

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
    if (user.role !== "admin" && task.created_by !== userId) {
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
    console.error("共有タスク削除エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの削除に失敗しました" },
      { status: 500 }
    );
  }
}

// ユーザーの追加済みタスクIDを取得するAPI
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

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
    const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;

    // ユーザーの追加済みタスクIDを取得
    if (action === "getUserAddedTasks") {
      // データベースからユーザーが追加した共有タスクを取得
      const result = await sql`
        SELECT t.id
        FROM tasks t
        WHERE t.created_by = ${userId} AND t.is_shared = true
      `;

      const taskIds = result.rows.map((row) => String(row.id));

      console.log("追加済みタスク取得:", {
        userId,
        taskCount: taskIds.length,
        taskIds,
      });

      return NextResponse.json(
        {
          taskIds: taskIds,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    // ユーザーのタスク追加処理
    if (action === "addTaskToUser") {
      const { taskId } = body;
      console.log("タスク追加リクエスト:", {
        userId,
        taskId,
        requestBody: body,
        userRole: user.role,
      });

      // タスクIDのチェック
      if (!taskId) {
        return NextResponse.json(
          { error: "タスクIDが指定されていません" },
          { status: 400 }
        );
      }

      // 追加対象の共有タスクを確認
      const taskResult = await sql`
        SELECT * FROM tasks WHERE id = ${taskId} AND is_shared = true
      `;

      if (taskResult.rows.length === 0) {
        return NextResponse.json(
          { error: "指定された共有タスクが見つかりません" },
          { status: 404 }
        );
      }

      const task = taskResult.rows[0];

      // ユーザーのタスクとして追加
      const insertResult = await sql`
        INSERT INTO tasks (
          title,
          description,
          status,
          priority,
          due_date,
          assigned_to,
          created_by,
          is_shared
        ) VALUES (
          ${"[共有] " + task.title},
          ${task.description},
          'pending',
          ${task.priority},
          ${task.due_date},
          ${userId},
          ${userId},
          false
        )
        RETURNING id, title
      `;

      return NextResponse.json({
        success: true,
        message: "タスクが追加されました",
        task: insertResult.rows[0],
      });
    }

    return NextResponse.json({ error: "無効なアクション" }, { status: 400 });
  } catch (error) {
    console.error("共有タスク操作エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの操作に失敗しました" },
      { status: 500 }
    );
  }
}
