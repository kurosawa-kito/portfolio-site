"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Select,
  Text,
  useToast,
  VStack,
  Card,
  CardBody,
  useColorModeValue,
  Divider,
  Container,
  Grid,
  GridItem,
  Heading,
  Badge,
  Center,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import PageTitle from "@/components/PageTitle";
import TaskList from "@/components/TaskList";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  role: string;
  email: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to: string;
  created_by: string;
  assigned_to_username?: string;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
};

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

// 日付をフォーマットする関数（UTCからの直接変換）
const formatDateTime = (dateString: string, isAllDay?: boolean): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // 無効な日付の場合はそのまま返す

    // UTCとして扱い、タイムゾーン変換を避ける
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    // 終日タスクの場合は時間を表示しない
    if (isAllDay) {
      return `${year}/${month}/${day}`;
    }

    // 時間情報も表示（UTCの値をそのまま使用）
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error("日付フォーマットエラー:", error);
    return dateString;
  }
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const toast = useToast();
  const { user, isLoggedIn, setShowTaskHeader } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
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

  useEffect(() => {
    // ログインしていない場合は処理しない
    if (!isLoggedIn) return;

    const fetchUsers = async () => {
      try {
        // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
        const userStr = JSON.stringify(user);
        const userBase64 =
          typeof window !== "undefined"
            ? safeBase64Encode(userStr, user)
            : Buffer.from(userStr).toString("base64");

        const res = await fetch("/api/admin/users", {
          headers: {
            "x-user-base64": userBase64,
          },
        });
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (error) {
        toast({
          title: "エラー",
          description: "ユーザー情報の取得に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [toast, isLoggedIn, user]);

  useEffect(() => {
    // ログインしていない場合は処理しない
    if (!isLoggedIn) return;

    const fetchTasks = async () => {
      if (!selectedUser) return;
      setIsLoadingTasks(true);
      try {
        // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
        const userStr = JSON.stringify(user);
        const userBase64 =
          typeof window !== "undefined"
            ? safeBase64Encode(userStr, user)
            : Buffer.from(userStr).toString("base64");

        const res = await fetch(`/api/admin/tasks?userId=${selectedUser.id}`, {
          headers: {
            "x-user-base64": userBase64,
          },
        });
        const data = await res.json();
        if (data.success) setTasks(data.tasks);
      } catch (error) {
        toast({
          title: "エラー",
          description: "タスク情報の取得に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [selectedUser, toast, isLoggedIn, user]);

  // ログインしていない場合は何も表示しない
  if (!isLoggedIn) {
    return null;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto p-4">
        <VStack spacing={6} align="stretch" width="100%">
          <PageTitle>管理者ダッシュボード</PageTitle>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Text>このページにアクセスする権限がありません。</Text>
            </CardBody>
          </Card>
        </VStack>
      </div>
    );
  }

  return (
    <Container maxW="6xl" py={4}>
      <VStack spacing={4} align="stretch">
        <PageTitle>管理者ダッシュボード</PageTitle>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
          {/* 左側：ユーザー一覧 */}
          <GridItem>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              boxShadow="md"
              bg={useColorModeValue("white", "gray.800")}
              height="calc(100vh - 180px)"
              display="flex"
              flexDirection="column"
            >
              <Heading size="md" mb={4}>
                ユーザー一覧
              </Heading>
              <Box
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
                    background: useColorModeValue("purple.300", "purple.600"),
                    borderRadius: "4px",
                    cursor: "pointer",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: useColorModeValue("purple.400", "purple.500"),
                  },
                }}
              >
                {isLoadingUsers ? (
                  <Center py={4}>
                    <Spinner size="lg" />
                  </Center>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {users.map((user) => (
                      <Box
                        key={user.id}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{
                          bg: useColorModeValue("gray.50", "gray.700"),
                        }}
                        bg={
                          selectedUser?.id === user.id
                            ? useColorModeValue("blue.50", "blue.900")
                            : useColorModeValue("white", "gray.800")
                        }
                        onClick={() => setSelectedUser(user)}
                      >
                        <HStack justify="space-between">
                          <Text fontWeight="bold">{user.username}</Text>
                          <Badge
                            colorScheme={user.role === "admin" ? "red" : "blue"}
                          >
                            {user.role === "admin" ? "管理者" : "メンバー"}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {user.email}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </Box>
          </GridItem>

          {/* 右側：ユーザー詳細とタスク */}
          <GridItem>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              boxShadow="md"
              bg={useColorModeValue("white", "gray.800")}
              height="calc(100vh - 180px)"
              display="flex"
              flexDirection="column"
            >
              {selectedUser ? (
                <>
                  <Box mb={4}>
                    <Heading size="md">ユーザー詳細</Heading>
                    <Text mt={2}>
                      <strong>ユーザー名:</strong> {selectedUser.username}
                    </Text>
                    <Text>
                      <strong>メール:</strong> {selectedUser.email}
                    </Text>
                    <Text>
                      <strong>権限:</strong>{" "}
                      {selectedUser.role === "admin" ? "管理者" : "メンバー"}
                    </Text>
                  </Box>

                  <Divider my={2} />
                  <Heading size="sm" mb={2}>
                    担当タスク
                  </Heading>

                  {isLoadingTasks ? (
                    <Center py={4}>
                      <Spinner size="lg" />
                    </Center>
                  ) : (
                    <Box
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
                        tasks={tasks}
                        isLoading={isLoadingTasks}
                        viewType="table"
                        onStatusChange={undefined}
                        onEditTask={undefined}
                        onDeleteTask={undefined}
                        showSubtitle={false}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Center h="100%">
                  <Text color="gray.500">ユーザーを選択してください</Text>
                </Center>
              )}
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
}
