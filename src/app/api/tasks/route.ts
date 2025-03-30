import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";

// 共有タスクのインターフェース定義
interface SharedTask {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  created_at: string;
  created_by: string;
  created_by_username: string;
}

// ユーザータスクのインターフェース定義
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  priority: string;
  assigned_to: string;
  assigned_to_username: string;
  created_by: string;
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

// モックタスクデータ
export const tasks: Task[] = [
  {
    id: "task1",
    title: "ダッシュボード開発",
    description: "新しいダッシュボード機能の実装",
    status: "pending",
    due_date: "2023-05-15",
    priority: "high",
    assigned_to: "user1",
    assigned_to_username: "管理者",
    created_by: "user1",
    created_by_username: "管理者",
    created_at: "2023-05-01T10:00:00Z",
    updated_at: "2023-05-01T10:00:00Z",
  },
  {
    id: "task2",
    title: "バグ修正",
    description: "ログイン機能のバグ修正",
    status: "completed",
    due_date: "2023-05-05",
    priority: "medium",
    assigned_to: "user2",
    assigned_to_username: "ユーザー2",
    created_by: "user1",
    created_by_username: "管理者",
    created_at: "2023-05-02T10:00:00Z",
    updated_at: "2023-05-03T15:30:00Z",
  },
  {
    id: "task3",
    title: "API設計",
    description: "新機能のためのAPI設計",
    status: "pending",
    due_date: "2023-05-20",
    priority: "medium",
    assigned_to: "user2",
    assigned_to_username: "ユーザー2",
    created_by: "user2",
    created_by_username: "ユーザー2",
    created_at: "2023-05-03T09:00:00Z",
    updated_at: "2023-05-03T09:00:00Z",
  },
  {
    id: "task4",
    title: "フロントエンド開発",
    description: "ユーザーインターフェースの改善",
    status: "pending",
    due_date: "2023-06-10",
    priority: "high",
    assigned_to: "user3",
    assigned_to_username: "dev1",
    created_by: "user1",
    created_by_username: "管理者",
    created_at: "2023-05-05T11:00:00Z",
    updated_at: "2023-05-05T11:00:00Z",
  },
  {
    id: "task5",
    title: "データベース最適化",
    description: "パフォーマンス向上のためのクエリ最適化",
    status: "pending",
    due_date: "2023-06-15",
    priority: "medium",
    assigned_to: "user3",
    assigned_to_username: "dev1",
    created_by: "user3",
    created_by_username: "dev1",
    created_at: "2023-05-07T14:00:00Z",
    updated_at: "2023-05-07T14:00:00Z",
  },
  {
    id: "task6",
    title: "セキュリティ監査",
    description: "セキュリティの脆弱性チェック",
    status: "pending",
    due_date: "2023-06-20",
    priority: "high",
    assigned_to: "user4",
    assigned_to_username: "dev2",
    created_by: "user1",
    created_by_username: "管理者",
    created_at: "2023-05-10T09:30:00Z",
    updated_at: "2023-05-10T09:30:00Z",
  },
  {
    id: "task7",
    title: "テスト自動化",
    description: "CI/CDパイプラインの構築",
    status: "pending",
    due_date: "2023-06-25",
    priority: "medium",
    assigned_to: "user4",
    assigned_to_username: "dev2",
    created_by: "user4",
    created_by_username: "dev2",
    created_at: "2023-05-12T16:00:00Z",
    updated_at: "2023-05-12T16:00:00Z",
  },
];

// 共有タスクのデータは実際には別のAPIで管理されています
// import { userAddedTasks } from "../shared/tasks/route";

// ユーザータスクのモックデータをエクスポート
export const userTasks = tasks;

export async function GET(request: NextRequest) {
  try {
    console.log("タスク一覧取得API呼び出し");

    // ユーザー情報を取得
    const userStr = request.headers.get("x-user");
    if (!userStr) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リフレッシュヘッダーをチェック
    const shouldRefresh = request.headers.get("x-refresh") === "true";
    if (shouldRefresh) {
      console.log("リフレッシュモード: キャッシュをスキップします");
    }

    const user = JSON.parse(userStr) as User;
    console.log("ユーザー情報:", {
      userId: user.id,
      username: user.username,
    });

    // ユーザーに割り当てられたタスクをフィルタリング
    const userTasks = tasks.filter((task) => task.assigned_to === user.id);
    console.log(
      `ユーザー ${user.id} に割り当てられたタスク: ${userTasks.length}件`
    );

    // 1. 共有タスクを取得
    let sharedTasks: SharedTask[] = [];
    try {
      // サーバーサイドからの呼び出しにはホスト名を含む完全なURLが必要
      const apiUrl = new URL(
        "/api/shared/tasks",
        "http://localhost:3000"
      ).toString();
      console.log("共有タスク取得URL (サーバー環境):", apiUrl);

      const sharedTasksResponse = await fetch(apiUrl, {
        headers: { "x-user": userStr },
      });

      if (sharedTasksResponse.ok) {
        sharedTasks = await sharedTasksResponse.json();
        console.log("共有タスク取得成功:", sharedTasks.length);
      } else {
        throw new Error(`共有タスク取得失敗: ${sharedTasksResponse.status}`);
      }
    } catch (error) {
      console.error("共有タスク取得エラー:", error);
    }

    // 2. ユーザーの追加済みタスクIDを取得
    let userAddedTaskIds: string[] = [];
    try {
      // サーバーサイドからの呼び出しにはホスト名を含む完全なURLが必要
      const apiUrl = new URL(
        "/api/shared/tasks",
        "http://localhost:3000"
      ).toString();
      console.log("ユーザー追加タスク取得URL (サーバー環境):", apiUrl);

      const userAddedTasksResponse = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user": userStr,
        },
        body: JSON.stringify({ action: "getUserAddedTasks" }),
      });

      if (userAddedTasksResponse.ok) {
        const data = await userAddedTasksResponse.json();
        userAddedTaskIds = data.taskIds || [];
        console.log("ユーザーの追加済みタスクID:", userAddedTaskIds);

        // 追加: ユーザーの追加済みタスクIDの詳細をログ
        if (userAddedTaskIds.length > 0) {
          console.log(
            `ユーザー ${
              user.id
            } の追加済み共有タスクID: ${userAddedTaskIds.join(", ")}`
          );
        } else {
          console.log(`ユーザー ${user.id} は共有タスクを追加していません`);
        }
      } else {
        throw new Error(
          `追加済みタスクID取得失敗: ${userAddedTasksResponse.status}`
        );
      }
    } catch (error) {
      console.error("追加済みタスクID取得エラー:", error);
    }

    // 3. ユーザーが追加した共有タスクを取得
    const userAddedSharedTasks: Task[] = [];

    // 追加済みのタスクIDがある場合のみ処理
    if (userAddedTaskIds.length > 0) {
      console.log(`${userAddedTaskIds.length}個の共有タスクを処理中...`);
      console.log(`処理する共有タスクID: ${userAddedTaskIds.join(", ")}`);
      console.log(
        `全共有タスク数: ${sharedTasks.length}件, ID一覧: ${sharedTasks
          .map((t) => t.id)
          .join(", ")}`
      );

      for (const taskId of userAddedTaskIds) {
        // 対応する共有タスクを検索
        const sharedTask = sharedTasks.find((task) => task.id === taskId);

        console.log(`ID ${taskId} の共有タスク検索結果:`, {
          found: !!sharedTask,
          title: sharedTask?.title || "なし",
          allSharedTaskIds: sharedTasks.map((t) => t.id),
        });

        if (sharedTask) {
          // 共有タスクをユーザータスクに変換
          const userTask: Task = {
            id: sharedTask.id,
            title: `[共有] ${sharedTask.title}`, // タイトルに[共有]を付けて区別
            description: sharedTask.description,
            status: "pending", // 共有タスクのデフォルトステータス
            due_date: sharedTask.due_date,
            priority: sharedTask.priority,
            assigned_to: user.id,
            assigned_to_username: user.username,
            created_by: sharedTask.created_by,
            created_by_username: sharedTask.created_by_username,
            created_at: sharedTask.created_at,
            updated_at: sharedTask.created_at,
          };

          userAddedSharedTasks.push(userTask);
          console.log(
            `共有タスク "${sharedTask.title}" をユーザータスク "${userTask.title}" に変換完了`
          );
        } else {
          console.log(
            `警告: ID ${taskId} の共有タスクが見つかりません。直接検索を試みます。`
          );

          // 直接APIから特定の共有タスクを取得してみる（バックアップ処理）
          try {
            const specificTaskUrl = new URL(
              `/api/shared/tasks/${taskId}`,
              "http://localhost:3000"
            ).toString();

            const specificTaskResponse = await fetch(specificTaskUrl, {
              headers: { "x-user": userStr },
            });

            if (specificTaskResponse.ok) {
              const specificTask = await specificTaskResponse.json();
              console.log(
                `ID ${taskId} の共有タスクを直接取得成功:`,
                specificTask.title || "不明なタイトル"
              );

              // 直接取得したタスクをユーザータスクに変換
              const userTask: Task = {
                id: specificTask.id,
                title: `[共有] ${specificTask.title}`,
                description: specificTask.description || "",
                status: "pending",
                due_date:
                  specificTask.due_date ||
                  new Date().toISOString().split("T")[0],
                priority: specificTask.priority || "medium",
                assigned_to: user.id,
                assigned_to_username: user.username,
                created_by: specificTask.created_by || user.id,
                created_by_username:
                  specificTask.created_by_username || user.username,
                created_at: specificTask.created_at || new Date().toISOString(),
                updated_at: specificTask.created_at || new Date().toISOString(),
              };

              userAddedSharedTasks.push(userTask);
              console.log(
                `共有タスク "${specificTask.title}" を直接APIから取得してユーザータスクに変換完了`
              );
            } else {
              console.log(
                `ID ${taskId} の共有タスクを直接取得できませんでした: ${specificTaskResponse.status}`
              );
            }
          } catch (specificError) {
            console.error(
              `ID ${taskId} の共有タスク直接取得エラー:`,
              specificError
            );
          }
        }
      }
    }

    console.log(`変換された共有タスク: ${userAddedSharedTasks.length}件`);
    if (userAddedSharedTasks.length > 0) {
      console.log(
        "変換された共有タスクの詳細:",
        userAddedSharedTasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
        }))
      );
    } else {
      console.log(
        "警告: 追加済みタスクIDはあるが、変換された共有タスクがありません"
      );
      console.log("ユーザー追加済みタスクID:", userAddedTaskIds);
      console.log(
        "利用可能な共有タスク:",
        sharedTasks.map((t) => ({ id: t.id, title: t.title }))
      );
    }

    // 4. ユーザータスクと共有タスクを結合
    const allTasks = [...userTasks, ...userAddedSharedTasks];
    console.log(
      `ユーザータスク(${userTasks.length})と共有タスク(${userAddedSharedTasks.length})を結合: 計${allTasks.length}件`
    );

    // 追加: 返却するタスク一覧の詳細をログ出力
    if (allTasks.length > 0) {
      console.log(
        "返却するタスク一覧:",
        allTasks.map((task) => ({
          id: task.id,
          title:
            task.title.substring(0, 30) + (task.title.length > 30 ? "..." : ""),
          status: task.status,
          isShared: task.id.startsWith("shared-"),
        }))
      );
    } else {
      console.log("返却するタスクがありません");
    }

    // 5. 期限順に並べ替え
    allTasks.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    return NextResponse.json(allTasks);
  } catch (error) {
    console.error("タスク取得エラー:", error);
    return NextResponse.json(
      { error: "タスクの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, due_date, priority } = await request.json();
    const userStr = request.headers.get("x-user");
    if (!userStr) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = JSON.parse(userStr) as User;

    // 新しいタスクを作成
    const newTask: Task = {
      id: `task${Date.now()}`,
      title,
      description,
      status: "pending",
      due_date,
      priority,
      assigned_to: user.id,
      assigned_to_username: user.username,
      created_by: user.id,
      created_by_username: user.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // タスク一覧に追加
    tasks.push(newTask);

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("タスク作成エラー:", error);
    return NextResponse.json(
      { error: "タスクの作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const userStr = request.headers.get("x-user");
    if (!userStr) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = JSON.parse(userStr) as User;

    // 対象のタスクを検索
    const taskIndex = tasks.findIndex(
      (task) => task.id === id && task.assigned_to === user.id
    );

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "タスクが見つからないか、更新権限がありません" },
        { status: 404 }
      );
    }

    // タスクを更新
    tasks[taskIndex].status = status;
    tasks[taskIndex].updated_at = new Date().toISOString();

    return NextResponse.json({ success: true, task: tasks[taskIndex] });
  } catch (error) {
    console.error("タスク更新エラー:", error);
    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}
