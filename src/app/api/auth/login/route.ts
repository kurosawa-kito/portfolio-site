import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// 環境変数を読み込む
dotenv.config({ path: ".env.local" });

// login_idが英数字のみかをチェックする関数
function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login_id, password } = body;

    console.log(`ログイン試行: login_id=${login_id}`);

    // login_idが英数字のみかチェック
    if (!isAlphanumeric(login_id)) {
      console.log("バリデーションエラー: ログインIDが英数字のみではありません");
      return NextResponse.json(
        { success: false, message: "ログインIDは英数字のみ使用できます" },
        { status: 400 }
      );
    }

    // データベースからユーザーを検索
    console.log(
      "データベースへのクエリ実行: " +
        `SELECT id, username, password, role FROM users WHERE login_id = '${login_id}'`
    );

    const result = await sql`
      SELECT id, username, password, role
      FROM users
      WHERE login_id = ${login_id}
    `;

    console.log(
      `クエリ結果: ${result.rows.length}件のレコードが見つかりました`
    );

    if (result.rows.length > 0) {
      console.log(
        `ユーザー見つかりました: username=${result.rows[0].username}, id=${result.rows[0].id}`
      );
      console.log(`DB内のパスワードハッシュ: ${result.rows[0].password}`);

      // bcryptを使用してパスワードを検証
      let isPasswordMatch = false;

      try {
        // bcryptハッシュを使用している場合
        if (
          result.rows[0].password.startsWith("$2b$") ||
          result.rows[0].password.startsWith("$2a$")
        ) {
          isPasswordMatch = await bcrypt.compare(
            password,
            result.rows[0].password
          );
        } else {
          // 移行期間中の互換性のため、プレーンテキストでの比較も許可（一時的な対応）
          isPasswordMatch = result.rows[0].password === password;
        }
      } catch (err) {
        console.error("パスワード検証エラー:", err);
        isPasswordMatch = false;
      }

      console.log(`パスワード一致: ${isPasswordMatch}`);

      if (isPasswordMatch) {
        const user = result.rows[0];

        // Success login
        console.log(`ログイン成功: userId=${user.id}, role=${user.role}`);
        return NextResponse.json({
          success: true,
          userId: user.id,
          username: user.username,
          role: user.role,
        });
      } else {
        console.log("ログイン失敗: パスワードが一致しません");
      }
    } else {
      console.log(`ユーザーが見つかりません: login_id=${login_id}`);
    }

    // Failed login
    return NextResponse.json(
      {
        success: false,
        message: "ログインIDまたはパスワードが正しくありません",
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "サーバーエラーが発生しました",
        error: error.toString(),
      },
      { status: 500 }
    );
  }
}
