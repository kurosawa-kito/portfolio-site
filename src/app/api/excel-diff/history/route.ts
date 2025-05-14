import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";

// 履歴の一覧を取得
export async function GET(req: NextRequest) {
  try {
    // クエリパラメータの取得
    const searchQuery = req.nextUrl.searchParams.get("query") || "";

    let sqlQuery;
    const params = [];

    if (searchQuery) {
      // 検索クエリがある場合はファイル名で絞り込み
      sqlQuery = sql`
        SELECT * FROM excel_history
        WHERE name ILIKE ${`%${searchQuery}%`}
        ORDER BY uploaded_at DESC
      `;
    } else {
      // 検索クエリがない場合は全件取得
      sqlQuery = sql`
        SELECT * FROM excel_history
        ORDER BY uploaded_at DESC
      `;
    }

    const { rows } = await sqlQuery;

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("履歴の取得に失敗しました", error);
    return NextResponse.json(
      { error: "履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 履歴を追加
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, path, size } = body;

    // 必須項目の検証
    if (!name || !path || !size) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // UUIDの生成
    const id = body.id || uuidv4();

    // データベースに保存
    await sql`
      INSERT INTO excel_history (id, name, path, size)
      VALUES (${id}, ${name}, ${path}, ${size})
    `;

    return NextResponse.json(
      { id, message: "履歴を追加しました" },
      { status: 201 }
    );
  } catch (error) {
    console.error("履歴の追加に失敗しました", error);
    return NextResponse.json(
      { error: "履歴の追加に失敗しました" },
      { status: 500 }
    );
  }
}

// 履歴を削除
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "IDが指定されていません" },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM excel_history
      WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: "履歴を削除しました" },
      { status: 200 }
    );
  } catch (error) {
    console.error("履歴の削除に失敗しました", error);
    return NextResponse.json(
      { error: "履歴の削除に失敗しました" },
      { status: 500 }
    );
  }
}
