import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";

// ファイルを取得
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "IDが指定されていません" },
        { status: 400 },
      );
    }

    const { rows } = await sql`
      SELECT * FROM excel_files
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "ファイルが見つかりません" },
        { status: 404 },
      );
    }

    // ファイルデータをBase64エンコードして返す
    const fileData = rows[0].file_data;
    const base64Data = Buffer.from(fileData).toString("base64");

    return NextResponse.json(
      {
        id: rows[0].id,
        name: rows[0].name,
        uploaded_at: rows[0].uploaded_at,
        file_data: base64Data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ファイルの取得に失敗しました", error);
    return NextResponse.json(
      { error: "ファイルの取得に失敗しました" },
      { status: 500 },
    );
  }
}

// ファイルを保存
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルが指定されていません" },
        { status: 400 },
      );
    }

    // ファイルデータをBase64文字列に変換
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // UUIDの生成
    const id = uuidv4();

    // データベースに保存
    await sql`
      INSERT INTO excel_files (id, name, file_data)
      VALUES (${id}, ${file.name}, ${base64})
    `;

    return NextResponse.json(
      { id, name: file.name, message: "ファイルを保存しました" },
      { status: 201 },
    );
  } catch (error) {
    console.error("ファイルの保存に失敗しました", error);
    return NextResponse.json(
      { error: "ファイルの保存に失敗しました" },
      { status: 500 },
    );
  }
}

// ファイルを削除
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "IDが指定されていません" },
        { status: 400 },
      );
    }

    await sql`
      DELETE FROM excel_files
      WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: "ファイルを削除しました" },
      { status: 200 },
    );
  } catch (error) {
    console.error("ファイルの削除に失敗しました", error);
    return NextResponse.json(
      { error: "ファイルの削除に失敗しました" },
      { status: 500 },
    );
  }
}
