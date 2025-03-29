"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Card,
  CardBody,
  useColorModeValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggedIn } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // ログイン済みの場合はタスク管理ページにリダイレクト
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/member/tasks");
    }
  }, [isLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast({
        title: "ログイン成功",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("ログインエラー:", error);
      toast({
        title: "ログイン失敗",
        description: "ユーザー名またはパスワードが正しくありません",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={8} align="stretch">
            <Heading
              size="lg"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
              textAlign="center"
            >
              ログイン
            </Heading>

            <form onSubmit={handleLogin}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>ユーザー名</FormLabel>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    size="lg"
                    placeholder="ユーザー名を入力"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>パスワード</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    placeholder="パスワードを入力"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                >
                  ログイン
                </Button>
              </VStack>
            </form>

            <Box textAlign="center">
              <Text mb={2}>テストユーザー情報</Text>
              <VStack spacing={2} align="start" bg="gray.50" p={4} rounded="md">
                <Text>
                  <strong>管理者ユーザー:</strong>
                  <br />
                  ユーザー名: admin
                  <br />
                  パスワード: admin123
                </Text>
                <Text>
                  <strong>一般ユーザー:</strong>
                  <br />
                  ユーザー名: user
                  <br />
                  パスワード: user123
                </Text>
              </VStack>
            </Box>

            <Box textAlign="center">
              <Link href="/products" passHref>
                <ChakraLink
                  color="blue.500"
                  _hover={{ textDecoration: "none" }}
                >
                  Products
                </ChakraLink>
              </Link>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
