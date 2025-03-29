import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import bcrypt from "bcrypt";

// ユーザーデータのモック
export const users: {
  id: string;
  username: string;
  password: string; // 実際にはハッシュ化したものを保存
  role: string;
  created_at: string;
}[] = [
  {
    id: "user1",
    username: "admin",
    password: "$2b$10$IlUL51ABGI5.LVhD6Y/y7.e..pqQrYUOkiFreK4SZgN7vx1KBqIne", // admin123
    role: "admin",
    created_at: "2023-04-01T10:00:00Z",
  },
  {
    id: "user2",
    username: "user",
    password: "$2b$10$NwzbXY2Jn8UqBK9aNCR0e.4cjW3xHYxEAFjK9vr8MUG/f2mWOHiGy", // user123
    role: "member",
    created_at: "2023-04-02T11:30:00Z",
  },
];

// ユーザー一覧を取得するエンドポイント (管理者のみ)
export async function GET(request: NextRequest) {
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

    // パスワードを除外したユーザー一覧を返す
    const safeUsers = users.map(({ password, ...user }) => user);
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("ユーザー一覧取得エラー:", error);
    return NextResponse.json(
      { error: "ユーザー一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 新規ユーザーを追加するエンドポイント (管理者のみ)
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

    // リクエストボディからデータを取得
    const body = await request.json();
    const { username, password, role } = body;

    // 必須項目の検証
    if (!username || !password) {
      return NextResponse.json(
        { error: "ユーザー名とパスワードは必須です" },
        { status: 400 }
      );
    }

    // ユーザー名の重複チェック
    if (users.some((u) => u.username === username)) {
      return NextResponse.json(
        { error: "このユーザー名は既に使用されています" },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新しいユーザーを作成
    const newUser = {
      id: `user${Date.now()}`,
      username,
      password: hashedPassword,
      role: role || "member", // デフォルトは一般メンバー
      created_at: new Date().toISOString(),
    };

    // ユーザー配列に追加
    users.push(newUser);

    // パスワードを除外したユーザー情報を返す
    const { password: _, ...safeUser } = newUser;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error("ユーザー作成エラー:", error);
    return NextResponse.json(
      { error: "ユーザーの作成に失敗しました" },
      { status: 500 }
    );
  }
}
