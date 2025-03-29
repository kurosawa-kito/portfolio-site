import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { tasks } from "../../tasks/route";

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

    // URLからユーザーIDを取得
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ユーザーIDが指定されていません" },
        { status: 400 }
      );
    }

    // 指定されたユーザーのタスクをフィルタリング
    const userTasks = tasks.filter((task) => task.assigned_to === userId);

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
