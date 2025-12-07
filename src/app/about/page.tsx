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
  Divider,
  Badge,
  HStack,
  Icon,
  SimpleGrid,
  Progress,
  Flex,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  StarIcon,
  TimeIcon,
  SettingsIcon,
} from "@chakra-ui/icons";

export default function About() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  const skills = [
    { name: "PHP", years: "3年", level: 90 },
    { name: "Java", years: "2年", level: 80 },
    { name: "JavaScript", years: "2年", level: 85 },
    { name: "TypeScript", years: "1年", level: 75 },
    { name: "C#", years: "1年", level: 60 },
    { name: "COBOL", years: "1年", level: 50 },
  ];

  const osSkills = [
    { name: "Windows", level: "環境設計・構築が可能" },
    { name: "Linux", level: "環境設計・構築が可能" },
    { name: "AIX", level: "環境設計・構築が可能" },
  ];

  const dbSkills = [
    { name: "SQL Server", level: "基本的な環境構築が可能" },
    { name: "Oracle", level: "基本的な環境構築が可能" },
    { name: "PostgreSQL", level: "基本的な環境構築が可能" },
  ];

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* ヘッダー */}
        <Box textAlign="center" pb={4}>
          <Heading
            size="2xl"
            bgGradient="linear(to-r, blue.400, purple.500, pink.400)"
            bgClip="text"
            mb={4}
          >
            職務経歴書
          </Heading>
          <Text color="gray.500" fontSize="lg">
            フルスタックエンジニア
          </Text>
        </Box>

        {/* 職務要約 */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box
            bgGradient="linear(to-r, blue.500, purple.500)"
            h="4px"
          />
          <CardBody p={6}>
            <HStack mb={4}>
              <Icon as={StarIcon} color={accentColor} boxSize={5} />
              <Heading size="md">職務要約</Heading>
            </HStack>
            <Text lineHeight="tall" color="gray.600">
              株式会社LakeelにてSEとして金融業界でシステム開発に従事し、要件定義に基づいた設計やテスト、保守運用を担当。
              上流工程に携わり、クライアントへのヒアリング、要件定義なども担当しています。
              また、プロジェクトのリーダー、サブリーダーとして、全体の進行管理やメンバーのマネジメントも経験。
              メンバーへの適切な指示や顧客との調整により、システムの品質を維持しながら期日通り納品を実現しています。
            </Text>
          </CardBody>
        </Card>

        {/* 活かせる経験・知識 */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box
            bgGradient="linear(to-r, green.400, teal.500)"
            h="4px"
          />
          <CardBody p={6}>
            <HStack mb={4}>
              <Icon as={CheckCircleIcon} color="green.500" boxSize={5} />
              <Heading size="md">活かせる経験・知識・技術</Heading>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {[
                "顧客へのヒアリングから要件定義、開発までの経験",
                "PHP、Javaによるアプリケーションの開発",
                "プロジェクトリーダー、サブリーダーの経験",
                "金融業界の業務知識",
              ].map((item, index) => (
                <HStack key={index} align="start" p={3} bg={cardBg} borderRadius="md">
                  <Icon as={CheckCircleIcon} color="green.400" mt={1} />
                  <Text>{item}</Text>
                </HStack>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* 職務経歴 */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box
            bgGradient="linear(to-r, orange.400, red.500)"
            h="4px"
          />
          <CardBody p={6}>
            <HStack mb={4}>
              <Icon as={TimeIcon} color="orange.500" boxSize={5} />
              <Heading size="md">職務経歴</Heading>
            </HStack>

            <Box
              p={5}
              bg={cardBg}
              borderRadius="lg"
              borderLeft="4px"
              borderLeftColor="orange.400"
            >
              <HStack justify="space-between" flexWrap="wrap" mb={2}>
                <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
                  2024年04月～現在
                </Badge>
                <Text fontWeight="bold" color="gray.600">
                  株式会社LaKeel
                </Text>
              </HStack>
              
              <Heading size="sm" mt={4} mb={3} color={accentColor}>
                保険業界　営業支援システム開発
              </Heading>
              
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    プロジェクト概要
                  </Text>
                  <Text fontSize="sm">
                    保険業界大手の営業業務の実績、予算、顧客などを一元管理する営業支援システムの開発をプロジェクト提案から実施。
                  </Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    担当フェーズ
                  </Text>
                  <HStack flexWrap="wrap" spacing={2}>
                    {["要件定義", "基本設計", "詳細設計", "結合テスト", "運用保守"].map((phase) => (
                      <Badge key={phase} colorScheme="blue" variant="subtle">
                        {phase}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    開発環境
                  </Text>
                  <HStack flexWrap="wrap" spacing={2}>
                    <Badge colorScheme="purple">PHP</Badge>
                    <Badge colorScheme="purple">Java</Badge>
                    <Badge colorScheme="green">SQL Server</Badge>
                    <Badge colorScheme="green">Oracle</Badge>
                    <Badge colorScheme="gray">AIX</Badge>
                    <Badge colorScheme="gray">Windows</Badge>
                  </HStack>
                </Box>
              </VStack>
            </Box>
          </CardBody>
        </Card>

        {/* テクニカルスキル */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box
            bgGradient="linear(to-r, purple.400, pink.500)"
            h="4px"
          />
          <CardBody p={6}>
            <HStack mb={6}>
              <Icon as={SettingsIcon} color="purple.500" boxSize={5} />
              <Heading size="md">テクニカルスキル</Heading>
            </HStack>

            {/* プログラミング言語 */}
            <Box mb={8}>
              <Heading size="sm" mb={4} color="purple.500">
                💻 プログラミング言語
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {skills.map((skill) => (
                  <Box key={skill.name} p={4} bg={cardBg} borderRadius="lg">
                    <Flex justify="space-between" mb={2}>
                      <Text fontWeight="bold">{skill.name}</Text>
                      <Badge colorScheme="blue">{skill.years}</Badge>
                    </Flex>
                    <Progress
                      value={skill.level}
                      colorScheme="purple"
                      borderRadius="full"
                      size="sm"
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <Divider my={6} />

            {/* OS */}
            <Box mb={8}>
              <Heading size="sm" mb={4} color="teal.500">
                🖥️ OS
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {osSkills.map((skill) => (
                  <Box
                    key={skill.name}
                    p={4}
                    bg={cardBg}
                    borderRadius="lg"
                    textAlign="center"
                  >
                    <Text fontWeight="bold" fontSize="lg" mb={2}>
                      {skill.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {skill.level}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <Divider my={6} />

            {/* データベース */}
            <Box>
              <Heading size="sm" mb={4} color="green.500">
                🗄️ データベース
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {dbSkills.map((skill) => (
                  <Box
                    key={skill.name}
                    p={4}
                    bg={cardBg}
                    borderRadius="lg"
                    textAlign="center"
                  >
                    <Text fontWeight="bold" fontSize="lg" mb={2}>
                      {skill.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {skill.level}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </CardBody>
        </Card>

        {/* 自己PR */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box
            bgGradient="linear(to-r, cyan.400, blue.500)"
            h="4px"
          />
          <CardBody p={6}>
            <HStack mb={6}>
              <Icon as={StarIcon} color="cyan.500" boxSize={5} />
              <Heading size="md">自己PR</Heading>
            </HStack>

            <VStack spacing={6} align="stretch">
              {/* 設計力 */}
              <Box
                p={5}
                bg={cardBg}
                borderRadius="lg"
                borderLeft="4px"
                borderLeftColor="cyan.400"
              >
                <Heading size="sm" mb={3} color="cyan.600">
                  🎯 常に改善を心掛けた設計力
                </Heading>
                <Text fontSize="sm" lineHeight="tall">
                  保険業界での営業支援システムの開発では、忙しい営業担当が社外からでも使いやすいような設計を心掛けてきました。
                  あらかじめ変更や改修を見込んで開発に取り組み、随時修正がかけやすい設計やソースコードの記述を開発サイドへ依頼。
                  サービス導入後も営業社員にヒアリングやアンケートを実施し、改善を繰り返すことで、結果として顧客に満足していただくことができました。
                </Text>
              </Box>

              {/* マネジメント力 */}
              <Box
                p={5}
                bg={cardBg}
                borderRadius="lg"
                borderLeft="4px"
                borderLeftColor="blue.400"
              >
                <Heading size="sm" mb={3} color="blue.600">
                  👥 円滑にプロジェクトを進行させるマネジメント力
                </Heading>
                <Text fontSize="sm" lineHeight="tall">
                  自社のプロジェクトメンバーだけでなく顧客先の関係者など、規模の大きいプロジェクトを進めた経験があります。
                  関係者が多くなるためスケジュールの遅延や認識齟齬が発生しないように、定期的に打ち合わせの機会を設けて進捗を管理。
                  メンバーと顧客先との間に立ち、仕様や価格についても細かく調整、管理することで、大規模なプロジェクトも当初のスケジュールどおりに進めることができ、期日に遅れず納品することができました。
                </Text>
              </Box>

              {/* 最新技術 */}
              <Box
                p={5}
                bg={cardBg}
                borderRadius="lg"
                borderLeft="4px"
                borderLeftColor="purple.400"
              >
                <Heading size="sm" mb={3} color="purple.600">
                  🚀 最新技術への積極的な取り組み
                </Heading>
                <Text fontSize="sm" lineHeight="tall" mb={4}>
                  業務外でも継続的に新しい技術に触れ、実践的なスキルを磨いています。
                  以下の個人プロジェクトを通じて、モダンな開発手法とフルスタック開発の経験を積んでいます。
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {/* RECIPAI */}
                  <Box
                    p={4}
                    bg={bgColor}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <HStack mb={2}>
                      <Badge colorScheme="orange">RECIPAI</Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600" mb={2}>
                      冷蔵庫の写真からAIがレシピを提案するWebアプリ
                    </Text>
                    <HStack flexWrap="wrap" spacing={1}>
                      <Badge size="sm" variant="outline">Next.js 15</Badge>
                      <Badge size="sm" variant="outline">TypeScript</Badge>
                      <Badge size="sm" variant="outline">OpenAI</Badge>
                    </HStack>
                  </Box>

                  {/* Portfolio Site */}
                  <Box
                    p={4}
                    bg={bgColor}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <HStack mb={2}>
                      <Badge colorScheme="blue">Portfolio Site</Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600" mb={2}>
                      個人ポートフォリオサイト・タスク管理ツール
                    </Text>
                    <HStack flexWrap="wrap" spacing={1}>
                      <Badge size="sm" variant="outline">Next.js 14</Badge>
                      <Badge size="sm" variant="outline">ChakraUI</Badge>
                      <Badge size="sm" variant="outline">PostgreSQL</Badge>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
