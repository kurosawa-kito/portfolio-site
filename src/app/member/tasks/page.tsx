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
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isLoggedIn, setShowTaskHeader } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const subtitleBg = useColorModeValue("blue.50", "blue.900");

  // タスク一覧を取得
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // リクエストとキャッシュの設定
      // ヘッダーを別変数に定義
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
        console.log(data);
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

  // 初期化状態の設定
  useEffect(() => {
    // セッションストレージから直接チェック（初期レンダリング時のみ）
    const checkSession = () => {
      try {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          // セッションがあればOK
          setIsInitialized(true);
          return true;
        }
        return false;
      } catch (e) {
        console.error("セッションチェックエラー:", e);
        return false;
      }
    };

    // まだ初期化されておらず、ユーザー情報もない場合はセッションをチェック
    if (!isInitialized && !user) {
      const hasSession = checkSession();
      // セッションチェックのみ行い、リダイレクトはログインチェックに任せる
      if (!hasSession) {
        console.log("セッションなし - タスク管理ページ");
      }
    } else if (user) {
      // ユーザー情報がある場合は初期化完了
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  // ログインチェック
  useEffect(() => {
    // 初期化完了後にのみログインチェックを行う
    if (isInitialized) {
      if (!isLoggedIn || !user) {
        console.log("未ログイン状態が検出されました - リダイレクト");
        router.push("/products");
      } else {
        // タスク管理ヘッダーを表示
        setShowTaskHeader(true);
      }
    }
  }, [isLoggedIn, user, setShowTaskHeader, isInitialized, router]);

  // データ読み込みは別のuseEffectに分離
  useEffect(() => {
    if (isInitialized && isLoggedIn && user) {
      // タスク一覧を取得
      fetchTasks();
    }
  }, [isInitialized, isLoggedIn, user, fetchTasks]);

  // タスクステータスを更新
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // 元のステータスを保存
    const originalTask = tasks.find(
      (task) => String(task.id) === String(taskId)
    );
    const originalStatus = originalTask?.status;

    // 楽観的UI更新
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        String(task.id) === String(taskId)
          ? { ...task, status: newStatus }
          : task
      );
      console.log("Updated tasks:", updatedTasks);
      return updatedTasks;
    });

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
      // エラー時に元のステータスに戻す
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
      // セッションストレージからユーザー情報を取得
      const userStr = sessionStorage.getItem("user") || "{}";

      // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
      const userBase64 = safeBase64Encode(userStr, JSON.parse(userStr));

      // 削除用のヘッダーを定義
      const deleteHeaders = {
        "Content-Type": "application/json",
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

  // ログインしていない場合は何も表示しない
  if (!isLoggedIn || !user) {
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
