"use client";

import Link from "next/link";
import { Flex, Text, Box } from "@chakra-ui/react";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function TaskHeader() {
  const { user, isLoggedIn, showTaskHeader, setShowTaskHeader } = useAuth();

  // ログイン時にタスクヘッダーを表示
  useEffect(() => {
    if (isLoggedIn) {
      setShowTaskHeader(true);
    }
  }, [isLoggedIn, setShowTaskHeader]);

  // ログインしていない場合またはshowTaskHeaderがfalseの場合は表示しない
  if (!isLoggedIn || !showTaskHeader) {
    return null;
  }

  return (
    <Box
      as="header"
      position="fixed"
      top="60px"
      left={0}
      right={0}
      zIndex={100}
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      boxShadow="sm"
      h="50px"
    >
      <Flex
        maxW="1200px"
        mx="auto"
        px={4}
        h="50px"
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap={4}>
          {user?.role === "admin" && (
            <>
              <Link href="/admin/dashboard" passHref>
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  color="blue.600"
                  cursor="pointer"
                  _hover={{ color: "blue.700" }}
                >
                  管理者ダッシュボード
                </Text>
              </Link>
            </>
          )}
          <Link href="/member/tasks" passHref>
            <Text
              fontSize="md"
              fontWeight="medium"
              color="blue.600"
              cursor="pointer"
              _hover={{ color: "blue.700" }}
            >
              タスク管理
            </Text>
          </Link>
          <Link href="/shared" passHref>
            <Text
              fontSize="md"
              fontWeight="medium"
              color="purple.600"
              cursor="pointer"
              _hover={{ color: "purple.700" }}
            >
              共有ボード
            </Text>
          </Link>
        </Flex>
        <LogoutButton />
      </Flex>
    </Box>
  );
}
