import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { users } from "../route";
import bcrypt from "bcrypt";

// 複数ユーザーを一括追加するエンドポイント (管理者のみ)
export async function POST(request: NextRequest) {
  try {
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

    // リクエストボディから複数ユーザーのデータを取得
    const body = await request.json();
    const { users: newUsers } = body;

    if (!newUsers || !Array.isArray(newUsers) || newUsers.length === 0) {
      return NextResponse.json(
        { error: "有効なユーザーデータが提供されていません" },
        { status: 400 }
      );
    }

    // 各ユーザーの必須項目を検証
    const invalidUsers = newUsers.filter((u) => !u.username || !u.password);
    if (invalidUsers.length > 0) {
      return NextResponse.json(
        {
          error: "すべてのユーザーにユーザー名とパスワードを設定してください",
          invalidCount: invalidUsers.length,
        },
        { status: 400 }
      );
    }

    // 既存のユーザー名と比較して重複チェック
    const existingUsernames = users.map((u) => u.username);
    const duplicateUsers = newUsers.filter((u) =>
      existingUsernames.includes(u.username)
    );
    if (duplicateUsers.length > 0) {
      return NextResponse.json(
        {
          error: "既に使用されているユーザー名が含まれています",
          duplicateUsernames: duplicateUsers.map((u) => u.username),
        },
        { status: 400 }
      );
    }

    // すべてのユーザーを追加
    const addedUsers = [];
    for (const newUser of newUsers) {
      // パスワードをハッシュ化
      const hashedPassword = await bcrypt.hash(newUser.password, 10);

      // 新しいユーザーオブジェクトを作成
      const userToAdd = {
        id: `user${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        username: newUser.username,
        password: hashedPassword,
        role: newUser.role || "member", // デフォルトは一般メンバー
        created_at: new Date().toISOString(),
      };

      // ユーザー配列に追加
      users.push(userToAdd);

      // パスワードを除外したユーザー情報を返す配列に追加
      const { password, ...safeUser } = userToAdd;
      addedUsers.push(safeUser);
    }

    return NextResponse.json(
      {
        message: `${addedUsers.length}人のユーザーを追加しました`,
        addedUsers,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("一括ユーザー追加エラー:", error);
    return NextResponse.json(
      { error: "ユーザーの一括追加に失敗しました" },
      { status: 500 }
    );
  }
}
