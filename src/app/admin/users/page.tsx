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
  const [deleteAction, setDeleteAction] = useState<string>("check");

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
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onClose: onDeleteConfirmClose,
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

      // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
      const userStr = JSON.stringify(user);
      const userBase64 =
        typeof window !== "undefined"
          ? safeBase64Encode(userStr, user)
          : Buffer.from(userStr).toString("base64");

      const response = await fetch("/api/admin/users", {
        headers: {
          "x-user-base64": userBase64,
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

  const handleOpenDeleteConfirm = (userData: UserData) => {
    setSelectedUser(userData);
    onDeleteConfirmOpen();
  };

  // ユーザー削除前のチェック処理
  const handleCheckBeforeDelete = async (userData: UserData) => {
    if (!userData) return;

    setSelectedUser(userData);
    setIsProcessing(true);

    try {
      // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
      const userStr = JSON.stringify(user);
      const userBase64 =
        typeof window !== "undefined"
          ? safeBase64Encode(userStr, user)
          : Buffer.from(userStr).toString("base64");

      const response = await fetch(
        `/api/admin/users?id=${userData.id}&action=check`,
        {
          method: "GET",
          headers: {
            "x-user-base64": userBase64,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // タスクがない場合は直接削除確認モーダルを表示
        setDeleteAction("deleteAll");
        onDeleteConfirmOpen();
      } else if (data.needsAction) {
        // 未完了タスクがある場合は未完了タスク確認モーダルを表示
        setPendingTasksInfo({
          pendingTasksCount: data.pendingTasksCount,
          totalTasksCount: data.totalTasksCount,
          userId: data.userId,
          username: data.username,
        });
        onPendingTasksOpen();
      } else {
        toast({
          title: "エラー",
          description: data.message || "ユーザーの削除チェックに失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("ユーザー削除チェックエラー:", error);
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

    // 削除確認モーダルを閉じる前に処理フラグを設定
    setIsProcessing(true);

    try {
      // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
      const userStr = JSON.stringify(user);
      const userBase64 =
        typeof window !== "undefined"
          ? safeBase64Encode(userStr, user)
          : Buffer.from(userStr).toString("base64");

      const response = await fetch(
        `/api/admin/users?id=${selectedUser.id}&action=${action}`,
        {
          method: "DELETE",
          headers: {
            "x-user-base64": userBase64,
          },
        }
      );

      const data = await response.json();

      // 削除確認モーダルを閉じる
      onDeleteConfirmClose();

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
      // エラー時も確認モーダルを閉じる
      onDeleteConfirmClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      setIsProcessing(true);

      // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
      const userStr = JSON.stringify(user);
      const userBase64 =
        typeof window !== "undefined"
          ? safeBase64Encode(userStr, user)
          : Buffer.from(userStr).toString("base64");

      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-base64": userBase64,
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
                            isDisabled={
                              String(userData.id) === String(user?.id)
                            }
                          />
                          <IconButton
                            aria-label="ユーザーを削除"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleCheckBeforeDelete(userData)}
                            isDisabled={
                              String(userData.id) === String(user?.id)
                            }
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
                    onClick={() => {
                      // 共有タスクへ追加の選択後、削除確認モーダルを表示
                      onPendingTasksClose();
                      setDeleteAction("shareAll");
                      onDeleteConfirmOpen();
                    }}
                    isLoading={isProcessing}
                  >
                    共有タスクへ追加
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      // すべて削除の選択後、削除確認モーダルを表示
                      onPendingTasksClose();
                      setDeleteAction("deleteAll");
                      onDeleteConfirmOpen();
                    }}
                    isLoading={isProcessing}
                  >
                    すべて削除
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* 削除確認モーダル */}
            <Modal isOpen={isDeleteConfirmOpen} onClose={onDeleteConfirmClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>ユーザー削除の確認</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {selectedUser && (
                    <>
                      <Text mb={4}>
                        <strong>{selectedUser.username}</strong>{" "}
                        を削除しますか？ この操作は取り消せません。
                      </Text>
                      {deleteAction === "shareAll" && (
                        <Text mb={4} color="blue.500">
                          未完了のタスクは共有タスクに追加されます。
                        </Text>
                      )}
                      {deleteAction === "deleteAll" && (
                        <Text mb={4} color="red.500">
                          すべてのタスクが完全に削除されます。
                        </Text>
                      )}
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="red"
                    mr={3}
                    onClick={() => handleDeleteUser(deleteAction)}
                    isLoading={isProcessing}
                  >
                    削除する
                  </Button>
                  <Button variant="ghost" onClick={onDeleteConfirmClose}>
                    キャンセル
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
