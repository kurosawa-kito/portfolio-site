"use client";

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useEbayAuth } from "@/contexts/EbayAuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EbayAutomationPage() {
  const { user, isLoading, isAuthenticated, logout } = useEbayAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/products/ebay-automation/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/products/ebay-automation/login");
  };

  if (isLoading) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>認証を確認中...</Text>
        </VStack>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null; // リダイレクト中
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* ヘッダー */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Heading as="h1" size="xl" color="blue.600">
                eBay自動化ツール
              </Heading>
              <Text color="gray.600">こんにちは、{user?.fullName}さん</Text>
            </VStack>
            <HStack spacing={3}>
              <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                {user?.subscriptionPlan?.toUpperCase()} プラン
              </Badge>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                ログアウト
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* メイン機能カード */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <Card
            bg="gradient-to-br from-blue-50 to-blue-100"
            borderLeft="4px solid"
            borderLeftColor="blue.500"
            cursor="pointer"
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s"
            onClick={() => router.push("/products/ebay-automation/research")}
          >
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="md" color="blue.700">
                  📊 リサーチ機能
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  メルカリの商品をeBayで検索し、利益率を自動計算します
                </Text>
                <Button size="sm" colorScheme="blue" variant="outline">
                  開始する
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card
            bg="gradient-to-br from-green-50 to-green-100"
            borderLeft="4px solid"
            borderLeftColor="green.500"
            cursor="pointer"
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s"
            onClick={() => router.push("/products/ebay-automation/history")}
          >
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="md" color="green.700">
                  📋 出品履歴
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  これまでの出品履歴と売上実績を確認できます
                </Text>
                <Button size="sm" colorScheme="green" variant="outline">
                  確認する
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card
            bg="gradient-to-br from-purple-50 to-purple-100"
            borderLeft="4px solid"
            borderLeftColor="purple.500"
            cursor="pointer"
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s"
            onClick={() => router.push("/products/ebay-automation/settings")}
          >
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="md" color="purple.700">
                  ⚙️ 設定
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  利益率や手数料、自動化設定をカスタマイズします
                </Text>
                <Button size="sm" colorScheme="purple" variant="outline">
                  設定する
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 最近のアクティビティ */}
        <Box>
          <Heading size="lg" mb={4} color="gray.700">
            📈 最近のアクティビティ
          </Heading>
          <Card>
            <CardBody>
              <Text color="gray.500" textAlign="center" py={8}>
                まだアクティビティがありません
              </Text>
            </CardBody>
          </Card>
        </Box>
      </VStack>
    </Container>
  );
}
