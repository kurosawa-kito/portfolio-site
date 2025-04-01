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
  FormErrorMessage,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loginIdError, setLoginIdError] = useState("");
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

  // ログインIDのバリデーション
  const validateLoginId = (value: string) => {
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      setLoginIdError("ログインIDは英数字のみ使用できます");
      return false;
    }
    setLoginIdError("");
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // フォーム送信前にバリデーション
    if (!validateLoginId(loginId)) {
      return;
    }

    try {
      await login(loginId, password);
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
        description: "ログインIDまたはパスワードが正しくありません",
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
                <FormControl isRequired isInvalid={!!loginIdError}>
                  <FormLabel>ログインID</FormLabel>
                  <Input
                    type="text"
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value);
                      validateLoginId(e.target.value);
                    }}
                    size="lg"
                    placeholder="ログインIDを入力（英数字のみ）"
                  />
                  {loginIdError && (
                    <FormErrorMessage>{loginIdError}</FormErrorMessage>
                  )}
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
              <Link href="/products" passHref>
                <ChakraLink
                  color="blue.500"
                  _hover={{ textDecoration: "none" }}
                  mr={4}
                >
                  Products
                </ChakraLink>
              </Link>
              <Link href="/register" passHref>
                <ChakraLink
                  color="green.500"
                  _hover={{ textDecoration: "none" }}
                >
                  新規ユーザー登録
                </ChakraLink>
              </Link>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
