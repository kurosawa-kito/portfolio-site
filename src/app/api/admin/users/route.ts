import { NextRequest, NextResponse } from "next/server";
import { users } from "../../auth/login/route";
import { User } from "@/types/user";
import { tasks } from "../../tasks/route";
import { sharedTasks } from "../../shared/tasks/route";

// ユーザー一覧を取得
export async function GET(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const requestingUser = JSON.parse(userHeader) as User;

    // 管理者のみアクセス可能
    if (requestingUser.role !== "admin") {
      return NextResponse.json(
        { error: "この操作には管理者権限が必要です" },
        { status: 403 }
      );
    }

    // パスワードを除外したユーザー情報を返す
    const safeUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      role: user.role,
    }));

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
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const requestingUser = JSON.parse(userHeader) as User;

    // 管理者のみアクセス可能
    if (requestingUser.role !== "admin") {
      return NextResponse.json(
        { error: "この操作には管理者権限が必要です" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, newRole } = body;

    // 対象ユーザーを検索
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // 自分自身の権限は変更できない
    if (userId === requestingUser.id) {
      return NextResponse.json(
        { success: false, message: "自分自身の権限は変更できません" },
        { status: 400 }
      );
    }

    // admin権限を外す場合、admin権限のユーザーが他にいるか確認
    if (users[userIndex].role === "admin" && newRole !== "admin") {
      const adminCount = users.filter((user) => user.role === "admin").length;
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: "少なくとも1人の管理者が必要です" },
          { status: 400 }
        );
      }
    }

    // 権限を更新
    users[userIndex].role = newRole;

    return NextResponse.json({
      success: true,
      message: "ユーザー権限を更新しました",
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        role: users[userIndex].role,
      },
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
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const requestingUser = JSON.parse(userHeader) as User;

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

    // 対象ユーザーを検索
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // 自分自身は削除できない
    if (userId === requestingUser.id) {
      return NextResponse.json(
        { success: false, message: "自分自身を削除することはできません" },
        { status: 400 }
      );
    }

    // admin権限のユーザーを削除する場合、admin権限のユーザーが他にいるか確認
    if (users[userIndex].role === "admin") {
      const adminCount = users.filter((user) => user.role === "admin").length;
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: "少なくとも1人の管理者が必要です" },
          { status: 400 }
        );
      }
    }

    // ユーザーに割り当てられたタスクを検索
    const userTasks = tasks.filter((task) => task.assigned_to === userId);

    // まずタスクの数を確認する
    if (action === "check") {
      // タスクが存在する場合は必ず処理選択モーダルを表示
      if (userTasks.length > 0) {
        const pendingTasks = userTasks.filter(
          (task: any) => task.status === "pending"
        );
        return NextResponse.json({
          success: false,
          needsAction: true,
          message: "ユーザーのタスクがあります",
          pendingTasksCount: pendingTasks.length,
          totalTasksCount: userTasks.length,
          userId: userId,
          username: users[userIndex].username,
        });
      }
    }

    // 共有タスクに追加
    if (action === "shareAll") {
      const pendingTasks = userTasks.filter(
        (task: any) => task.status === "pending"
      );

      // 未完了タスクを共有タスクに追加
      for (const task of pendingTasks as any[]) {
        const newSharedTask = {
          id: `shared-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: `[元ユーザー: ${users[userIndex].username}] ${task.title}`,
          description: task.description,
          due_date: task.due_date,
          priority: task.priority,
          created_at: new Date().toISOString(),
          created_by: requestingUser.id,
          created_by_username: requestingUser.username,
          status: "pending", // 必須フィールド
        };

        sharedTasks.push(newSharedTask);
      }
    }

    // ユーザーのすべてのタスクを削除（共有タスクに追加した後でも削除）
    const taskIndicesToRemove = [];
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].assigned_to === userId) {
        taskIndicesToRemove.push(i);
      }
    }

    // 降順でインデックスを削除（昇順で削除すると、後続のインデックスがずれる）
    for (let i = taskIndicesToRemove.length - 1; i >= 0; i--) {
      tasks.splice(taskIndicesToRemove[i], 1);
    }

    // ユーザーを削除
    const deletedUser = users.splice(userIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: "ユーザーを削除しました",
      user: {
        id: deletedUser.id,
        username: deletedUser.username,
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
