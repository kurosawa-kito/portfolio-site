"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Select,
  Text,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import TaskList from "@/components/TaskList";
import PageTitle from "@/components/PageTitle";

type Task = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  created_by: string;
  created_by_username?: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    // 管理者以外はリダイレクト
    if (isLoggedIn && user && user.role !== "admin") {
      router.push("/member/tasks");
      return;
    }

    if (isLoggedIn && user) {
      fetchUsers();
    }
  }, [isLoggedIn, user, router]);

  const fetchUsers = async () => {
    try {
      // 実際のAPIがある場合はそこから取得
      // モックデータ
      setUsers([
        { id: "user1", username: "admin" },
        { id: "user2", username: "user" },
        { id: "user3", username: "testuser" },
      ]);
    } catch (error) {
      console.error("ユーザー取得エラー:", error);
    }
  };

  const fetchUserTasks = async (userId: string) => {
    setIsLoading(true);
    try {
      // 実際のAPIがある場合はそこから取得
      // モックデータ
      setTimeout(() => {
        const mockTasks = [
          {
            id: "task1",
            title: "タスク1",
            description: "詳細説明1",
            due_date: "2023-12-31",
            priority: "high",
            status: "pending",
            created_by: userId,
            created_by_username: users.find((u) => u.id === userId)?.username,
          },
          {
            id: "task2",
            title: "タスク2",
            description: "詳細説明2",
            due_date: "2023-12-25",
            priority: "medium",
            status: "completed",
            created_by: userId,
            created_by_username: users.find((u) => u.id === userId)?.username,
          },
        ];
        setTasks(mockTasks);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("タスク取得エラー:", error);
      setIsLoading(false);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    if (userId) {
      fetchUserTasks(userId);
    } else {
      setTasks([]);
    }
  };

  // ログインしていない場合またはユーザー情報がない場合は何も表示しない
  if (!isLoggedIn || !user) {
    return null;
  }

  // 管理者以外は何も表示しない
  if (user.role !== "admin") {
    return null;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mb={6}>
        <CardBody>
          <PageTitle
            title="管理者ダッシュボード"
            gradient="linear(to-r, blue.600, purple.600)"
          />
        </CardBody>
      </Card>

      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <FormControl mb={6}>
            <FormLabel fontWeight="bold">ユーザー選択:</FormLabel>
            <Select
              placeholder="ユーザーを選択"
              value={selectedUser}
              onChange={handleUserChange}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </Select>
          </FormControl>

          <Divider mb={6} />

          {selectedUser ? (
            <Box>
              <Text fontWeight="bold" mb={4}>
                {users.find((u) => u.id === selectedUser)?.username}のタスク一覧
              </Text>
              <TaskList tasks={tasks} viewType="table" isLoading={isLoading} />
            </Box>
          ) : (
            <Text textAlign="center" color="gray.500">
              ユーザーを選択するとタスク一覧が表示されます
            </Text>
          )}
        </CardBody>
      </Card>
    </Container>
  );
}
