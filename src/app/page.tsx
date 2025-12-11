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
    { name: "TypeScript", color: "blue" },
    { name: "PHP", color: "purple" },
    { name: "React", color: "cyan" },
    { name: "Laravel", color: "red" },
    { name: "Next.js", color: "gray" },
    { name: "Python", color: "blue" },
    { name: "MySQL", color: "yellow" },
    { name: "AWS", color: "orange" },
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
            h="180px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={8}
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              gap={{ base: 3, md: 6 }}
            >
              <Avatar
                size={{ base: "lg", md: "2xl" }}
                name="Kurosawa"
                bg="whiteAlpha.300"
                color="white"
                border={{ base: "3px solid white", md: "4px solid white" }}
                boxShadow="lg"
              />
              <VStack align={{ base: "center", md: "start" }} spacing={2}>
                <Heading
                  size="xl"
                  color="white"
                  fontWeight="bold"
                  textShadow="0 2px 10px rgba(0,0,0,0.2)"
                >
                  Kiito Kurosawa
                </Heading>
                <Text color="whiteAlpha.900" fontSize="lg" fontWeight="medium">
                  エンジニア ({yearsOfExperience})
                </Text>
              </VStack>
            </Flex>
          </Box>
          <CardBody p={6}>
            <HStack spacing={3} justify="center">
              <Link href="https://github.com/kurosawa-kito" target="_blank">
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  leftIcon={<ExternalLinkIcon />}
                >
                  GitHub
                </Button>
              </Link>
            </HStack>
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
              現職ではWebアプリケーションの設計・開発に従事しています。業務では「小さな変化でも積み重なれば大きな力を持つ」をモットーに、日々システムの改善やユーザー体験の向上に取り組んでいます。
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
