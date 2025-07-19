import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { sharedTasks } from "../../tasks/route";

// 共有タスクの削除APIエンドポイント
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const taskId = params.id;

    // デバッグログ
    console.log("削除APIが呼ばれました", {
      taskId,
      params,
      url: request.url,
    });

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;
    console.log("ユーザー情報:", user);

    // タスクの存在確認
    const taskIndex = sharedTasks.findIndex((task) => task.id === taskId);
    console.log("タスク検索結果:", {
      taskId,
      taskIndex,
      tasksCount: sharedTasks.length,
      sharedTaskIds: sharedTasks.map((t) => t.id),
    });

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "指定されたタスクが見つかりません", taskId },
        { status: 404 },
      );
    }

    // タスクを削除
    const deletedTask = sharedTasks.splice(taskIndex, 1)[0];

    // 共有タスクが削除されたことをログに記録
    console.log(`共有タスク "${deletedTask.title}" が削除されました`);

    return NextResponse.json(
      { message: "共有タスクを削除しました", deletedTask },
      { status: 200 },
    );
  } catch (error) {
    console.error("共有タスク削除エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの削除に失敗しました" },
      { status: 500 },
    );
  }
}
