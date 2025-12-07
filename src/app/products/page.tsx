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
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthProvider";
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
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading
          size="xl"
          bgGradient="linear(to-r, blue.500, purple.500)"
          bgClip="text"
          textAlign="center"
        >
          プロダクト一覧
        </Heading>

        {/* RECIPAI セクション */}
        <Heading
          size="lg"
          bgGradient="linear(to-r, orange.400, red.500)"
          bgClip="text"
          textAlign="center"
        >
          RECIPAI - AIレシピ提案アプリ
        </Heading>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" textAlign="center">
                冷蔵庫にある食材を入力するだけで、AIが最適なレシピを提案します。
                写真から食材を自動認識する機能も搭載しています。
              </Text>

              <Divider />

              <Box>
                <Heading size="md" mb={4}>
                  主な機能
                </Heading>
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    食材からAIがレシピを自動生成
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    写真から食材を自動認識（Google Cloud Vision API）
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    お気に入りレシピの保存機能
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    レシピ履歴の管理
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    レスポンシブ対応のモバイルフレンドリーUI
                  </ListItem>
                </List>
              </Box>

              <Divider />

              <Box>
                <Heading size="md" mb={4}>
                  使い方
                </Heading>
                <List spacing={3}>
                  <ListItem>
                    <Text>
                      <strong>1.</strong>{" "}
                      冷蔵庫にある食材を入力、または写真をアップロード
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text>
                      <strong>2.</strong> 「レシピを提案」ボタンをクリック
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text>
                      <strong>3.</strong> AIが食材に合ったレシピを複数提案
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text>
                      <strong>4.</strong> 気に入ったレシピをお気に入りに保存
                    </Text>
                  </ListItem>
                </List>
              </Box>

              <Box textAlign="center" pt={4}>
                <Link
                  href="https://recipai-lyart.vercel.app"
                  passHref
                  target="_blank"
                >
                  <Button
                    colorScheme="orange"
                    size="lg"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "md",
                    }}
                  >
                    RECIPAIを試す →
                  </Button>
                </Link>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Divider my={4} />

        {/* タスク管理ツール セクション */}
        <Heading
          size="lg"
          bgGradient="linear(to-r, blue.500, purple.500)"
          bgClip="text"
          textAlign="center"
        >
          タスク管理ツール
        </Heading>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" textAlign="center">
                シンプルで使いやすいタスク管理ツールです。
                チームの作業効率を向上させ、プロジェクトの進行をスムーズにします。
              </Text>

              <Divider />

              <Box>
                <Heading size="md" mb={4}>
                  主な機能
                </Heading>
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    タスクの作成、編集、削除
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    優先度の設定（高、中、低）
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    期限の設定と管理
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    タスクの完了状態の管理
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    管理者向けの詳細な管理機能
                  </ListItem>
                </List>
              </Box>

              <Divider />

              <Box>
                <Heading size="md" mb={4}>
                  テストユーザー情報
                </Heading>
                <VStack spacing={4} align="stretch">
                  <Card variant="outline" bg="gray.50">
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Badge colorScheme="purple">管理者ユーザー</Badge>
                        <Text>
                          <strong>ユーザー名:</strong> admin
                          <br />
                          <strong>パスワード:</strong> admin123
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          管理者ユーザーは全ての機能にアクセスできます。
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card variant="outline" bg="gray.50">
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Badge colorScheme="blue">一般ユーザー</Badge>
                        <Text>
                          <strong>ユーザー名:</strong> user
                          <br />
                          <strong>パスワード:</strong> user123
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          一般ユーザーは基本的なタスク管理機能を使用できます。
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </Box>

              <Box textAlign="center" pt={4}>
                {isLoggedIn ? (
                  <Link href={"/member/tasks"} passHref>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "md",
                      }}
                    >
                      タスク管理ツールを使う
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" passHref>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "md",
                      }}
                    >
                      タスク管理ツールを使う
                    </Button>
                  </Link>
                )}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
