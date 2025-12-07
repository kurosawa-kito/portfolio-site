"use client";

import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  Card,
  CardBody,
  useColorModeValue,
  Badge,
  HStack,
  Icon,
  SimpleGrid,
  Button,
  Avatar,
  Flex,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import Link from "next/link";

export default function Home() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  const techStacks = [
    { name: "PHP", color: "purple" },
    { name: "Java", color: "red" },
    { name: "JavaScript", color: "yellow" },
    { name: "TypeScript", color: "blue" },
    { name: "Next.js", color: "gray" },
    { name: "React", color: "cyan" },
    { name: "PostgreSQL", color: "blue" },
    { name: "SQL Server", color: "red" },
    { name: "Oracle", color: "orange" },
  ];

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* ヒーローセクション */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="xl"
        >
          <Box
            bgGradient="linear(to-r, blue.500, purple.600, pink.500)"
            h="120px"
          />
          <CardBody p={8} mt={-16}>
            <Flex direction={{ base: "column", md: "row" }} align="center" gap={6}>
              <Avatar
                size="2xl"
                name="Kurosawa"
                bg="blue.500"
                color="white"
                border="4px solid white"
                boxShadow="lg"
              />
              <VStack align={{ base: "center", md: "start" }} spacing={2}>
                <Heading
                  size="xl"
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  bgClip="text"
                >
                  Kurosawa
                </Heading>
                <Text color="gray.500" fontSize="lg" fontWeight="medium">
                  フルスタックエンジニア
                </Text>
                <HStack spacing={3} mt={2}>
                  <Link href="https://github.com/kurosawa-kito" target="_blank">
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="gray"
                      leftIcon={<ExternalLinkIcon />}
                    >
                      GitHub
                    </Button>
                  </Link>
                </HStack>
              </VStack>
            </Flex>
          </CardBody>
        </Card>

        {/* 自己紹介 */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box bgGradient="linear(to-r, blue.400, cyan.400)" h="4px" />
          <CardBody p={6}>
            <Heading size="md" mb={4}>
              👋 はじめまして
            </Heading>
            <Text lineHeight="tall" color="gray.600">
              金融業界でシステム開発に従事しているフルスタックエンジニアです。
              要件定義から設計、開発、運用保守まで幅広く経験しています。
              業務外でもモダンな技術に積極的に触れ、個人プロジェクトを通じて実践的なスキルを磨いています。
            </Text>
          </CardBody>
        </Card>

        {/* 技術スタック */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box bgGradient="linear(to-r, purple.400, pink.400)" h="4px" />
          <CardBody p={6}>
            <Heading size="md" mb={4}>
              🛠️ 技術スタック
            </Heading>
            <Wrap spacing={3}>
              {techStacks.map((tech) => (
                <WrapItem key={tech.name}>
                  <Badge
                    colorScheme={tech.color}
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    {tech.name}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          </CardBody>
        </Card>

        {/* プロジェクト紹介 */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box bgGradient="linear(to-r, orange.400, red.400)" h="4px" />
          <CardBody p={6}>
            <Heading size="md" mb={4}>
              🚀 個人プロジェクト
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {/* RECIPAI */}
              <Box
                p={5}
                bg={cardBg}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                transition="all 0.2s"
              >
                <HStack mb={2}>
                  <Text fontSize="2xl">🍳</Text>
                  <Heading size="sm">RECIPAI</Heading>
                </HStack>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  冷蔵庫の写真からAIがレシピを提案するWebアプリケーション
                </Text>
                <HStack flexWrap="wrap" spacing={1} mb={3}>
                  <Badge size="sm" colorScheme="blue">Next.js 15</Badge>
                  <Badge size="sm" colorScheme="purple">OpenAI</Badge>
                  <Badge size="sm" colorScheme="green">Prisma</Badge>
                </HStack>
                <Link href="https://recipai-lyart.vercel.app" target="_blank">
                  <Button size="sm" colorScheme="orange" variant="outline" rightIcon={<ExternalLinkIcon />}>
                    サイトを見る
                  </Button>
                </Link>
              </Box>

              {/* Portfolio Site */}
              <Box
                p={5}
                bg={cardBg}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                transition="all 0.2s"
              >
                <HStack mb={2}>
                  <Text fontSize="2xl">📋</Text>
                  <Heading size="sm">タスク管理ツール</Heading>
                </HStack>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  チーム向けタスク管理アプリケーション（このサイト内）
                </Text>
                <HStack flexWrap="wrap" spacing={1} mb={3}>
                  <Badge size="sm" colorScheme="blue">Next.js 14</Badge>
                  <Badge size="sm" colorScheme="teal">ChakraUI</Badge>
                  <Badge size="sm" colorScheme="green">PostgreSQL</Badge>
                </HStack>
                <Link href="/products">
                  <Button size="sm" colorScheme="blue" variant="outline" rightIcon={<ExternalLinkIcon />}>
                    詳細を見る
                  </Button>
                </Link>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* リンク */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Link href="/resume">
            <Card
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <Box bgGradient="linear(to-r, green.400, teal.400)" h="4px" />
              <CardBody p={6} textAlign="center">
                <Text fontSize="3xl" mb={2}>📄</Text>
                <Heading size="md" mb={2}>職務経歴書</Heading>
                <Text fontSize="sm" color="gray.500">
                  詳しい経歴・スキルはこちら
                </Text>
              </CardBody>
            </Card>
          </Link>

          <Link href="/products">
            <Card
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <Box bgGradient="linear(to-r, blue.400, purple.400)" h="4px" />
              <CardBody p={6} textAlign="center">
                <Text fontSize="3xl" mb={2}>💼</Text>
                <Heading size="md" mb={2}>プロダクト</Heading>
                <Text fontSize="sm" color="gray.500">
                  開発したアプリを試す
                </Text>
              </CardBody>
            </Card>
          </Link>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
