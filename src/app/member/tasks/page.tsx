"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Container,
  VStack,
  Box,
  Text,
  useToast,
  Button,
  useColorModeValue,
  Flex,
  Grid,
  GridItem,
  Heading,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import TaskList from "@/components/TaskList";
import PageTitle from "@/components/PageTitle";
import TaskModal from "@/components/TaskModal";
import { useRouter } from "next/navigation";

interface Task {
  id: string | number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  priority: string;
  assigned_to?: string;
  assigned_to_username?: string;
  created_by?: string;
  created_by_username?: string;
  created_at?: string;
  updated_at?: string;
  is_all_day?: boolean;
}

// マルチバイト文字をエンコードするための安全なbase64エンコード関数
const safeBase64Encode = (str: string, user: any) => {
  try {
    // UTF-8でエンコードしてからbase64に変換
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch (e) {
    // エラー時は単純な文字列を返す（ロールバック）
    return btoa(JSON.stringify({ id: user?.id || 0 }));
  }
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | number | null>(
    null
  );
  const { user, isLoggedIn, setShowTaskHeader } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const subtitleBg = useColorModeValue("blue.50", "blue.900");

  // タスクを完了と未完了に分ける
  const { completedTasks, pendingTasks } = useMemo(() => {
    // 完了タスク（新しい完了タスクが上に来るようにソート）
    const completed = tasks
      .filter((task) => task.status === "completed")
      .sort((a, b) => {
        // 更新日時で降順ソート（新しいものが上）
        return (
          new Date(b.updated_at || "").getTime() -
          new Date(a.updated_at || "").getTime()
        );
      });

    // 未完了タスク（期限 → 優先度 → タイトルでソート）
    const pending = tasks
      .filter((task) => task.status !== "completed")
      .sort((a, b) => {
        // 1. 期限（近い順）
        if (a.due_date && b.due_date) {
          const dateDiff =
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          if (dateDiff !== 0) return dateDiff;
        } else if (a.due_date) {
          return -1; // aに期限があればaを先に
        } else if (b.due_date) {
          return 1; // bに期限があればbを先に
        }

        // 2. 優先度（high > medium > low）
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff =
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder];

        if (priorityDiff !== 0) return priorityDiff;

        // 3. タイトル（アルファベット順）
        return a.title.localeCompare(b.title);
      });

    return { completedTasks: completed, pendingTasks: pending };
  }, [tasks]);

  // ログインチェック
  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push("/products");
    } else {
      // タスク管理ヘッダーを表示
      setShowTaskHeader(true);
    }
  }, [isLoggedIn, user, router, setShowTaskHeader]);

  // タスク一覧を取得
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
      const userStr = JSON.stringify(user);

      const userBase64 =
        typeof window !== "undefined"
          ? safeBase64Encode(userStr, user)
          : Buffer.from(userStr).toString("base64");

      const headers = {
        "x-user-base64": userBase64, // Base64エンコードされたユーザー情報
        "x-refresh": "true",
        "Cache-Control": "no-cache, no-store",
        Pragma: "no-cache",
      };

      const response = await fetch("/api/tasks", {
        headers,
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        const errorText = await response.text();
        throw new Error(
          `タスクの取得に失敗しました: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "タスクの取得に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // タスクステータスを更新
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // 楽観的UI更新: 即座にUIを更新
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
      const userStr = JSON.stringify(user);

      const userBase64 =
        typeof window !== "undefined"
          ? safeBase64Encode(userStr, user)
          : Buffer.from(userStr).toString("base64");

      // タスク更新用のヘッダーを定義
      const statusHeaders = {
        "Content-Type": "application/json",
        "x-user-base64": userBase64,
      };

      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: statusHeaders,
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "タスクのステータスを更新しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // 失敗した場合は元に戻す
        const errorData = await response.json();
        throw new Error(errorData.error || "タスクの更新に失敗しました");
      }
    } catch (error) {
      // エラーの場合は元の状態に戻す
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: task.status === "completed" ? "pending" : "completed",
              }
            : task
        )
      );

      toast({
        title: "エラー",
        description: "タスクの更新に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // タスク編集の処理
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // タスク削除の処理
  const handleDeleteTask = async (taskId: string | number) => {
    if (!window.confirm("本当にこのタスクを削除しますか？")) {
      return;
    }

    // 削除中の状態を設定
    setDeletingTaskId(taskId);

    try {
      // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
      const userStr = JSON.stringify(user);

      const userBase64 =
        typeof window !== "undefined"
          ? safeBase64Encode(userStr, user)
          : Buffer.from(userStr).toString("base64");

      // 削除用のヘッダーを定義
      const deleteHeaders = {
        "x-user-base64": userBase64,
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: deleteHeaders,
      });

      if (response.ok) {
        // 削除成功したらリストから削除
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        toast({
          title: "タスク削除",
          description: "タスクを削除しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "タスクの削除に失敗しました");
      }
    } catch (error) {
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "タスクの削除に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingTaskId(null);
    }
  };

  // モーダルを閉じる時の処理
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // 初期データの読み込み
  useEffect(() => {
    if (isLoggedIn && user) {
      // 自動更新を設定
      const loadInitialData = async () => {
        // 強制リフレッシュモードかどうかをチェック
        const urlParams = new URLSearchParams(window.location.search);
        const refresh = urlParams.get("refresh") === "true";

        if (refresh) {
          // 強制更新の場合、URLからクエリパラメータを削除
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          // タスクを取得
          await fetchTasks();
        } else {
          // 通常の読み込み
          fetchTasks();
        }
      };

      loadInitialData();
    }
  }, [isLoggedIn, user, fetchTasks]);

  // ログインしていない場合は何も表示しない
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <Container maxW="6xl" py={4}>
      <VStack spacing={4} align="stretch">
        <PageTitle>タスク管理</PageTitle>

        <Flex justify="flex-end" align="center" mb={2}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            size="sm"
          >
            新しいタスクを作成
          </Button>
        </Flex>

        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          {/* 左側：完了済みタスク */}
          <GridItem>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={0}
              bg={useColorModeValue("white", "gray.800")}
              boxShadow="md"
              height="calc(100vh - 180px)"
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <Flex
                bg={useColorModeValue("green.50", "green.900")}
                p={2}
                borderBottomWidth="1px"
                borderBottomColor={useColorModeValue("green.100", "green.700")}
                align="center"
              >
                <Box as="span" mr={2} fontSize="md" color="green.500">
                  ✓
                </Box>
                <Heading size="sm" color="green.500">
                  完了済みタスク
                </Heading>
              </Flex>
              <Box
                p={2}
                overflowY="auto"
                flexGrow={1}
                css={{
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: useColorModeValue("gray.100", "gray.700"),
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: useColorModeValue("blue.300", "blue.600"),
                    borderRadius: "4px",
                    cursor: "pointer",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: useColorModeValue("blue.400", "blue.500"),
                  },
                }}
              >
                <TaskList
                  tasks={completedTasks}
                  isLoading={isLoading}
                  onStatusChange={(id, status) =>
                    handleStatusChange(String(id), status)
                  }
                  showSubtitle={false}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </Box>
            </Box>
          </GridItem>

          {/* 右側：未完了タスク */}
          <GridItem>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={0}
              bg={useColorModeValue("white", "gray.800")}
              boxShadow="md"
              height="calc(100vh - 180px)"
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <Flex
                bg={useColorModeValue("blue.50", "blue.900")}
                p={2}
                borderBottomWidth="1px"
                borderBottomColor={useColorModeValue("blue.100", "blue.700")}
                align="center"
              >
                <Box as="span" mr={2} fontSize="md" color="blue.500">
                  🔔
                </Box>
                <Heading size="sm" color="blue.500">
                  未完了タスク
                </Heading>
              </Flex>
              <Box
                p={2}
                overflowY="auto"
                flexGrow={1}
                css={{
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: useColorModeValue("gray.100", "gray.700"),
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: useColorModeValue("blue.300", "blue.600"),
                    borderRadius: "4px",
                    cursor: "pointer",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: useColorModeValue("blue.400", "blue.500"),
                  },
                }}
              >
                <TaskList
                  tasks={pendingTasks}
                  isLoading={isLoading}
                  onStatusChange={(id, status) =>
                    handleStatusChange(String(id), status)
                  }
                  showSubtitle={false}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </Box>
            </Box>
          </GridItem>
        </Grid>
      </VStack>

      {/* タスク作成/編集モーダル */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={editingTask ? "edit" : "create"}
        task={editingTask || undefined}
        onSuccess={fetchTasks}
      />
    </Container>
  );
}
