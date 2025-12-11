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
import { useMemo } from "react";

export default function Home() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  // 2024年4月から現在までの経験年数を計算（0.5単位で繰り上げ）
  const yearsOfExperience = useMemo(() => {
    const startDate = new Date(2024, 3, 1); // 2024年4月
    const currentDate = new Date();
    let years = currentDate.getFullYear() - startDate.getFullYear();
    const monthDiff = currentDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      years--;
    }
    const months = (monthDiff + 12) % 12;
    
    // 年数.月数の小数値を計算
    const totalMonths = years * 12 + months;
    const decimalYears = totalMonths / 12;
    
    // 0.5単位で繰り上げ（0.3→0.5, 0.8→1.0）
    const roundedYears = Math.ceil(decimalYears * 2) / 2;
    
    if (roundedYears < 1) {
      return `${Math.round(decimalYears * 12)}ヶ月`;
    }
    
    return `${roundedYears}年`;
  }, []);

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
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              gap={6}
            >
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
                  エンジニア ({yearsOfExperience})
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
              金融業界でシステム開発に従事しているエンジニアです。業務では、小さな改善も後に大きな変化となることを信じ、日々の業務改善やシステムの効率化に取り組んでいます。顧客との要件調整や技術的な課題解決を通じて、価値あるシステムの実現に貢献しています。
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
                <Text fontSize="3xl" mb={2}>
                  📄
                </Text>
                <Heading size="md" mb={2}>
                  職務経歴書
                </Heading>
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
                <Text fontSize="3xl" mb={2}>
                  💼
                </Text>
                <Heading size="md" mb={2}>
                  プロダクト
                </Heading>
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
