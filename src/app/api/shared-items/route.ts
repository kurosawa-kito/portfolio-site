import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  const { title, content, created_by } = await request.json();
  await sql`
    INSERT INTO shared_items (title, content, created_by)
    VALUES (${title}, ${content}, ${created_by});
  `;
  return Response.json({ success: true });
}
