import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";

// login_idが英数字のみかをチェックする関数
function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

// 新規ユーザー登録API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, login_id, password } = body;

    // サーバー側バリデーション
    if (!username || !login_id || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "ユーザー名、ログインID、パスワードは必須です",
        },
        { status: 400 },
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: "ユーザー名は3文字以上必要です" },
        { status: 400 },
      );
    }

    if (login_id.length < 3) {
      return NextResponse.json(
        { success: false, message: "ログインIDは3文字以上必要です" },
        { status: 400 },
      );
    }

    // ログインIDが英数字のみかチェック
    if (!isAlphanumeric(login_id)) {
      return NextResponse.json(
        { success: false, message: "ログインIDは英数字のみ使用できます" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "パスワードは6文字以上必要です" },
        { status: 400 },
      );
    }

    // パスワード強度のチェック
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (
      !(
        (hasUpperCase && hasLowerCase) ||
        (hasUpperCase && hasNumber) ||
        (hasLowerCase && hasNumber)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "パスワードは英大文字、英小文字、数字のうち少なくとも2種類を組み合わせる必要があります",
        },
        { status: 400 },
      );
    }

    // ユーザー名とログインIDの重複チェック
    const checkUsername = await sql`
      SELECT username FROM users WHERE username = ${username}
    `;

    if (checkUsername.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "このユーザー名は既に使用されています" },
        { status: 400 },
      );
    }

    const checkLoginId = await sql`
      SELECT login_id FROM users WHERE login_id = ${login_id}
    `;

    if (checkLoginId.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "このログインIDは既に使用されています" },
        { status: 400 },
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザーをデータベースに追加
    const result = await sql`
      INSERT INTO users (username, login_id, password, role)
      VALUES (${username}, ${login_id}, ${hashedPassword}, 'member')
      RETURNING id, username, role
    `;

    const newUser = result.rows[0];

    return NextResponse.json({
      success: true,
      message: "ユーザーが登録されました",
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });
  } catch (error) {
    console.error("ユーザー登録エラー:", error);

    // エラーの種類に応じて適切なメッセージを返す
    if (error instanceof Error) {
      if (error.message.includes("duplicate key value")) {
        return NextResponse.json(
          {
            success: false,
            message: "このユーザー名またはログインIDは既に使用されています",
            details: error.message,
          },
          { status: 400 },
        );
      }

      if (error.message.includes("connection")) {
        return NextResponse.json(
          {
            success: false,
            message: "データベースへの接続に失敗しました",
            details: error.message,
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "ユーザー登録に失敗しました",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 },
    );
  }
}
