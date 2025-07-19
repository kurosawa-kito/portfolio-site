import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";

// 共有ノートのインターフェイス定義
interface SharedNote {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  created_by_username: string;
}

// 共有ノートのモックデータ
const sharedNotes: SharedNote[] = [
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
export async function GET(request: NextRequest) {
  try {
    // ユーザー情報を取得（通常のx-userヘッダーとBase64エンコードされたx-user-base64ヘッダーの両方をサポート）
    let userStr = request.headers.get("x-user");
    const userBase64 = request.headers.get("x-user-base64");

    // Base64エンコードされたユーザー情報を優先的に使用
    if (userBase64) {
      try {
        // Base64からデコード (サーバーサイドではBufferを使用)
        const decodedStr = Buffer.from(userBase64, "base64").toString("utf-8");

        // UTF-8エンコードされたURLエンコード文字列かどうかをチェックして適切に処理
        try {
          if (decodedStr.includes("%")) {
            // URLエンコード文字列の場合はデコード
            userStr = decodeURIComponent(decodedStr);
          } else {
            // 通常の文字列の場合はそのまま使用
            userStr = decodedStr;
          }
        } catch (decodeErr) {
          // デコードエラーの場合は元の文字列を使用
          userStr = decodedStr;
        }
      } catch (e) {
        console.error("Base64デコードエラー:", e);
        return NextResponse.json(
          { error: "ユーザー情報のデコードに失敗しました" },
          { status: 400 },
        );
      }
    }

    if (!userStr) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = JSON.parse(userStr) as User;

    // 共有ノート一覧を取得して返す
    return NextResponse.json(sharedNotes);
  } catch (error) {
    console.error("共有ノート取得エラー:", error);
    return NextResponse.json(
      { error: "共有ノートの取得に失敗しました" },
      { status: 500 },
    );
  }
}

// 共有ノートを作成するAPI
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    // ユーザー情報を取得（通常のx-userヘッダーとBase64エンコードされたx-user-base64ヘッダーの両方をサポート）
    let userStr = request.headers.get("x-user");
    const userBase64 = request.headers.get("x-user-base64");

    // Base64エンコードされたユーザー情報を優先的に使用
    if (userBase64) {
      try {
        // Base64からデコード (サーバーサイドではBufferを使用)
        const decodedStr = Buffer.from(userBase64, "base64").toString("utf-8");

        // UTF-8エンコードされたURLエンコード文字列かどうかをチェックして適切に処理
        try {
          if (decodedStr.includes("%")) {
            // URLエンコード文字列の場合はデコード
            userStr = decodeURIComponent(decodedStr);
          } else {
            // 通常の文字列の場合はそのまま使用
            userStr = decodedStr;
          }
        } catch (decodeErr) {
          // デコードエラーの場合は元の文字列を使用
          userStr = decodedStr;
        }
      } catch (e) {
        console.error("Base64デコードエラー:", e);
        return NextResponse.json(
          { error: "ユーザー情報のデコードに失敗しました" },
          { status: 400 },
        );
      }
    }

    if (!userStr) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = JSON.parse(userStr) as User;

    // 新しいノートを作成
    const newNote: SharedNote = {
      id: `note-${Date.now()}`,
      content,
      created_by: String(user.id),
      created_by_username: user.username,
      created_at: new Date().toISOString(),
    };

    // ノート配列の先頭に追加（最新のノートが最初に表示されるように）
    sharedNotes.unshift(newNote);

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("共有ノート追加エラー:", error);
    return NextResponse.json(
      { error: "共有ノートの追加に失敗しました" },
      { status: 500 },
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
        { status: 400 },
      );
    }

    // ユーザー情報を取得（通常のx-userヘッダーとBase64エンコードされたx-user-base64ヘッダーの両方をサポート）
    let userStr = request.headers.get("x-user");
    const userBase64 = request.headers.get("x-user-base64");

    // Base64エンコードされたユーザー情報を優先的に使用
    if (userBase64) {
      try {
        // Base64からデコード (サーバーサイドではBufferを使用)
        const decodedStr = Buffer.from(userBase64, "base64").toString("utf-8");

        // UTF-8エンコードされたURLエンコード文字列かどうかをチェックして適切に処理
        try {
          if (decodedStr.includes("%")) {
            // URLエンコード文字列の場合はデコード
            userStr = decodeURIComponent(decodedStr);
          } else {
            // 通常の文字列の場合はそのまま使用
            userStr = decodedStr;
          }
        } catch (decodeErr) {
          // デコードエラーの場合は元の文字列を使用
          userStr = decodedStr;
        }
      } catch (e) {
        console.error("Base64デコードエラー:", e);
        return NextResponse.json(
          { error: "ユーザー情報のデコードに失敗しました" },
          { status: 400 },
        );
      }
    }

    if (!userStr) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = JSON.parse(userStr) as User;

    // 削除対象のノートを検索
    const noteIndex = sharedNotes.findIndex((note) => note.id === id);
    if (noteIndex === -1) {
      return NextResponse.json(
        { error: "指定されたノートが見つかりません" },
        { status: 404 },
      );
    }

    const note = sharedNotes[noteIndex];

    // 作成者または管理者のみ削除可能
    if (note.created_by !== String(user.id) && user.role !== "admin") {
      return NextResponse.json(
        { error: "このノートを削除する権限がありません" },
        { status: 403 },
      );
    }

    // ノートを削除
    sharedNotes.splice(noteIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("共有ノート削除エラー:", error);
    return NextResponse.json(
      { error: "共有ノートの削除に失敗しました" },
      { status: 500 },
    );
  }
}
