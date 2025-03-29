import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "ユーザーIDが指定されていません",
        },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.assigned_to,
        t.created_by,
        u.username as assigned_to_username,
        c.username as created_by_username
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.assigned_to = ${userId}
      ORDER BY t.due_date ASC;
    `;

    return Response.json({
      success: true,
      tasks: rows,
    });
  } catch (error) {
    console.error("タスク取得エラー:", error);
    return Response.json(
      {
        success: false,
        message: "タスク情報の取得に失敗しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  }
}
