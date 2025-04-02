import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { sql } from "@vercel/postgres";

// Task型の定義
interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  assigned_to: number;
  created_by: number;
}

// DB用ユーザー型
interface DbUser {
  id: number;
  username: string;
  role: string;
  login_id: string;
}

// ユーザー一覧を取得
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

    // データベースからパスワードを除外したユーザー情報を取得
    const result = await sql`
      SELECT id, username, role, login_id
      FROM users
      ORDER BY id
    `;

    const safeUsers = result.rows as DbUser[];

    return NextResponse.json({
      success: true,
      users: safeUsers,
    });
  } catch (error) {
    console.error("ユーザー取得エラー:", error);
    return NextResponse.json(
      { success: false, message: "ユーザー情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// ユーザー権限を変更
export async function PUT(request: NextRequest) {
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
    // idが数値型であることを確認
    const requestingUserId =
      typeof requestingUser.id === "string"
        ? parseInt(requestingUser.id)
        : requestingUser.id;

    // 管理者のみアクセス可能
    if (requestingUser.role !== "admin") {
      return NextResponse.json(
        { error: "この操作には管理者権限が必要です" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, newRole } = body;

    // 数値に変換
    const userIdNum = typeof userId === "string" ? parseInt(userId) : userId;

    // 対象ユーザーを検索
    const userResult = await sql`
      SELECT id, username, role
      FROM users
      WHERE id = ${userIdNum}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    const targetUser = userResult.rows[0] as DbUser;

    // 自分自身の権限は変更できない
    if (targetUser.id === requestingUserId) {
      return NextResponse.json(
        { success: false, message: "自分自身の権限は変更できません" },
        { status: 400 }
      );
    }

    // admin権限を外す場合、admin権限のユーザーが他にいるか確認
    if (targetUser.role === "admin" && newRole !== "admin") {
      const adminCountResult = await sql`
        SELECT COUNT(*) as count
        FROM users
        WHERE role = 'admin'
      `;

      const adminCount = parseInt(adminCountResult.rows[0].count);
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: "少なくとも1人の管理者が必要です" },
          { status: 400 }
        );
      }
    }

    // 権限を更新
    const updateResult = await sql`
      UPDATE users
      SET role = ${newRole}
      WHERE id = ${userIdNum}
      RETURNING id, username, role
    `;

    const updatedUser = updateResult.rows[0];

    return NextResponse.json({
      success: true,
      message: "ユーザー権限を更新しました",
      user: updatedUser,
    });
  } catch (error) {
    console.error("ユーザー権限更新エラー:", error);
    return NextResponse.json(
      { success: false, message: "ユーザー権限の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// ユーザーを削除
export async function DELETE(request: NextRequest) {
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
    // idが数値型であることを確認
    const requestingUserId =
      typeof requestingUser.id === "string"
        ? parseInt(requestingUser.id)
        : requestingUser.id;

    // 管理者のみアクセス可能
    if (requestingUser.role !== "admin") {
      return NextResponse.json(
        { error: "この操作には管理者権限が必要です" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");
    const action = url.searchParams.get("action") || "check";

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ユーザーIDが指定されていません" },
        { status: 400 }
      );
    }

    // 数値に変換
    const userIdNum = parseInt(userId);

    // 対象ユーザーを検索
    const userResult = await sql`
      SELECT id, username, role
      FROM users
      WHERE id = ${userIdNum}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    const targetUser = userResult.rows[0] as DbUser;

    // 自分自身は削除できない
    if (userIdNum === requestingUserId) {
      return NextResponse.json(
        { success: false, message: "自分自身を削除することはできません" },
        { status: 400 }
      );
    }

    // admin権限のユーザーを削除する場合、admin権限のユーザーが他にいるか確認
    if (targetUser.role === "admin") {
      const adminCountResult = await sql`
        SELECT COUNT(*) as count
        FROM users
        WHERE role = 'admin'
      `;

      const adminCount = parseInt(adminCountResult.rows[0].count);
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: "少なくとも1人の管理者が必要です" },
          { status: 400 }
        );
      }
    }

    // データベースからユーザーに割り当てられたタスクを取得
    const result = await sql`
      SELECT * FROM tasks WHERE assigned_to = ${userIdNum}
    `;
    const userTasks = result.rows as Task[];

    // まずタスクの数を確認する
    if (action === "check") {
      // タスクが存在する場合は必ず処理選択モーダルを表示
      if (userTasks.length > 0) {
        const pendingTasks = userTasks.filter(
          (task) => task.status === "pending"
        );
        return NextResponse.json({
          success: false,
          needsAction: true,
          message: "ユーザーのタスクがあります",
          pendingTasksCount: pendingTasks.length,
          totalTasksCount: userTasks.length,
          userId: userId,
          username: targetUser.username,
        });
      }
    }

    // 共有タスクに追加
    if (action === "shareAll") {
      const pendingTasks = userTasks.filter(
        (task) => task.status === "pending"
      );

      try {
        // 未完了タスクを共有タスクとしてマーク
        for (const task of pendingTasks) {
          try {
            // まず単純に割り当て先を変更（これは必ず成功するはず）
            await sql`
              UPDATE tasks
              SET assigned_to = ${requestingUserId}
              WHERE id = ${task.id}
            `;

            // 新しいカラムが存在する場合は更新を試みる
            try {
              await sql`
                UPDATE tasks
                SET 
                  is_shared = true, 
                  shared_at = CURRENT_TIMESTAMP
                WHERE id = ${task.id}
              `;
            } catch (columnError) {
              // is_sharedカラムがない場合はエラーが発生するが無視
              console.error(
                "is_shared/shared_atカラム更新エラー（無視します）:",
                columnError
              );
            }
          } catch (taskError) {
            console.error(`タスクID ${task.id} の更新エラー:`, taskError);
          }
        }
      } catch (shareError) {
        console.error("共有タスク処理エラー:", shareError);
      }
    }

    // action=shareAllの場合は、既に上記で割り当て先を変更したので削除しない
    if (action !== "shareAll") {
      // ユーザーのタスクを削除
      try {
        await sql`
          DELETE FROM tasks WHERE assigned_to = ${userIdNum}
        `;
      } catch (deleteError) {
        console.error("タスク削除エラー:", deleteError);
        // タスク削除エラーでもユーザー削除は続行
      }
    }

    // ユーザーを削除
    const deletedUserResult = await sql`
      DELETE FROM users WHERE id = ${userIdNum}
      RETURNING username
    `;

    const deletedUsername = deletedUserResult.rows[0].username;

    return NextResponse.json({
      success: true,
      message: "ユーザーを削除しました",
      user: {
        id: userId,
        username: deletedUsername,
      },
      tasksHandled:
        action === "shareAll"
          ? "共有タスクに追加しました"
          : "タスクを削除しました",
    });
  } catch (error) {
    console.error("ユーザー削除エラー:", error);
    return NextResponse.json(
      { success: false, message: "ユーザーの削除に失敗しました" },
      { status: 500 }
    );
  }
}
