"use client";

import {
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Box,
  Card,
  CardBody,
  useColorModeValue,
  SimpleGrid,
  Badge,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Products() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { isLoggedIn, setShowTaskHeader } = useAuth();

  // ページロード時にタスクヘッダーを非表示にする
  useEffect(() => {
    setShowTaskHeader(false);
  }, [setShowTaskHeader]);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading
            size="xl"
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
            mb={4}
          >
            Products
          </Heading>
          <Text fontSize="lg" color="gray.600">
            私が開発したプロダクトをご覧ください
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {/* タスク管理ツール */}
          <Card
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              transition: "all 0.2s",
            }}
          >
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md" color="blue.500">
                    タスク管理ツール
                  </Heading>
                  <Badge colorScheme="green">運用中</Badge>
                </HStack>

                <Text color="gray.600">
                  チームで使えるシンプルなタスク管理ツール。
                  優先度設定、期限管理、管理者機能などを搭載。
                </Text>

                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold">
                    技術スタック:
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    <Badge colorScheme="blue">Next.js</Badge>
                    <Badge colorScheme="purple">TypeScript</Badge>
                    <Badge colorScheme="teal">Chakra UI</Badge>
                    <Badge colorScheme="orange">PostgreSQL</Badge>
                  </HStack>
                </VStack>

                <Link href="/products/task-management" passHref>
                  <Button
                    colorScheme="blue"
                    w="full"
                    _hover={{
                      transform: "translateY(-1px)",
                    }}
                  >
                    詳細を見る
                  </Button>
                </Link>
              </VStack>
            </CardBody>
          </Card>

          {/* eBay自動化ツール */}
          <Card
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              transition: "all 0.2s",
            }}
          >
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md" color="orange.500">
                    eBay自動化ツール
                  </Heading>
                  <Badge colorScheme="yellow">開発中</Badge>
                </HStack>

                <Text color="gray.600">
                  eBay出品・在庫管理を自動化。
                  一括出品、価格監視、在庫同期などの機能を提供。
                </Text>

                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold">
                    技術スタック:
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    <Badge colorScheme="orange">React</Badge>
                    <Badge colorScheme="purple">TypeScript</Badge>
                    <Badge colorScheme="green">Node.js</Badge>
                    <Badge colorScheme="red">eBay API</Badge>
                  </HStack>
                </VStack>

                <Link href="/products/ebay-automation/login" passHref>
                  <Button
                    colorScheme="orange"
                    w="full"
                    _hover={{
                      transform: "translateY(-1px)",
                    }}
                  >
                    ログインして利用
                  </Button>
                </Link>
              </VStack>
            </CardBody>
          </Card>

          {/* 他のプロダクト用のプレースホルダー */}
          <Card
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            opacity={0.7}
          >
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md" color="gray.500">
                    Coming Soon...
                  </Heading>
                  <Badge colorScheme="gray">計画中</Badge>
                </HStack>

                <Text color="gray.500">
                  新しいプロダクトを開発中です。 お楽しみに！
                </Text>

                <Button colorScheme="gray" variant="outline" w="full" disabled>
                  準備中
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
