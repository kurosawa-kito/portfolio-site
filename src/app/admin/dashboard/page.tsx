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
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import PageTitle from "@/components/PageTitle";
import TaskList from "@/components/TaskList";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  role: string;
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
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useToast();
  const { user, isLoggedIn, setShowTaskHeader } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtitleBg = useColorModeValue("blue.50", "blue.900");

  // 初期化状態の設定
  useEffect(() => {
    // セッションストレージから直接チェック（初期レンダリング時のみ）
    const checkSession = () => {
      try {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);

            // 管理者権限のチェック
            if (userData.role === "admin") {
              // 管理者権限があれば初期化完了とする
              setIsInitialized(true);
              return true;
            }
          } catch (e) {
            console.error("セッションデータ解析エラー:", e);
          }
        }
        return false;
      } catch (e) {
        console.error("セッションチェックエラー:", e);
        return false;
      }
    };

    // まだ初期化されておらず、ユーザー情報もない場合はセッションをチェック
    if (!isInitialized && !user) {
      checkSession();
    } else if (user) {
      // ユーザー情報がある場合
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  // ログインチェック
  useEffect(() => {
    // 初期化完了後にのみログインチェックを行う
    if (isInitialized) {
      if (!isLoggedIn) {
        router.push("/products");
      } else if (user && user.role !== "admin") {
        // 管理者でない場合はメンバーページへリダイレクト
        router.push("/member/tasks");
      } else {
        // タスク管理ヘッダーを表示
        setShowTaskHeader(true);
      }
    }
  }, [isLoggedIn, user, router, setShowTaskHeader, isInitialized]);

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
      }
    };
    fetchUsers();
  }, [toast, isLoggedIn, user]);

  useEffect(() => {
    // ログインしていない場合は処理しない
    if (!isLoggedIn) return;

    const fetchTasks = async () => {
      if (!selectedUser) return;
      setIsLoading(true);
      try {
        // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
        const userStr = JSON.stringify(user);
        const userBase64 =
          typeof window !== "undefined"
            ? safeBase64Encode(userStr, user)
            : Buffer.from(userStr).toString("base64");

        const res = await fetch(`/api/admin/tasks?userId=${selectedUser}`, {
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
        setIsLoading(false);
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
    <Container maxW="960px" py={4}>
      <VStack spacing={6} align="stretch" width="100%">
        <PageTitle>管理者ダッシュボード</PageTitle>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack align="start" spacing={4}>
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
                    👤
                  </Box>
                  メンバータスク確認
                </Text>
              </Box>
              <Text mb={2}>ユーザーを選択してください：</Text>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                placeholder="ユーザーを選択"
                maxW="300px"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </Select>
            </VStack>
          </CardBody>
        </Card>

        {selectedUser && (
          <>
            <Divider my={2} />
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <TaskList
                  tasks={tasks}
                  isLoading={isLoading}
                  showEditButton={false}
                  showDeleteButton={false}
                  showCheckbox={false}
                  subtitleSpacing={6}
                  showSubtitle={true}
                  viewType="card"
                />
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Container>
  );
}
