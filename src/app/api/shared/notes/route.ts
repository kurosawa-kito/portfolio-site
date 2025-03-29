import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";

// 共有ノートのモックデータ
const sharedNotes: {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  created_by_username: string;
}[] = [
  {
    id: "note1",
    content: "全体会議は毎週金曜日の15:00からです。",
    created_at: "2023-05-01T10:00:00Z",
    created_by: "user1",
    created_by_username: "管理者",
  },
  {
    id: "note2",
    content: "新しいプロジェクトの資料は共有フォルダにアップロードしました。",
    created_at: "2023-05-02T14:30:00Z",
    created_by: "user2",
    created_by_username: "ユーザー2",
  },
];

// 共有ノート一覧を取得するAPI
export async function GET() {
  try {
    return NextResponse.json(sharedNotes, { status: 200 });
  } catch (error) {
    console.error("共有ノート取得エラー:", error);
    return NextResponse.json(
      { error: "共有ノートの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 共有ノートを作成するAPI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // 新しいノートを作成
    const newNote = {
      id: `note${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      created_by: user.id,
      created_by_username: user.username,
    };

    // ノート一覧に追加
    sharedNotes.unshift(newNote);

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("共有ノート作成エラー:", error);
    return NextResponse.json(
      { error: "共有ノートの作成に失敗しました" },
      { status: 500 }
    );
  }
}

// 共有ノートを削除するAPI
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ノートIDが指定されていません" },
        { status: 400 }
      );
    }

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // 削除対象のノートを検索
    const noteIndex = sharedNotes.findIndex((note) => note.id === id);
    if (noteIndex === -1) {
      return NextResponse.json(
        { error: "指定されたノートが見つかりません" },
        { status: 404 }
      );
    }

    const note = sharedNotes[noteIndex];

    // 作成者または管理者のみ削除可能
    if (note.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "このノートを削除する権限がありません" },
        { status: 403 }
      );
    }

    // ノートを削除
    sharedNotes.splice(noteIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("共有ノート削除エラー:", error);
    return NextResponse.json(
      { error: "共有ノートの削除に失敗しました" },
      { status: 500 }
    );
  }
}
