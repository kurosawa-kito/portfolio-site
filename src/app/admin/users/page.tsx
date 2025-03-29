"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  useToast,
  Text,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  useColorModeValue,
  Card,
  CardBody,
  VStack,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/PageTitle";

type UserData = {
  id: string;
  username: string;
  role: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingTasksInfo, setPendingTasksInfo] = useState<{
    pendingTasksCount: number;
    totalTasksCount: number;
    userId: string;
    username: string;
  } | null>(null);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isPendingTasksOpen,
    onOpen: onPendingTasksOpen,
    onClose: onPendingTasksClose,
  } = useDisclosure();

  const { user, isLoggedIn } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchUsers();
    }
  }, [isLoggedIn, user, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/users", {
        headers: {
          "x-user": JSON.stringify(user),
        },
      });

      if (!response.ok) {
        throw new Error("ユーザー情報の取得に失敗しました");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("ユーザー取得エラー:", error);
      toast({
        title: "エラー",
        description: "ユーザー情報の取得に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = (userData: UserData) => {
    setSelectedUser(userData);
    setNewRole(userData.role);
    onEditOpen();
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      setIsProcessing(true);
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user": JSON.stringify(user),
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newRole: newRole,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "権限更新成功",
          description: `${selectedUser.username}の権限を更新しました`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // ユーザーリストを更新
        fetchUsers();
        onEditClose();
      } else {
        toast({
          title: "権限更新失敗",
          description: data.message || "ユーザー権限の更新に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("権限更新エラー:", error);
      toast({
        title: "エラー",
        description: "サーバーエラーが発生しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (action: string = "check") => {
    if (!selectedUser) return;

    try {
      setIsProcessing(true);
      const response = await fetch(
        `/api/admin/users?id=${selectedUser.id}&action=${action}`,
        {
          method: "DELETE",
          headers: {
            "x-user": JSON.stringify(user),
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "ユーザー削除成功",
          description: `${selectedUser.username}を削除しました${
            action === "shareAll"
              ? "。未完了タスクは共有タスクに追加されました"
              : ""
          }`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // ユーザーリストを更新
        fetchUsers();
        onPendingTasksClose();
      } else if (data.needsAction) {
        // 未完了タスクがある場合
        setPendingTasksInfo({
          pendingTasksCount: data.pendingTasksCount,
          totalTasksCount: data.totalTasksCount,
          userId: data.userId,
          username: data.username,
        });
        onPendingTasksOpen();
      } else {
        toast({
          title: "ユーザー削除失敗",
          description: data.message || "ユーザーの削除に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("ユーザー削除エラー:", error);
      toast({
        title: "エラー",
        description: "サーバーエラーが発生しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ログインしていない場合またはユーザー情報がない場合は何も表示しない
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <Container maxW="960px" py={4}>
      <VStack spacing={6} align="stretch" width="100%">
        <PageTitle>ユーザー管理</PageTitle>
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            {user.role !== "admin" ? (
              <Alert status="error" mt={4}>
                <AlertIcon />
                <AlertTitle>アクセス権限がありません</AlertTitle>
                <AlertDescription>管理者専用ページです</AlertDescription>
              </Alert>
            ) : isLoading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="blue.500" />
                <Text mt={4}>ユーザー情報を読み込み中...</Text>
              </Box>
            ) : users.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                <AlertTitle>情報</AlertTitle>
                <AlertDescription>ユーザーが見つかりません</AlertDescription>
              </Alert>
            ) : (
              <Box overflowX="auto" width="100%">
                <Table variant="simple" width="100%">
                  <Thead>
                    <Tr>
                      <Th>ユーザー名</Th>
                      <Th>権限</Th>
                      <Th textAlign="center">操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((userData) => (
                      <Tr key={userData.id}>
                        <Td>{userData.username}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              userData.role === "admin" ? "purple" : "blue"
                            }
                          >
                            {userData.role === "admin"
                              ? "管理者"
                              : "一般ユーザー"}
                          </Badge>
                        </Td>
                        <Td textAlign="center">
                          <IconButton
                            aria-label="権限を編集"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            mr={2}
                            onClick={() => handleOpenEditModal(userData)}
                            isDisabled={userData.id === user.id}
                          />
                          <IconButton
                            aria-label="ユーザーを削除"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser(userData);
                              handleDeleteUser("check");
                            }}
                            isDisabled={userData.id === user.id}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}

            {/* 権限編集モーダル */}
            <Modal isOpen={isEditOpen} onClose={onEditClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>ユーザー権限の変更</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {selectedUser && (
                    <>
                      <Text mb={4}>
                        <strong>{selectedUser.username}</strong>{" "}
                        の権限を変更します。
                      </Text>
                      <Select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        mb={4}
                      >
                        <option value="user">一般ユーザー</option>
                        <option value="admin">管理者</option>
                      </Select>
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={handleUpdateRole}
                    isLoading={isProcessing}
                  >
                    変更する
                  </Button>
                  <Button variant="ghost" onClick={onEditClose}>
                    キャンセル
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* 未完了タスク確認モーダル */}
            <Modal isOpen={isPendingTasksOpen} onClose={onPendingTasksClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>未完了タスクの確認</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {pendingTasksInfo && (
                    <>
                      <Text mb={4}>
                        {pendingTasksInfo.username} には{" "}
                        {pendingTasksInfo.pendingTasksCount}{" "}
                        件の未完了タスクがあります。
                      </Text>
                      <Text mb={4}>どのように処理しますか？</Text>
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button mr={3} onClick={onPendingTasksClose}>
                    キャンセル
                  </Button>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleDeleteUser("shareAll")}
                    isLoading={isProcessing}
                  >
                    共有タスクへ追加
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => handleDeleteUser("deleteAll")}
                    isLoading={isProcessing}
                  >
                    すべて削除
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
