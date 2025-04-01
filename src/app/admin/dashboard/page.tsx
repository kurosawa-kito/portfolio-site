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

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
        console.error("ユーザー取得エラー:", error);
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
        console.error("タスク取得エラー:", error);
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
            <Divider />
            <TaskList
              tasks={tasks}
              viewType="table"
              isLoading={isLoading}
              onStatusChange={undefined}
              onEditTask={undefined}
              onDeleteTask={undefined}
              showSubtitle={false}
            />
          </>
        )}
      </VStack>
    </Container>
  );
}
