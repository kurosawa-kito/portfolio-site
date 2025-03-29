import { NextRequest, NextResponse } from "next/server";
import { users } from "../login/route";

// 新規ユーザー登録API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // ユーザー名の重複チェック
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "このユーザー名は既に使用されています" },
        { status: 400 }
      );
    }

    // 新規ユーザーを作成（デフォルトで一般ユーザー権限）
    const newUser = {
      id: `user${Date.now()}`, // 一意のIDを生成
      username,
      password,
      role: "user", // デフォルトは一般ユーザー
    };

    // ユーザー配列に追加
    users.push(newUser);

    return NextResponse.json({
      success: true,
      message: "ユーザーが登録されました",
      userId: newUser.id,
      role: newUser.role,
    });
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラー" },
      { status: 500 }
    );
  }
}
