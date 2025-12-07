"use client";

import { useState } from "react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthProvider";

export default function Register() {
  const [username, setUsername] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    loginId: "",
    password: "",
    confirmPassword: "",
  });
  const toast = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // バリデーション関数
  const validateUsername = (value: string) => {
    if (value.length < 3) {
      return "ユーザー名は3文字以上で入力してください";
    }
    return "";
  };

  const validateLoginId = (value: string) => {
    if (value.length < 3) {
      return "ログインIDは3文字以上で入力してください";
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return "ログインIDは英数字のみ使用できます";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      return "パスワードは6文字以上で入力してください";
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    if (
      !(
        (hasUpperCase && hasLowerCase) ||
        (hasUpperCase && hasNumber) ||
        (hasLowerCase && hasNumber)
      )
    ) {
      return "英大文字、英小文字、数字のうち少なくとも2種類を組み合わせてください";
    }

    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      return "パスワードが一致しません";
    }
    return "";
  };

  // フォーカスアウト時のハンドラー
  const handleUsernameBlur = () => {
    setErrors({
      ...errors,
      username: validateUsername(username),
    });
  };

  const handleLoginIdBlur = () => {
    setErrors({
      ...errors,
      loginId: validateLoginId(loginId),
    });
  };

  const handlePasswordBlur = () => {
    setErrors({
      ...errors,
      password: validatePassword(password),
    });
  };

  const handleConfirmPasswordBlur = () => {
    setErrors({
      ...errors,
      confirmPassword: validateConfirmPassword(confirmPassword),
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // すべてのフィールドのバリデーションを行う
    const usernameError = validateUsername(username);
    const loginIdError = validateLoginId(loginId);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    // エラー状態を更新
    setErrors({
      username: usernameError,
      loginId: loginIdError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // いずれかのエラーがある場合は処理を中止
    if (
      usernameError ||
      loginIdError ||
      passwordError ||
      confirmPasswordError
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, login_id: loginId, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "ユーザー登録成功",
          description: "ログインしています...",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // 登録後、自動的にログイン処理を行う
        try {
          await login(loginId, password);
          // ログイン成功（リダイレクトはAuthContext内のlogin関数で処理される）
        } catch (loginError) {
          console.error("自動ログインエラー:", loginError);
          toast({
            title: "自動ログインに失敗しました",
            description: "ログインページへ移動します",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          router.push("/login");
        }
      } else {
        toast({
          title: "登録失敗",
          description: data.message || "ユーザー登録に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        if (data.details) {
          console.error("登録エラーの詳細:", data.details);
        }
      }
    } catch (error) {
      console.error("登録エラー:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "サーバーエラーが発生しました",
        status: "error",
        duration: 5000,
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
            <Heading
              size="lg"
              bgGradient="linear(to-r, green.500, teal.500)"
              bgClip="text"
              textAlign="center"
            >
              新規ユーザー登録
            </Heading>

            <form onSubmit={handleRegister}>
              <VStack spacing={4}>
                <FormControl isRequired isInvalid={!!errors.username}>
                  <FormLabel>ユーザー名</FormLabel>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={handleUsernameBlur}
                    size="lg"
                    placeholder="ユーザー名を入力"
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    3文字以上で入力してください
                  </Text>
                  {errors.username && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.username}
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.loginId}>
                  <FormLabel>ログインID</FormLabel>
                  <Input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    onBlur={handleLoginIdBlur}
                    size="lg"
                    placeholder="ログインIDを入力（英数字のみ）"
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    3文字以上の英数字で入力してください
                  </Text>
                  {errors.loginId && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.loginId}
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.password}>
                  <FormLabel>パスワード</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                    size="lg"
                    placeholder="パスワードを入力"
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    6文字以上で入力してください。英大文字、英小文字、数字のうち少なくとも2種類を組み合わせる必要があります。
                  </Text>
                  {errors.password && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.password}
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                  <FormLabel>パスワード（確認）</FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={handleConfirmPasswordBlur}
                    size="lg"
                    placeholder="パスワードを再入力"
                  />
                  {errors.confirmPassword && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="登録中"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                >
                  登録する
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
              <Link href="/login" passHref>
                <ChakraLink
                  color="blue.500"
                  _hover={{ textDecoration: "none" }}
                >
                  既にアカウントをお持ちの方はこちら
                </ChakraLink>
              </Link>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
