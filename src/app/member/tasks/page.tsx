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
import api from "@/lib/api";

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
    console.error("Base64エンコードエラー:", e);
    // エラー時は単純な文字列を返す（ロールバック）
    return btoa(JSON.stringify({ id: user?.id || 0 }));
  }
};

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
      // Laravel APIを使用してタスク一覧を取得
      const data = await api.tasks.getAll();
      setTasks(data);
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
  const handleStatusChange = async (
    taskId: string | number,
    newStatus: string
  ) => {
    // 楽観的UI更新: 即座にUIを更新
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      // Laravel APIを使用してステータスを更新
      await api.tasks.updateStatus(taskId, newStatus);

      toast({
        title: "成功",
        description: "タスクのステータスを更新しました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      // Laravel APIを使用してタスクを削除
      await api.tasks.delete(taskId);

      // 削除成功したらリストから削除
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast({
        title: "タスク削除",
        description: "タスクを削除しました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      // 削除中の状態を解除
      setDeletingTaskId(null);
    }
  };

  // モーダルを閉じる処理
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // ページ読み込み時にタスク一覧を取得
  useEffect(() => {
    if (user) {
      const loadInitialData = async () => {
        await fetchTasks();
      };

      loadInitialData();
    }
  }, [user, fetchTasks]);

  // ログインしていない場合は何も表示しない
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <Container maxW="container.xl" pt={4}>
      <PageTitle
        title="タスク管理"
        subtitle="あなたのタスクを管理しましょう"
        emoji="📝"
      />

      <Flex direction="column" gap={4}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => setIsModalOpen(true)}
            size="md"
          >
            新規タスク
          </Button>
        </Box>

        <TaskList
          tasks={tasks}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </Flex>

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
