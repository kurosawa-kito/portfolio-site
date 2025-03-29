import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { users } from "../route";

// 特定のユーザーを削除するエンドポイント (管理者のみ)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // ユーザー情報を取得し、管理者かどうかをチェック
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "この操作には管理者権限が必要です" },
        { status: 403 }
      );
    }

    // 削除対象のユーザーが現在のユーザー（自分自身）かチェック
    if (userId === user.id) {
      return NextResponse.json(
        { error: "自分自身を削除することはできません" },
        { status: 400 }
      );
    }

    // 削除対象ユーザーが存在するかチェック
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "指定されたユーザーは存在しません" },
        { status: 404 }
      );
    }

    // 削除対象ユーザーが管理者の場合、確認
    if (users[userIndex].role === "admin") {
      // 確認処理は実際にはフロントエンドで行うべき
      console.warn("管理者ユーザーを削除しています:", userId);
    }

    // ユーザーを配列から削除
    const deletedUser = users.splice(userIndex, 1)[0];
    const { password, ...safeDeletedUser } = deletedUser;

    return NextResponse.json({
      message: "ユーザーを削除しました",
      deletedUser: safeDeletedUser,
    });
  } catch (error) {
    console.error("ユーザー削除エラー:", error);
    return NextResponse.json(
      { error: "ユーザーの削除に失敗しました" },
      { status: 500 }
    );
  }
}
