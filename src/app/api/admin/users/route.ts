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
    console.log(`ユーザーID ${userIdNum} のタスクを確認中...`);
    const result = await sql`
      SELECT * FROM tasks WHERE assigned_to = ${userIdNum}
    `;
    const userTasks = result.rows as Task[];
    console.log(`ユーザーID ${userIdNum} のタスク数: ${userTasks.length}`);

    // まずタスクの数を確認する
    if (action === "check") {
      // タスクが存在する場合は必ず処理選択モーダルを表示
      if (userTasks.length > 0) {
        const pendingTasks = userTasks.filter(
          (task) => task.status === "pending" || task.status === "in_progress"
        );
        console.log(`未完了のタスク数: ${pendingTasks.length}`);
        return NextResponse.json({
          success: false,
          needsAction: true,
          message: "ユーザーに未完了のタスクがあります",
          pendingTasksCount: pendingTasks.length,
          totalTasksCount: userTasks.length,
          userId: userId,
          username: targetUser.username,
        });
      }
    }

    console.log(`アクション: ${action}, 削除前の処理を開始`);

    try {
      // データベーストランザクションを開始
      await sql`BEGIN`;

      // 外部キー制約を持つテーブルからの関連データ削除

      // 1. daily_logsテーブルのデータを削除
      try {
        console.log("daily_logsテーブルからユーザーデータを削除...");
        await sql`DELETE FROM daily_logs WHERE user_id = ${userIdNum}`;
      } catch (e) {
        console.error("daily_logs削除エラー:", e);
        // エラーが発生してもトランザクション内で続行
      }

      // 2. tasksテーブルの作成者を管理者に更新
      try {
        console.log("タスクテーブルの作成者を更新...");
        await sql`
          UPDATE tasks 
          SET created_by = ${requestingUserId} 
          WHERE created_by = ${userIdNum} AND assigned_to <> ${userIdNum}
        `;
      } catch (e) {
        console.error("tasks作成者更新エラー:", e);
        // エラーが発生してもトランザクション内で続行
      }

      // 3. shared_itemsテーブルのユーザーデータを削除
      try {
        console.log("shared_itemsテーブルからユーザーデータを削除...");
        await sql`DELETE FROM shared_items WHERE created_by = ${userIdNum}`;
      } catch (e) {
        console.error("shared_items削除エラー:", e);
        // エラーが発生してもトランザクション内で続行
      }

      // 共有タスクへの変換または削除を実行
      if (action === "shareAll") {
        // 未完了のタスクを特定
        const pendingTasks = userTasks.filter(
          (task) => task.status === "pending" || task.status === "in_progress"
        );

        console.log(`${pendingTasks.length}件のタスクを共有タスクに変換中...`);

        // 各タスクを処理
        for (const task of pendingTasks) {
          try {
            // タスクの担当者を管理者に変更し、共有タスクとしてマーク
            await sql`
              UPDATE tasks
              SET 
                assigned_to = ${requestingUserId},
                is_shared = true,
                shared_at = CURRENT_TIMESTAMP
              WHERE id = ${task.id}
            `;
          } catch (taskUpdateError) {
            console.error(`タスクID ${task.id} の更新エラー:`, taskUpdateError);
            throw taskUpdateError; // トランザクションを失敗させる
          }
        }

        // 完了済みのタスクは削除
        const completedTasks = userTasks.filter(
          (task) => task.status === "completed"
        );

        if (completedTasks.length > 0) {
          console.log(`${completedTasks.length}件の完了済みタスクを削除中...`);

          try {
            // 各タスクを個別に削除
            for (const task of completedTasks) {
              await sql`DELETE FROM tasks WHERE id = ${task.id}`;
            }
          } catch (deleteError) {
            console.error("完了済みタスク削除エラー:", deleteError);
            // 続行（タスク削除のエラーは無視）
          }
        }
      } else {
        // すべてのタスクを削除
        console.log(`ユーザーID ${userIdNum} のすべてのタスクを削除中...`);
        try {
          await sql`DELETE FROM tasks WHERE assigned_to = ${userIdNum}`;
        } catch (deleteError) {
          console.error("タスク削除エラー:", deleteError);
          throw deleteError; // トランザクションを失敗させる
        }
      }

      // ユーザーを削除
      console.log(`ユーザーID ${userIdNum} を削除中...`);
      const deletedUserResult = await sql`
        DELETE FROM users WHERE id = ${userIdNum}
        RETURNING username
      `;

      if (deletedUserResult.rows.length === 0) {
        throw new Error("ユーザー削除に失敗しました");
      }

      const deletedUsername = deletedUserResult.rows[0].username;

      // トランザクションをコミット
      await sql`COMMIT`;

      console.log(`ユーザー ${deletedUsername} (ID: ${userIdNum}) を削除完了`);

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
    } catch (transactionError) {
      // エラーが発生した場合はロールバック
      console.error("トランザクションエラー:", transactionError);
      try {
        await sql`ROLLBACK`;
        console.log("トランザクションをロールバックしました");
      } catch (rollbackError) {
        console.error("ロールバックエラー:", rollbackError);
      }

      return NextResponse.json(
        {
          success: false,
          message: "ユーザーの削除に失敗しました",
          error:
            transactionError instanceof Error
              ? transactionError.message
              : "不明なエラー",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("ユーザー削除処理エラー:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ユーザーの削除に失敗しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  }
}
