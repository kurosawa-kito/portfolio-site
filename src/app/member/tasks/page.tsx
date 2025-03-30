"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Container,
  VStack,
  Box,
  Text,
  useToast,
  Button,
  useColorModeValue,
  Flex,
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | number | null>(
    null
  );
  const { user, isLoggedIn, setShowTaskHeader } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const subtitleBg = useColorModeValue("blue.50", "blue.900");

  // ログインチェック
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/products");
    } else {
      // タスク管理ヘッダーを表示
      setShowTaskHeader(true);
    }
  }, [isLoggedIn, router, setShowTaskHeader]);

  // タスク一覧を取得
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // リクエストヘッダーにリフレッシュフラグを追加
      const response = await fetch("/api/tasks", {
        headers: {
          "x-user": JSON.stringify(user),
          "x-refresh": "true", // キャッシュをバイパス
          "Cache-Control": "no-cache, no-store",
          Pragma: "no-cache",
        },
        // キャッシュを完全に無効化
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`タスク一覧を取得しました: ${data.length}件`);

        // 共有タスク含む詳細ログ
        const sharedTasksCount = data.filter((t: any) =>
          t.id.startsWith("shared-")
        ).length;
        if (sharedTasksCount > 0) {
          console.log(
            `標準タスク: ${
              data.length - sharedTasksCount
            }件, 共有タスク: ${sharedTasksCount}件`
          );
          console.log(
            "共有タスク一覧:",
            data
              .filter((t: any) => t.id.startsWith("shared-"))
              .map((t: any) => ({
                id: t.id,
                title: t.title,
              }))
          );
        }

        setTasks(data);
      } else {
        throw new Error("タスクの取得に失敗しました");
      }
    } catch (error) {
      console.error("タスク取得エラー:", error);
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
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user": JSON.stringify(user),
        },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // 成功したら、タスクリストを更新
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );

        toast({
          title: "成功",
          description: "タスクのステータスを更新しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("タスク更新エラー:", error);
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
  const handleDeleteTask = async (id: string | number) => {
    try {
      // 確認処理
      if (!window.confirm("本当にこのタスクを削除しますか？")) {
        return;
      }

      // IDを文字列に変換
      const taskId = id.toString();

      // 共有タスクと通常タスクを区別
      const isSharedTask = taskId.startsWith("shared-");
      const endpoint = isSharedTask
        ? `/api/shared/tasks/${taskId}`
        : `/api/tasks/${taskId}`;

      console.log(
        `タスク削除: ${isSharedTask ? "共有タスク" : "通常タスク"} ID=${taskId}`
      );

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user": JSON.stringify(user),
        },
      });

      if (response.ok) {
        // タスクリストから削除したタスクを除外
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));

        toast({
          title: `${isSharedTask ? "共有タスク" : "タスク"}を削除しました`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.text();
        console.error("タスク削除APIエラー:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          `削除に失敗しました: ${response.status} ${errorData || ""}`
        );
      }
    } catch (error) {
      console.error("タスク削除エラー:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "タスクの削除に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // モーダルを閉じる時の処理
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // ページロード時にタスク一覧を取得
  useEffect(() => {
    if (user) {
      console.log("タスク一覧ページ読み込み - タスク取得開始");
      fetchTasks();

      // ブラウザ環境でのみ実行
      if (typeof window !== "undefined") {
        // 共有タスクが追加された後のページアクセスでキャッシュを強制クリア
        const forceRefresh = sessionStorage.getItem("forceTaskRefresh");
        if (forceRefresh === "true") {
          console.log("強制リフレッシュモードでタスクを再取得します");
          sessionStorage.removeItem("forceTaskRefresh");

          // 少し遅延させてタスクを再取得（APIの状態が更新される時間を確保）
          setTimeout(() => {
            fetchTasks();
          }, 1000);
        }
      }
    }
  }, [user, fetchTasks]);

  // ログインしていない場合は何も表示しない
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Container maxW="4xl" py={4}>
      <VStack spacing={6} align="stretch">
        <PageTitle>タスク管理</PageTitle>

        <Flex justify="space-between" align="center">
          <Box
            position="relative"
            py={2}
            px={3}
            width="auto"
            borderLeftWidth="4px"
            borderLeftColor="blue.500"
            bg={subtitleBg}
            borderRadius="md"
            boxShadow="sm"
            mb={4}
          >
            <Text
              fontSize="lg"
              fontWeight="bold"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
              display="flex"
              alignItems="center"
            >
              <Box as="span" mr={2}>
                📋
              </Box>
              あなたのタスク
            </Text>
          </Box>

          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            size="sm"
            mb={4}
          >
            新しいタスクを作成
          </Button>
        </Flex>

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onStatusChange={(id, status) =>
            handleStatusChange(String(id), status)
          }
          showSubtitle={false}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
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
