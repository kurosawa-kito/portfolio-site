import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { sharedTasks, getUserAddedTasks, updateUserAddedTasks } from "../route";

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

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // タスクの存在確認
    const taskIndex = sharedTasks.findIndex((task) => task.id === taskId);

    console.log("動的ルート - タスク検索結果:", {
      taskId,
      allTaskIds: sharedTasks.map((t) => t.id),
      foundIndex: taskIndex,
    });

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "指定されたタスクが見つかりません" },
        { status: 404 }
      );
    }

    // 管理者または作成者のみタスク削除可能
    if (
      user.role !== "admin" &&
      sharedTasks[taskIndex].created_by !== user.id
    ) {
      return NextResponse.json(
        { error: "このタスクを削除する権限がありません" },
        { status: 403 }
      );
    }

    // タスクを削除
    const deletedTask = sharedTasks.splice(taskIndex, 1)[0];

    // ユーザーの追加済みタスク一覧からも削除
    const userAddedTasks = getUserAddedTasks();
    const updatedUserAddedTasks = userAddedTasks.map((item) => {
      return {
        ...item,
        taskIds: item.taskIds.filter((id) => id !== taskId),
      };
    });
    updateUserAddedTasks(updatedUserAddedTasks);

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
