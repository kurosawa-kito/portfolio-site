import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";

// 共有タスクのモックデータをエクスポート
export const sharedTasks: {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  created_at: string;
  created_by: string;
  created_by_username: string;
  status: string;
  is_all_day?: boolean;
}[] = [
  {
    id: "shared-task1",
    title: "プロジェクトドキュメントの更新",
    description: "最新の要件を反映したドキュメントに更新してください。",
    due_date: "2023-05-15",
    priority: "high",
    created_at: "2023-05-01T10:00:00Z",
    created_by: "user1",
    created_by_username: "管理者",
    status: "pending",
  },
  {
    id: "shared-task2",
    title: "週次レポートの提出",
    description: "先週の進捗を報告する週次レポートを提出してください。",
    due_date: "2023-05-08",
    priority: "medium",
    created_at: "2023-05-02T14:30:00Z",
    created_by: "user1",
    created_by_username: "管理者",
    status: "pending",
  },
];

// デバッグ用：起動時にsharedTasksの内容を出力
console.log(
  "共有タスクのモックデータを初期化:",
  sharedTasks.map((t) => ({ id: t.id, title: t.title }))
);

// ユーザーが追加した共有タスクを記録するデータ構造
// export const userAddedTasks: {
//   userId: string;
//   taskIds: string[];
// }[] = [];

// より永続的な保存のために、ローカルストレージをシミュレート
let persistedUserAddedTasks: string | null = null;

// userAddedTasksのゲッターとセッター
export const getUserAddedTasks = (): {
  userId: string;
  taskIds: string[];
}[] => {
  if (persistedUserAddedTasks === null) {
    // 初回アクセス時またはサーバーリスタート時に初期データをロード
    persistedUserAddedTasks = JSON.stringify([
      {
        userId: "user1",
        taskIds: ["shared-task2"],
      },
      {
        userId: "user2",
        taskIds: ["shared-task1"],
      },
    ]);
  }

  try {
    return JSON.parse(persistedUserAddedTasks);
  } catch (e) {
    console.error("ユーザータスクデータのパースエラー:", e);
    return [];
  }
};

// userAddedTasksの更新関数
export const updateUserAddedTasks = (
  newTasks: { userId: string; taskIds: string[] }[]
): void => {
  persistedUserAddedTasks = JSON.stringify(newTasks);
};

// 共有タスク一覧を取得するAPI
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const taskId = pathSegments[pathSegments.length - 1];

    // '/api/shared/tasks/[taskId]' の形式の場合、特定のタスクを返す
    if (taskId && taskId !== "tasks") {
      console.log(`特定の共有タスクを取得するリクエスト: ID=${taskId}`);

      const task = sharedTasks.find((t) => t.id === taskId);

      if (task) {
        console.log(`タスクID ${taskId} が見つかりました:`, task.title);
        return NextResponse.json(task, { status: 200 });
      } else {
        console.log(`タスクID ${taskId} が見つかりませんでした`);
        return NextResponse.json(
          { error: "指定されたタスクが見つかりません" },
          { status: 404 }
        );
      }
    }

    // 通常の一覧取得
    console.log("共有タスク一覧を取得するリクエスト");
    return NextResponse.json(sharedTasks, { status: 200 });
  } catch (error) {
    console.error("共有タスク取得エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 共有タスクを作成するAPI（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, due_date, priority } = body;

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // 管理者のみタスク作成可能
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "共有タスクの作成は管理者のみ可能です" },
        { status: 403 }
      );
    }

    // 新しいタスクを作成
    const newTask = {
      id: `shared-task${Date.now()}`,
      title,
      description,
      due_date,
      priority,
      created_at: new Date().toISOString(),
      created_by: user.id,
      created_by_username: user.username,
      status: "pending",
    };

    // タスク一覧に追加
    sharedTasks.unshift(newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("共有タスク作成エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの作成に失敗しました" },
      { status: 500 }
    );
  }
}

// 共有タスクを更新するAPI（管理者または作成者のみ）
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const taskId = url.pathname.split("/").pop();
    const body = await request.json();
    const { title, description, due_date, priority, is_all_day } = body;

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // タスクの存在確認
    const taskIndex = sharedTasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "指定されたタスクが見つかりません" },
        { status: 404 }
      );
    }

    // 管理者または作成者のみタスク更新可能
    if (
      user.role !== "admin" &&
      sharedTasks[taskIndex].created_by !== user.id
    ) {
      return NextResponse.json(
        { error: "このタスクを更新する権限がありません" },
        { status: 403 }
      );
    }

    // タスクを更新
    sharedTasks[taskIndex] = {
      ...sharedTasks[taskIndex],
      title,
      description,
      due_date,
      priority,
      is_all_day,
    };

    return NextResponse.json(sharedTasks[taskIndex], { status: 200 });
  } catch (error) {
    console.error("共有タスク更新エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// 共有タスクを削除するAPI（管理者または作成者のみ）
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    // パスからIDを取得する
    const pathId = url.pathname.split("/").pop();
    // クエリパラメータからIDを取得する
    const queryId = url.searchParams.get("id");

    // いずれかの方法でIDを取得
    const taskId = queryId || pathId;

    console.log("共有タスク削除リクエスト:", {
      pathId,
      queryId,
      usedTaskId: taskId,
      url: request.url,
      pathname: url.pathname,
      searchParams: Object.fromEntries(url.searchParams.entries()),
    });

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;

    // タスクの存在確認
    const taskIndex = sharedTasks.findIndex((task) => task.id === taskId);

    console.log("タスク検索結果:", {
      taskId,
      allTaskIds: sharedTasks.map((t) => t.id),
      foundIndex: taskIndex,
    });

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "指定されたタスクが見つかりません" },
        { status: 404 }
      );
    }

    // 管理者または作成者のみタスク削除可能
    if (
      user.role !== "admin" &&
      sharedTasks[taskIndex].created_by !== user.id
    ) {
      return NextResponse.json(
        { error: "このタスクを削除する権限がありません" },
        { status: 403 }
      );
    }

    // タスクを削除
    const deletedTask = sharedTasks.splice(taskIndex, 1)[0];

    // ユーザーの追加済みタスク一覧からも削除
    const userAddedTasks = getUserAddedTasks();
    const updatedUserAddedTasks = userAddedTasks.map((item) => {
      return {
        ...item,
        taskIds: item.taskIds.filter((id) => id !== taskId),
      };
    });
    updateUserAddedTasks(updatedUserAddedTasks);

    return NextResponse.json(
      { message: "タスクを削除しました", deletedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error("共有タスク削除エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの削除に失敗しました" },
      { status: 500 }
    );
  }
}

// ユーザーの追加済みタスクIDを取得するAPI
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // ユーザー情報を取得
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const user = JSON.parse(userHeader) as User;
    console.log("ユーザー情報:", {
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // ユーザーの追加済みタスクIDを取得
    if (action === "getUserAddedTasks") {
      // 現在の永続化されたデータを取得
      const userAddedTasks = getUserAddedTasks();

      const userAddedTask = userAddedTasks.find(
        (item) => item.userId === user.id
      );

      console.log("追加済みタスク取得:", {
        userId: user.id,
        foundTaskInfo: !!userAddedTask,
        taskIds: userAddedTask?.taskIds || [],
      });

      return NextResponse.json(
        {
          taskIds: userAddedTask?.taskIds || [],
        },
        { status: 200 }
      );
    }

    // ユーザーのタスク追加処理
    if (action === "addTaskToUser") {
      const { taskId } = body;
      console.log("タスク追加リクエスト:", {
        userId: user.id,
        taskId,
        requestBody: body,
      });

      // タスクIDのチェック
      if (!taskId) {
        return NextResponse.json(
          { error: "タスクIDが指定されていません" },
          { status: 400 }
        );
      }

      // タスクの存在確認
      const taskIdStr = String(taskId); // 必ず文字列に変換
      console.log(`タスク検索: ID "${taskIdStr}" を検索中...`);
      console.log(
        `利用可能な共有タスク: ${JSON.stringify(
          sharedTasks.map((t) => ({
            id: t.id,
            title: t.title.substring(0, 10),
          }))
        )}`
      );

      const task = sharedTasks.find((task) => task.id === taskIdStr);

      console.log("タスク存在確認:", {
        taskIdStr,
        taskFound: !!task,
        taskTitle: task?.title || "見つかりません",
        tasksCount: sharedTasks.length,
        exactComparison: sharedTasks.map(
          (t) => `"${t.id}" === "${taskIdStr}" = ${t.id === taskIdStr}`
        ),
      });

      // タスクが見つからない場合はエラーメッセージを強化して返す
      if (!task) {
        // 類似IDのタスクがないか確認（デバッグ用）
        const similarTasks = sharedTasks.filter(
          (t) => t.id.includes(taskIdStr) || taskIdStr.includes(t.id)
        );
        console.log(
          "類似IDのタスク:",
          similarTasks.map((t) => t.id)
        );

        // タスクが見つからない場合でも、タスクIDをユーザーに追加する（暫定対応）
        console.log("タスクは見つかりませんが、IDを保存します（暫定対応）");

        // 現在の追加済みタスク一覧を取得
        const userAddedTasks = getUserAddedTasks();

        // ユーザーのタスク追加状況を確認
        let userAddedTask = userAddedTasks.find(
          (item) => item.userId === user.id
        );

        // ユーザーが初めてタスクを追加する場合
        if (!userAddedTask) {
          userAddedTask = {
            userId: user.id,
            taskIds: [taskIdStr],
          };
          userAddedTasks.push(userAddedTask);
        }
        // 既に追加済みの場合はスキップ
        else if (userAddedTask.taskIds.includes(taskIdStr)) {
          return NextResponse.json(
            {
              message: "このタスクは既に追加されています",
              taskIds: userAddedTask.taskIds,
            },
            { status: 200 }
          );
        }
        // 新しいタスクを追加
        else {
          userAddedTask.taskIds.push(taskIdStr);
        }

        // 変更を永続化
        updateUserAddedTasks(userAddedTasks);

        // 成功レスポンスを返す（暫定対応として成功とする）
        return NextResponse.json(
          {
            message: "タスクIDを保存しました（暫定対応）",
            taskIds: userAddedTask.taskIds,
            warning: "指定されたタスクはデータベースに見つかりませんでした",
          },
          { status: 200 }
        );
      }

      // 現在の追加済みタスク一覧を取得
      const userAddedTasks = getUserAddedTasks();
      console.log("現在のuserAddedTasks:", JSON.stringify(userAddedTasks));

      // ユーザーのタスク追加状況を確認
      let userAddedTask = userAddedTasks.find(
        (item) => item.userId === user.id
      );

      // ユーザーが初めてタスクを追加する場合
      if (!userAddedTask) {
        userAddedTask = {
          userId: user.id,
          taskIds: [taskIdStr], // 文字列に統一
        };
        userAddedTasks.push(userAddedTask);
        console.log("初めてのタスク追加:", {
          userId: user.id,
          taskId: taskIdStr,
        });
      }
      // 既に追加済みの場合はスキップ
      else if (userAddedTask.taskIds.includes(taskIdStr)) {
        console.log("タスクは既に追加済み:", {
          userId: user.id,
          taskId: taskIdStr,
        });
        return NextResponse.json(
          {
            message: "このタスクは既に追加されています",
            taskIds: userAddedTask.taskIds,
          },
          { status: 200 }
        );
      }
      // 新しいタスクを追加
      else {
        userAddedTask.taskIds.push(taskIdStr); // 文字列に統一
        console.log("既存ユーザーにタスク追加:", {
          userId: user.id,
          taskId: taskIdStr,
        });
      }

      // 変更を永続化
      updateUserAddedTasks(userAddedTasks);
      console.log("更新後のuserAddedTasks:", JSON.stringify(userAddedTasks));

      // 成功レスポンス
      return NextResponse.json(
        {
          message: "タスクが正常に追加されました",
          taskIds: userAddedTask.taskIds,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "無効なアクションです" },
      { status: 400 }
    );
  } catch (error) {
    console.error("共有タスク操作エラー:", error);
    return NextResponse.json(
      { error: "共有タスクの操作に失敗しました" },
      { status: 500 }
    );
  }
}
