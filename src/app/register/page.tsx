"use client";

import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Container,
  Card,
  CardBody,
  useColorModeValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/PageTitle";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (password !== confirmPassword) {
      toast({
        title: "パスワードが一致しません",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "パスワードが短すぎます",
        description: "6文字以上のパスワードを設定してください",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "ユーザー登録成功",
          description: "ログインページに移動します",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/login");
      } else {
        toast({
          title: "登録失敗",
          description: data.message || "ユーザー登録に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("登録エラー:", error);
      toast({
        title: "エラー",
        description: "サーバーエラーが発生しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={8} align="stretch">
            <PageTitle
              title="新規ユーザー登録"
              gradient="linear(to-r, green.500, teal.500)"
            />

            <form onSubmit={handleRegister}>
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
                    placeholder="パスワードを入力（6文字以上）"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>パスワード（確認）</FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    size="lg"
                    placeholder="パスワードを再入力"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                >
                  登録する
                </Button>
              </VStack>
            </form>

            <Box textAlign="center">
              <Text>アカウントをお持ちの方は</Text>
              <Link href="/login" passHref>
                <ChakraLink
                  color="blue.500"
                  _hover={{ textDecoration: "none" }}
                >
                  ログイン
                </ChakraLink>
              </Link>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
