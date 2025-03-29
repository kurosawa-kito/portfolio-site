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
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import PageTitle from "@/components/PageTitle";
import TaskList from "@/components/TaskList";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  role: string;
};

type Task = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string;
  assigned_to: number;
  created_by: number;
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
        const res = await fetch("/api/admin/users");
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
  }, [toast, isLoggedIn]);

  useEffect(() => {
    // ログインしていない場合は処理しない
    if (!isLoggedIn) return;

    const fetchTasks = async () => {
      if (!selectedUser) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/tasks?userId=${selectedUser}`);
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
  }, [selectedUser, toast, isLoggedIn]);

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
    <div className="container mx-auto p-4" style={{ maxWidth: "960px" }}>
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
            <TaskList tasks={tasks} viewType="table" isLoading={isLoading} />
          </>
        )}
      </VStack>
    </div>
  );
}
