import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const { rows } = await sql`SELECT id, username, role FROM users;`;
    return Response.json({
      success: true,
      users: rows,
    });
  } catch (error) {
    console.error("ユーザー取得エラー:", error);
    return Response.json(
      {
        success: false,
        message: "ユーザー情報の取得に失敗しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  }
}
