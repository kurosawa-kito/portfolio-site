import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";

export async function POST() {
  // mainブランチの本番環境では実行しない
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_GIT_COMMIT_REF === "main"
  ) {
    return Response.json(
      {
        success: false,
        message: "本番環境のmainブランチではシードが無効化されています",
      },
      { status: 403 }
    );
  }

  try {
    // 管理者ユーザーのパスワードをハッシュ化
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    // 既存のユーザーを削除
    await sql`DELETE FROM users;`;

    // 管理者ユーザーを追加
    await sql`
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@example.com', ${adminPassword}, 'admin');
    `;

    // 一般ユーザーを追加
    await sql`
      INSERT INTO users (username, email, password, role)
      VALUES ('user', 'user@example.com', ${userPassword}, 'member');
    `;

    // サンプルプロジェクトを追加
    await sql`
      INSERT INTO projects (name, description, start_date, end_date)
      VALUES ('サンプルプロジェクト', 'これはサンプルプロジェクトです', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month');
    `;

    return Response.json({
      success: true,
      message: "シードデータが正常に作成されました",
    });
  } catch (error) {
    console.error("シードデータの作成中にエラーが発生しました:", error);
    return Response.json(
      { success: false, message: "シードデータの作成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
