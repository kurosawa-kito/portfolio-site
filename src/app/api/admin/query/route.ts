import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  const { query } = await request.json();
  // 簡易的なAI処理（実際にはNLPを活用）
  if (query.includes("進捗")) {
    const { rows } =
      await sql`SELECT * FROM tasks WHERE status != 'completed';`;
    const result = rows
      .map((task) => `${task.title}: ${task.status}`)
      .join("\n");
    return Response.json({ result });
  }
  return Response.json({ result: "未実装のクエリです" });
}
