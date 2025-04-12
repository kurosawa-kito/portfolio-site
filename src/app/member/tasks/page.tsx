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
  Spinner,
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

const safeBase64Encode = (str: string, user: any) => {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch (e) {
    console.error("Base64エンコードエラー:", e);
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
  const { user, isLoggedIn, isInitialized, setShowTaskHeader } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const subtitleBg = useColorModeValue("blue.50", "blue.900");

  // 認証チェックとリダイレクト
  useEffect(() => {
    if (isInitialized) {
      if (!isLoggedIn || !user) {
        // セッションストレージを確認して、直前までログイン状態だった場合はリダイレクトを遅延させる
        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) {
          router.push("/products");
        } else {
          // セッションストレージにユーザー情報がある場合は、
          // 少し待ってから再度チェックして、それでもログインしていなければリダイレクト
          const checkTimer = setTimeout(() => {
            if (!isLoggedIn || !user) {
              router.push("/products");
            }
          }, 1000); // 1秒待機

          return () => clearTimeout(checkTimer);
        }
      } else {
        setShowTaskHeader(true);
      }
    }
  }, [isInitialized, isLoggedIn, user, router, setShowTaskHeader]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userStr = JSON.stringify(user);
      const userBase64 =
        typeof window !== "undefined"
          ? safeBase64Encode(userStr, user)
          : Buffer.from(userStr).toString("base64");

      const headers = {
        "x-user-base64": userBase64,
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
        console.log("タスクデータ:", data);
        setTasks(data);
      } else {
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

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const originalTask = tasks.find(
      (task) => String(task.id) === String(taskId)
    );
    const originalStatus = originalTask?.status;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        String(task.id) === String(taskId)
          ? { ...task, status: newStatus }
          : task
      )
    );

    try {
      const userStr = sessionStorage.getItem("user") || "{}";
      const userBase64 = safeBase64Encode(userStr, JSON.parse(userStr));
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
        throw new Error("タスクの更新に失敗しました");
      }
    } catch (error) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          String(task.id) === String(taskId)
            ? { ...task, status: originalStatus || "pending" }
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

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string | number) => {
    if (!window.confirm("本当にこのタスクを削除しますか？")) {
      return;
    }

    setDeletingTaskId(taskId);
    try {
      const userStr = sessionStorage.getItem("user") || "{}";
      const userBase64 = safeBase64Encode(userStr, JSON.parse(userStr));
      const deleteHeaders = {
        "Content-Type": "application/json",
        "x-user-base64": userBase64,
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: deleteHeaders,
      });

      if (response.ok) {
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  useEffect(() => {
    if (isInitialized && isLoggedIn && user) {
      const loadInitialData = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const refresh = urlParams.get("refresh") === "true";
        if (refresh) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
        await fetchTasks();
      };
      loadInitialData();
    }
  }, [isInitialized, isLoggedIn, user, fetchTasks]);

  // ページリロード前に確認ダイアログを表示する
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 確認メッセージは現代のブラウザでは無視されますが、イベントをキャンセルするために必要です
      const confirmationMessage = "このページを離れますか？変更が失われる可能性があります。";
      e.preventDefault();
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 初期化中のローディング表示
  if (!isInitialized) {
    return (
      <Container maxW="4xl" py={4}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="lg" color="blue.500" />
        </Flex>
      </Container>
    );
  }

  // 未ログイン時は何も表示しない（リダイレクトは useEffect で処理）
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <Container maxW="4xl" py={4}>
      <VStack spacing={6} align="stretch">
        <PageTitle>タスク管理</PageTitle>

        <Flex justify="space-between" align="center">
          <Box
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
