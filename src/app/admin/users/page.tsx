"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Text,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// ユーザーの型定義
interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "member",
  });
  const [bulkUsers, setBulkUsers] = useState<
    { username: string; password: string; role: string }[]
  >([{ username: "", password: "", role: "member" }]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtitleBg = useColorModeValue("gray.50", "gray.700");

  // ユーザー一覧を取得
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        headers: {
          "x-user": JSON.stringify(user),
        },
      });

      if (!response.ok) {
        throw new Error(`ユーザー取得エラー: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
      setErrorMessage(null);
    } catch (error) {
      console.error("ユーザー取得エラー:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "ユーザーの取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  // 一括ユーザー追加用のフィールドを追加
  const addUserField = () => {
    setBulkUsers([
      ...bulkUsers,
      { username: "", password: "", role: "member" },
    ]);
  };

  // 一括ユーザー追加用のフィールドを削除
  const removeUserField = (index: number) => {
    const updatedUsers = [...bulkUsers];
    updatedUsers.splice(index, 1);
    setBulkUsers(updatedUsers);
  };

  // 一括ユーザー追加用のフィールド更新
  const updateBulkUserField = (index: number, field: string, value: string) => {
    const updatedUsers = [...bulkUsers];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setBulkUsers(updatedUsers);
  };

  // 単一ユーザー追加
  const addUser = async () => {
    try {
      if (!newUser.username || !newUser.password) {
        toast({
          title: "入力エラー",
          description: "ユーザー名とパスワードは必須です",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": JSON.stringify(user),
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error(`ユーザー追加エラー: ${response.status}`);
      }

      toast({
        title: "ユーザー追加",
        description: "ユーザーが正常に追加されました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // フォームをリセットし、ユーザー一覧を更新
      setNewUser({ username: "", password: "", role: "member" });
      fetchUsers();
    } catch (error) {
      console.error("ユーザー追加エラー:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "ユーザーの追加に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 一括ユーザー追加
  const addBulkUsers = async () => {
    try {
      // 入力チェック
      const invalidUsers = bulkUsers.filter((u) => !u.username || !u.password);
      if (invalidUsers.length > 0) {
        toast({
          title: "入力エラー",
          description:
            "すべてのユーザーにユーザー名とパスワードを設定してください",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": JSON.stringify(user),
        },
        body: JSON.stringify({ users: bulkUsers }),
      });

      if (!response.ok) {
        throw new Error(`一括ユーザー追加エラー: ${response.status}`);
      }

      toast({
        title: "ユーザー追加",
        description: `${bulkUsers.length}人のユーザーが正常に追加されました`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // モーダルを閉じて一覧を更新
      onClose();
      setBulkUsers([{ username: "", password: "", role: "member" }]);
      fetchUsers();
    } catch (error) {
      console.error("一括ユーザー追加エラー:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "ユーザーの一括追加に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ユーザー削除
  const deleteUser = async (userId: string) => {
    try {
      if (!window.confirm("このユーザーを削除してもよろしいですか？")) {
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "x-user": JSON.stringify(user),
        },
      });

      if (!response.ok) {
        throw new Error(`ユーザー削除エラー: ${response.status}`);
      }

      toast({
        title: "ユーザー削除",
        description: "ユーザーが正常に削除されました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // ユーザー一覧を更新
      fetchUsers();
    } catch (error) {
      console.error("ユーザー削除エラー:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "ユーザーの削除に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 初回マウント時にユーザー一覧を取得
  useEffect(() => {
    // 認証チェック
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/products");
      return;
    }

    fetchUsers();
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.role !== "admin") {
    return null;
  }

  return (
    <Container maxW="4xl" py={4}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2} textAlign="center">
            ユーザー管理
          </Heading>
          <Text textAlign="center" color="gray.600">
            ユーザーの追加、削除を行います
          </Text>
        </Box>

        {/* 単一ユーザー追加フォーム */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Box
              position="relative"
              py={2}
              mb={4}
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
                bgGradient="linear(to-r, blue.500, green.500)"
                bgClip="text"
              >
                新規ユーザー追加
              </Text>
            </Box>

            <Flex gap={4} direction={{ base: "column", md: "row" }}>
              <FormControl flex="1">
                <FormLabel>ユーザー名</FormLabel>
                <Input
                  placeholder="ユーザー名を入力"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                />
              </FormControl>
              <FormControl flex="1">
                <FormLabel>パスワード</FormLabel>
                <Input
                  type="password"
                  placeholder="パスワードを入力"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </FormControl>
              <FormControl flex="1">
                <FormLabel>ロール</FormLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="admin">管理者</option>
                  <option value="member">一般メンバー</option>
                </Select>
              </FormControl>
            </Flex>

            <Flex mt={4} justify="space-between">
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={addUser}
              >
                ユーザーを追加
              </Button>
              <Button colorScheme="green" onClick={onOpen}>
                複数ユーザーを一括追加
              </Button>
            </Flex>
          </CardBody>
        </Card>

        {/* ユーザー一覧 */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Box
              position="relative"
              py={2}
              mb={4}
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
              >
                ユーザー一覧
              </Text>
            </Box>

            {loading ? (
              <Text textAlign="center" py={4}>
                ユーザー情報を読み込み中...
              </Text>
            ) : errorMessage ? (
              <Text color="red.500" textAlign="center" py={4}>
                {errorMessage}
              </Text>
            ) : users.length === 0 ? (
              <Text textAlign="center" py={4}>
                ユーザーが登録されていません
              </Text>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>ユーザー名</Th>
                      <Th>ロール</Th>
                      <Th>登録日</Th>
                      <Th>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.id}>
                        <Td fontSize="sm">{user.id}</Td>
                        <Td>{user.username}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              user.role === "admin" ? "purple" : "blue"
                            }
                          >
                            {user.role === "admin" ? "管理者" : "一般メンバー"}
                          </Badge>
                        </Td>
                        <Td fontSize="sm">
                          {new Date(user.created_at).toLocaleString("ja-JP")}
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Delete user"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* 一括ユーザー追加モーダル */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>複数ユーザーを一括追加</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {bulkUsers.map((bulkUser, index) => (
                <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="bold">ユーザー {index + 1}</Text>
                    {index > 0 && (
                      <IconButton
                        aria-label="Remove user"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => removeUserField(index)}
                      />
                    )}
                  </Flex>
                  <FormControl mb={2}>
                    <FormLabel>ユーザー名</FormLabel>
                    <Input
                      placeholder="ユーザー名を入力"
                      value={bulkUser.username}
                      onChange={(e) =>
                        updateBulkUserField(index, "username", e.target.value)
                      }
                    />
                  </FormControl>
                  <FormControl mb={2}>
                    <FormLabel>パスワード</FormLabel>
                    <Input
                      type="password"
                      placeholder="パスワードを入力"
                      value={bulkUser.password}
                      onChange={(e) =>
                        updateBulkUserField(index, "password", e.target.value)
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>ロール</FormLabel>
                    <Select
                      value={bulkUser.role}
                      onChange={(e) =>
                        updateBulkUserField(index, "role", e.target.value)
                      }
                    >
                      <option value="admin">管理者</option>
                      <option value="member">一般メンバー</option>
                    </Select>
                  </FormControl>
                </Box>
              ))}

              <Button
                leftIcon={<AddIcon />}
                onClick={addUserField}
                variant="outline"
              >
                ユーザーフィールドを追加
              </Button>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              キャンセル
            </Button>
            <Button colorScheme="blue" onClick={addBulkUsers}>
              {bulkUsers.length}人のユーザーを追加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
