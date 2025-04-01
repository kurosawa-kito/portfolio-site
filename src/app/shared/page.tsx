"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  useToast,
  Button,
  Textarea,
  Card,
  CardBody,
  HStack,
  IconButton,
  Badge,
  useColorModeValue,
  Spinner,
  Container,
  Flex,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, EditIcon } from "@chakra-ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import PageTitle from "@/components/PageTitle";
import TaskModal from "@/components/TaskModal";
import { useRouter } from "next/navigation";

// 共有ノートの型定義
interface SharedNote {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  created_by_username: string;
}

// 共有タスクの型定義
interface SharedTask {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  created_at: string;
  created_by: string;
  created_by_username: string;
  status: string; // 必須にする
  is_all_day?: boolean;
}

export default function SharedBoard() {
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [addedTaskIds, setAddedTaskIds] = useState<string[]>([]);
  const [isAddingTask, setIsAddingTask] = useState<Record<string, boolean>>({});
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SharedTask | null>(null);
  const { user, isLoggedIn, setShowTaskHeader } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const noteBgColor = useColorModeValue("blue.50", "blue.900");
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

  // 共有ノートを取得（useCallbackでメモ化）
  const fetchNotes = useCallback(async () => {
    if (!user) return;

    setIsLoadingNotes(true);
    try {
      const response = await fetch("/api/shared/notes", {
        headers: {
          "x-user": JSON.stringify(user),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("共有ノート取得エラー:", error);
      toast({
        title: "エラー",
        description: "共有ノートの取得に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingNotes(false);
    }
  }, [user, toast]);

  // 共有タスクを取得（useCallbackでメモ化）
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setIsLoadingTasks(true);
    try {
      // 共有タスク一覧を取得
      console.log("共有タスク一覧取得開始...");

      // ヘッダーを別変数に定義
      const headers = {
        "x-user": JSON.stringify(user),
        "Cache-Control": "no-cache, no-store",
        Pragma: "no-cache",
      };

      const tasksResponse = await fetch("/api/shared/tasks", {
        headers,
        cache: "no-store",
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        console.log(`共有タスク一覧取得成功: ${tasksData.length}件`);
        console.log(
          "取得した共有タスク:",
          tasksData.map((t: any) => ({
            id: t.id,
            title: t.title.substring(0, 15) + "...",
          }))
        );
        setTasks(tasksData);
      } else {
        console.error(
          "共有タスク一覧取得エラー:",
          tasksResponse.status,
          tasksResponse.statusText
        );
      }

      // ユーザーが追加済みのタスクIDを取得
      console.log("追加済みタスクID取得開始...");
      // ローカルストレージから追加済みタスクIDを取得
      const localTaskIds = localStorage.getItem(`addedTaskIds_${user.id}`);
      let savedTaskIds: string[] = [];

      if (localTaskIds) {
        try {
          savedTaskIds = JSON.parse(localTaskIds);
          console.log(
            "ローカルストレージから取得した追加済みタスクID:",
            savedTaskIds
          );
        } catch (e) {
          console.error("ローカルストレージのデータ解析エラー:", e);
        }
      }

      // APIからも追加済みタスクIDを取得して統合

      // ヘッダーを別変数に定義
      const apiHeaders = {
        "Content-Type": "application/json",
        "x-user": JSON.stringify(user),
        "Cache-Control": "no-cache, no-store",
        Pragma: "no-cache",
      };

      const addedTasksResponse = await fetch("/api/shared/tasks", {
        method: "PATCH",
        headers: apiHeaders,
        body: JSON.stringify({
          action: "getUserAddedTasks",
        }),
        cache: "no-store",
      });

      if (addedTasksResponse.ok) {
        const { taskIds } = await addedTasksResponse.json();
        console.log("APIから取得した追加済みタスクID:", taskIds);

        // APIとローカルストレージから取得したIDを統合して重複を除去
        const combinedTaskIds = [...new Set([...savedTaskIds, ...taskIds])];
        console.log("統合した追加済みタスクID:", combinedTaskIds);

        // 最新のタスクIDセットをローカルストレージに保存
        localStorage.setItem(
          `addedTaskIds_${user.id}`,
          JSON.stringify(combinedTaskIds)
        );

        // ステートに設定
        setAddedTaskIds(combinedTaskIds);
      } else {
        console.error(
          "追加済みタスクID取得エラー:",
          addedTasksResponse.status,
          addedTasksResponse.statusText
        );

        // APIから取得できない場合はローカルストレージのデータだけを使用
        if (savedTaskIds.length > 0) {
          setAddedTaskIds(savedTaskIds);
        }
      }
    } catch (error) {
      console.error("共有タスク取得エラー:", error);
      toast({
        title: "エラー",
        description: "共有タスクの取得に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingTasks(false);
    }
  }, [user, toast]);

  // ノートを追加
  const addNote = async () => {
    if (!newNoteContent.trim()) {
      toast({
        title: "エラー",
        description: "メッセージを入力してください",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAddingNote(true);
    try {
      const response = await fetch("/api/shared/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": JSON.stringify(user),
        },
        body: JSON.stringify({
          content: newNoteContent,
        }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes([newNote, ...notes]);
        setNewNoteContent("");
        toast({
          title: "成功",
          description: "ノートが追加されました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("ノート追加エラー:", error);
      toast({
        title: "エラー",
        description: "ノートの追加に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  // ノートを削除
  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/shared/notes?id=${noteId}`, {
        method: "DELETE",
        headers: {
          "x-user": JSON.stringify(user),
        },
      });

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== noteId));
        toast({
          title: "成功",
          description: "ノートが削除されました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("ノート削除エラー:", error);
      toast({
        title: "エラー",
        description: "ノートの削除に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // タスクをユーザーのタスク一覧に追加
  const addTaskToUser = async (taskId: string | number) => {
    setIsAddingTask((prev) => ({ ...prev, [taskId]: true }));

    try {
      // taskIdの詳細なログ
      console.log("タスク追加開始:", {
        taskId,
        taskIdType: typeof taskId,
        taskIdAsString: String(taskId),
      });

      // 選択したタスクを取得
      const selectedTask = tasks.find((task) => task.id === taskId);

      if (!selectedTask) {
        throw new Error(`ID ${taskId} のタスクが見つかりません`);
      }

      console.log("追加対象タスク:", selectedTask);

      if (!user || !user.id) {
        throw new Error("ユーザー情報が見つかりません");
      }

      // userオブジェクトを確認
      console.log("ユーザー情報確認:", {
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      // 通常のタスク作成と同じAPIを使用する
      const apiUrl = "/api/tasks";

      console.log("APIリクエスト送信先:", apiUrl);

      // 新しいタスクとして作成するリクエストボディ
      const requestBody = {
        title: `[共有] ${selectedTask.title}`,
        description: selectedTask.description,
        due_date: selectedTask.due_date,
        priority: selectedTask.priority,
      };

      console.log("タスク作成リクエストボディ:", requestBody);

      // ユーザー情報の詳細ログ
      const userInfo = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      console.log("送信するユーザー情報:", JSON.stringify(userInfo));

      // リクエストヘッダーを定義
      const requestHeaders = {
        "Content-Type": "application/json",
        "x-user": JSON.stringify(userInfo),
        "Cache-Control": "no-cache, no-store",
        Pragma: "no-cache",
      };

      // リクエストの送信（POSTメソッドでタスクを作成）
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        cache: "no-store",
      });

      console.log("APIレスポンスステータス:", response.status);

      const responseText = await response.text();
      console.log("生レスポンス:", responseText);

      let data;

      try {
        // レスポンスがJSONの場合はパース
        data = responseText ? JSON.parse(responseText) : {};
        console.log("パース後のレスポンスデータ:", data);
      } catch (e) {
        console.error(
          "レスポンスのJSONパースエラー:",
          e,
          "レスポンステキスト:",
          responseText
        );
        data = { error: "不正なレスポンス形式" };
      }

      if (!response.ok) {
        console.error("タスク追加APIエラー:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });
        throw new Error(
          `APIエラー: ${response.status} ${data.error || responseText}`
        );
      }

      console.log("タスク追加成功レスポンス:", data);

      // 成功時にUIを更新
      // 追加済みタスクIDsを更新して追加ボタンの状態を変える
      const taskIdStr = String(taskId);
      setAddedTaskIds((prev) => {
        const updatedIds = [...prev, taskIdStr];
        // ローカルストレージにも保存
        localStorage.setItem(
          `addedTaskIds_${user.id}`,
          JSON.stringify(updatedIds)
        );
        return updatedIds;
      });

      // 旧APIとの互換性のために、共有タスクリストにも追加する
      try {
        console.log("共有タスクリストに追加記録...");
        const recordResponse = await fetch("/api/shared/tasks", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user": JSON.stringify(userInfo),
          },
          body: JSON.stringify({
            action: "addTaskToUser",
            taskId: taskIdStr,
          }),
        });

        if (recordResponse.ok) {
          const recordData = await recordResponse.json();
          console.log("共有タスクリスト追加記録成功:", recordData);
        } else {
          console.warn("共有タスクリスト追加記録失敗:", recordResponse.status);
        }
      } catch (recordError) {
        console.warn("共有タスクリスト追加記録エラー:", recordError);
      }

      // タスク管理ページに追加されたことをトースト通知（統合版）
      toast({
        title: "タスクが正常に追加されました",
        status: "success",
        duration: 3000,
        isClosable: true,
        render: () => (
          <Box p={3} color="white" bg="green.500" borderRadius="md">
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="bold">タスクが正常に追加されました</Text>
              <Text fontSize="sm">
                タスクがあなたのタスク一覧に追加されました。タスク管理ページで確認できます。
              </Text>
              <Button
                colorScheme="whiteAlpha"
                onClick={() => {
                  toast.closeAll(); // すべてのトーストを閉じる
                  router.push("/member/tasks");
                }}
              >
                タスク管理へ移動
              </Button>
            </VStack>
          </Box>
        ),
      });

      // タスクリストを更新（追加済みタスクの状態更新のため）
      await fetchTasks();
    } catch (error) {
      console.error("タスク追加失敗:", error);
      toast({
        title: "タスクの追加に失敗しました",
        description:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAddingTask((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  // 優先度に応じた色を返す関数
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // 無効な日付の場合はそのまま返す

      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("日付フォーマットエラー:", error);
      return dateString;
    }
  };

  // ページロード時にデータを取得
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotes();
      fetchTasks();
    }
  }, [isLoggedIn, user, fetchNotes, fetchTasks]);

  // 共有タスクを削除
  const deleteSharedTask = async (taskId: string | number) => {
    try {
      // 確認処理
      if (!window.confirm("本当にこの共有タスクを削除しますか？")) {
        return;
      }

      // デバッグログ
      console.log(`共有タスク削除リクエスト:`, {
        taskId,
        endpoint: `/api/shared/tasks/${taskId}`,
      });

      const response = await fetch(`/api/shared/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user": JSON.stringify(user),
        },
      });

      const responseText = await response.text();
      let data;

      try {
        // レスポンスがJSONの場合はパース
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error(
          "レスポンスのJSONパースエラー:",
          e,
          "レスポンステキスト:",
          responseText
        );
        data = { error: "不正なレスポンス形式" };
      }

      if (response.ok) {
        // タスクリストから削除したタスクを除外
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

        toast({
          title: "共有タスクを削除しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.error("削除エラーレスポンス:", {
          status: response.status,
          data: data,
        });
        throw new Error(
          `共有タスクの削除に失敗しました: ${response.status} ${
            data.error || responseText
          }`
        );
      }
    } catch (error) {
      console.error("共有タスク削除エラー:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "共有タスクの削除に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 共有タスクを編集
  const handleEditTask = (task: SharedTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // モーダルを閉じる時の処理
  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  // ログインしていない場合は何も表示しない
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <Container maxW="4xl" py={4}>
      <VStack spacing={6} align="stretch">
        <PageTitle>共有ボード</PageTitle>

        {/* 共有ノート投稿セクション */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box
                position="relative"
                py={2}
                mb={2}
                px={3}
                width="100%"
                borderLeftWidth="4px"
                borderLeftColor="blue.500"
                bg={subtitleBg}
                borderRadius="md"
                boxShadow="sm"
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
                    📝
                  </Box>
                  共有メッセージボード
                </Text>
              </Box>

              <Textarea
                placeholder="チームに共有したいメッセージを入力してください"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                size="lg"
                rows={3}
              />

              <Button
                colorScheme="blue"
                onClick={addNote}
                isLoading={isAddingNote}
                leftIcon={<AddIcon />}
                w="full"
              >
                メッセージを共有
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* 共有ノート一覧 */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box
                position="relative"
                py={2}
                mb={2}
                px={3}
                width="100%"
                borderLeftWidth="4px"
                borderLeftColor="purple.500"
                bg={subtitleBg}
                borderRadius="md"
                boxShadow="sm"
              >
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  bgGradient="linear(to-r, purple.500, blue.500)"
                  bgClip="text"
                  display="flex"
                  alignItems="center"
                >
                  <Box as="span" mr={2}>
                    💬
                  </Box>
                  共有メッセージ
                </Text>
              </Box>

              {isLoadingNotes ? (
                <Box textAlign="center" py={4}>
                  <Spinner size="lg" color="blue.500" />
                  <Text mt={2}>メッセージを読み込み中...</Text>
                </Box>
              ) : notes.length === 0 ? (
                <Text py={4} textAlign="center" color="gray.500">
                  共有メッセージはまだありません
                </Text>
              ) : (
                notes.map((note) => (
                  <Box
                    key={note.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg={noteBgColor}
                    position="relative"
                  >
                    <HStack justifyContent="space-between" mb={2}>
                      <Text fontWeight="bold" fontSize="sm">
                        {note.created_by_username}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mr={8}>
                        {formatDate(note.created_at)}
                      </Text>
                    </HStack>

                    <Text whiteSpace="pre-wrap">{note.content}</Text>

                    {(note.created_by === user.id.toString() ||
                      user.role === "admin") && (
                      <IconButton
                        aria-label="Delete note"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={() => deleteNote(note.id)}
                      />
                    )}
                  </Box>
                ))
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* 共有タスク一覧 */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box
                position="relative"
                py={2}
                mb={2}
                px={3}
                width="100%"
                borderLeftWidth="4px"
                borderLeftColor="green.500"
                bg={subtitleBg}
                borderRadius="md"
                boxShadow="sm"
              >
                <Flex justify="space-between" align="center">
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    bgGradient="linear(to-r, green.500, teal.500)"
                    bgClip="text"
                    display="flex"
                    alignItems="center"
                  >
                    <Box as="span" mr={2}>
                      📋
                    </Box>
                    共有タスク
                  </Text>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="green"
                    size="sm"
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                  >
                    タスクを共有
                  </Button>
                </Flex>
              </Box>

              {isLoadingTasks ? (
                <Box textAlign="center" py={4}>
                  <Spinner size="lg" color="green.500" />
                  <Text mt={2}>タスクを読み込み中...</Text>
                </Box>
              ) : tasks.length === 0 ? (
                <Text py={4} textAlign="center" color="gray.500">
                  共有タスクはまだありません
                </Text>
              ) : (
                tasks.map((task) => (
                  <Box
                    key={task.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg={
                      task.priority === "high"
                        ? "red.50"
                        : task.priority === "medium"
                        ? "orange.50"
                        : "green.50"
                    }
                    _dark={{
                      bg:
                        task.priority === "high"
                          ? "red.900"
                          : task.priority === "medium"
                          ? "orange.900"
                          : "green.900",
                      opacity: 0.7,
                    }}
                    position="relative"
                  >
                    <HStack justifyContent="space-between" mb={2}>
                      <Heading size="sm">{task.title}</Heading>
                      <HStack>
                        <Badge colorScheme={getPriorityColor(task.priority)}>
                          {task.priority === "high"
                            ? "高"
                            : task.priority === "medium"
                            ? "中"
                            : "低"}
                        </Badge>
                        {(task.created_by === user?.id.toString() ||
                          user?.role === "admin") && (
                          <>
                            <IconButton
                              aria-label="編集"
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => handleEditTask(task)}
                            />
                            <IconButton
                              aria-label="削除"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => deleteSharedTask(task.id)}
                            />
                          </>
                        )}
                      </HStack>
                    </HStack>

                    <Text mb={2} fontSize="sm" noOfLines={2}>
                      {task.description}
                    </Text>

                    <HStack justifyContent="space-between" mt={3}>
                      <HStack>
                        <Text fontSize="xs" color="gray.500">
                          期限: {formatDate(task.due_date)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          作成者: {task.created_by_username}
                        </Text>
                      </HStack>

                      {addedTaskIds.includes(task.id) ? (
                        <Badge colorScheme="green">追加済み</Badge>
                      ) : (
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<AddIcon />}
                          onClick={() => addTaskToUser(task.id)}
                          isLoading={isAddingTask[task.id]}
                          isDisabled={isAddingTask[task.id]}
                        >
                          自分のタスクに追加
                        </Button>
                      )}
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* 共有タスク作成/編集モーダル */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        mode={editingTask ? "edit" : "shared"}
        task={editingTask || undefined}
        onSuccess={fetchTasks}
      />
    </Container>
  );
}
