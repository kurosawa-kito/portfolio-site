"use client";

import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EbayLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ebay-automation/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "ログイン成功",
          description: "eBay自動化ツールにログインしました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/products/ebay-automation");
      } else {
        setError(data.error || "ログインに失敗しました");
      }
    } catch (error) {
      setError("ネットワークエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8}>
        <Heading as="h1" size="xl" textAlign="center" color="blue.600">
          eBay自動化ツール
        </Heading>
        <Text fontSize="lg" color="gray.600" textAlign="center">
          ログインしてeBay出品の自動化を始めましょう
        </Text>

        <Card w="full" boxShadow="lg">
          <CardBody>
            <form onSubmit={handleLogin}>
              <VStack spacing={6}>
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <FormControl isRequired>
                  <FormLabel>メールアドレス</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>パスワード</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワードを入力"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="ログイン中..."
                >
                  ログイン
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <Box textAlign="center" fontSize="sm" color="gray.500">
          <Text mb={2}>テストアカウント:</Text>
          <Text>一般ユーザー: ebayuser@example.com / password123</Text>
          <Text>管理者: admin@ebay-automation.com / admin123</Text>
        </Box>

        <Box textAlign="center" fontSize="sm" color="gray.500">
          <Text>
            タスク管理ツールは{" "}
            <Button
              as="a"
              href="/login"
              variant="link"
              color="blue.500"
              size="sm"
            >
              こちら
            </Button>{" "}
            からアクセスできます
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
