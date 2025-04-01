import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// login_idが英数字のみかをチェックする関数
function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login_id, password } = body;

    // login_idが英数字のみかチェック
    if (!isAlphanumeric(login_id)) {
      return NextResponse.json(
        { success: false, message: "ログインIDは英数字のみ使用できます" },
        { status: 400 }
      );
    }

    // データベースからユーザーを検索
    const result = await sql`
      SELECT id, username, password, role
      FROM users
      WHERE login_id = ${login_id}
    `;

    // ユーザーが見つかってパスワードが一致する場合
    if (result.rows.length > 0 && result.rows[0].password === password) {
      const user = result.rows[0];

      // Success login
      return NextResponse.json({
        success: true,
        userId: user.id,
        username: user.username,
        role: user.role,
      });
    } else {
      // Failed login
      return NextResponse.json(
        {
          success: false,
          message: "ログインIDまたはパスワードが正しくありません",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
