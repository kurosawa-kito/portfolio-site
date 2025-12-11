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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  StarIcon,
  TimeIcon,
  SettingsIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";

export default function ResumePage() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const hoverBg = useColorModeValue("gray.100", "gray.600");

  const languages = [
    { name: "HTML", years: "1年3ヶ月" },
    { name: "CSS", years: "1年3ヶ月" },
    { name: "TypeScript", years: "1年3ヶ月" },
    { name: "PHP", years: "1年3ヶ月" },
    { name: "SQL", years: "1年3ヶ月" },
  ];

  const frameworks = [
    { name: "Next.js (React)", years: "1年3ヶ月" },
    { name: "Laravel", years: "1年3ヶ月" },
  ];

  const achievements = [
    {
      title: "CMS（Kuroco）導入によるコンテンツ表示画面の設計・開発",
      problem: [
        "ヘッドレスCMS（Kuroco）の導入にあたり、「CMS側でどの項目を管理するか」「バックエンドで何を加工するか」「フロントエンドで何を制御するか」の役割分担が曖昧で、認識齟齬が発生しやすい状況だった",
        "新規画面のため参考にできる既存UIがなく、実現可能性の検証、開発でのUI要素の具体化に難航",
      ],
      solution: [
        "後工程での手戻りを防ぐため、要件定義段階からUIモックを作成し、クライアントと具体的な画面イメージを共有",
        "CMSから取得できるデータを検証用APIとバックエンドの先行開発によって確認し、フロントエンドでの表示ロジックを早期に固めるアプローチを採用",
      ],
      result: [
        "要件定義時の資料がわかりやすいと評価された",
        "後工程での仕様変更が発生しなかった",
        "設計書の手戻りゼロを達成し、結合テスト以降のバグ件数0件を実現",
      ],
      color: "blue",
    },
    {
      title: "翻訳サービス（高電社）導入による多言語対応",
      problem: [
        "翻訳サービス側にSPA対応の実績がなく、ページ遷移なしでコンテンツが切り替わる仕様との相性が悪かった",
        "翻訳サービスがDOM全体を監視しているため、Reactの再レンダリングと翻訳処理が競合し、バグが多発",
      ],
      solution: [
        "翻訳サービス企業と直接の技術打合せを実施（計3回）。「フロントエンド側で対応すべき問題」と「翻訳サービス側で対応すべき問題」を切り分け",
        "言語切替時の状態管理を一元化する共通コンポーネントを全画面に適用",
      ],
      result: [
        "技術打合せ後、QA回数が大幅に減少し、スムーズに多言語対応を完了",
        "最小限のコード修正で多言語対応を実現し、追加の工数増加なくリリース",
      ],
      color: "green",
    },
    {
      title: "API処理速度の改善（パフォーマンスチューニング）",
      problem: [
        "負荷テストで、高負荷時のAPIレスポンスが基準値（3秒以内）を超過し、NGとなった",
        "複数のAPIでN+1問題やフルテーブルスキャンが発生していることが判明",
      ],
      solution: [
        "スロークエリを特定し、適切なインデックス（単一・複合）を調査・検討",
        "Laravelのキャッシュ（Redisベース）を導入し、頻繁にアクセスされるデータをキャッシュ化",
        "SQLの書き換え（サブクエリからJOINへの変更）も実施",
      ],
      result: [
        "インデックス付与によりクエリ実行時間を約26%削減（対象API平均）",
        "キャッシュ導入と合わせ、疑似高負荷時のAPIレスポンス時間を約40%改善",
      ],
      color: "orange",
    },
    {
      title: "コンポーネント一覧ドキュメントの自動生成ツール開発",
      problem: [
        "同様のUI要素が複数箇所で重複実装されていた",
        "「このコンポーネントは既に存在するか？」の確認に手間がかかり、再実装してしまうケースが発生",
      ],
      solution: [
        "Node.jsスクリプトでソースコードを解析し、Markdownドキュメントを自動生成する仕組みを独自に開発",
        "Slackの専用チャンネルを作成し、スクリプト実行時に更新通知を投稿",
      ],
      result: ["フェーズ3開発時には重複コンポーネントの作成が無かった"],
      color: "purple",
    },
    {
      title: "タスク管理ツール（Backlog）とSlack連携による通知自動化",
      problem: [
        "Backlogの通知手段がメールとサイト内通知のみで、重要なタスクが埋もれてしまっていた",
        "タスクの進捗確認の問い合わせが発生し、業務の効率が低下",
      ],
      solution: [
        "GASでBacklog APIを定期的に取得し、更新があればSlack Webhookで通知を送信",
        "担当者ごとにSlackメンションを付与し、自分に関係するタスクの更新を見落とさない設計に",
      ],
      result: [
        "完全自動運用により、タスク管理の効率化を実現",
        "Slack通知により、タスクの積み残しが減少",
      ],
      color: "teal",
    },
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
            2025年12月11日現在
          </Text>
          <Text fontWeight="bold" fontSize="xl" mt={2}>
            黒澤 希偉人
          </Text>
        </Box>

        {/* 職務経歴 */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box bgGradient="linear(to-r, blue.500, purple.500)" h="4px" />
          <CardBody p={6}>
            <HStack mb={4}>
              <Icon as={TimeIcon} color={accentColor} boxSize={5} />
              <Heading size="md">職務経歴</Heading>
            </HStack>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>年月</Th>
                    <Th>勤務先</Th>
                    <Th>概要</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>2024年4月</Td>
                    <Td>株式会社ラキール</Td>
                    <Td>入社</Td>
                  </Tr>
                  <Tr>
                    <Td>現在</Td>
                    <Td>株式会社ラキール</Td>
                    <Td>継続勤務中</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* 得意業務 */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box bgGradient="linear(to-r, green.400, teal.500)" h="4px" />
          <CardBody p={6}>
            <HStack mb={4}>
              <Icon as={CheckCircleIcon} color="green.500" boxSize={5} />
              <Heading size="md">得意業務</Heading>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {[
                "HTML/CSS/JavaScript/TypeScriptによるWeb開発",
                "Next.js(React)/Laravelを用いた開発",
                "DB（MySQL）のチューニング・テーブル設計",
                "フロントエンドからバックエンドまでの開発",
                "顧客折衝",
              ].map((item, index) => (
                <HStack
                  key={index}
                  align="start"
                  p={3}
                  bg={cardBg}
                  borderRadius="md"
                >
                  <Icon as={CheckCircleIcon} color="green.400" mt={1} />
                  <Text fontSize="sm">{item}</Text>
                </HStack>
              ))}
            </SimpleGrid>
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
          <Box bgGradient="linear(to-r, purple.400, pink.500)" h="4px" />
          <CardBody p={6}>
            <HStack mb={6}>
              <Icon as={SettingsIcon} color="purple.500" boxSize={5} />
              <Heading size="md">テクニカルスキル</Heading>
            </HStack>

            {/* 言語 */}
            <Box mb={6}>
              <Heading size="sm" mb={3} color="purple.500">
                💻 言語
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                {languages.map((skill) => (
                  <Box
                    key={skill.name}
                    p={3}
                    bg={cardBg}
                    borderRadius="lg"
                    textAlign="center"
                  >
                    <Text fontWeight="bold">{skill.name}</Text>
                    <Badge colorScheme="blue" mt={1}>
                      {skill.years}
                    </Badge>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <Divider my={4} />

            {/* フレームワーク */}
            <Box mb={6}>
              <Heading size="sm" mb={3} color="teal.500">
                🔧 フレームワーク
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {frameworks.map((skill) => (
                  <Box
                    key={skill.name}
                    p={3}
                    bg={cardBg}
                    borderRadius="lg"
                    textAlign="center"
                  >
                    <Text fontWeight="bold">{skill.name}</Text>
                    <Badge colorScheme="teal" mt={1}>
                      {skill.years}
                    </Badge>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <Divider my={4} />

            {/* その他 */}
            <Box>
              <Heading size="sm" mb={3} color="green.500">
                🗄️ DB / クラウド
              </Heading>
              <HStack spacing={3} flexWrap="wrap">
                <Badge colorScheme="green" p={2} fontSize="sm">
                  MySQL (1年3ヶ月)
                </Badge>
                <Badge colorScheme="orange" p={2} fontSize="sm">
                  AWS (1年3ヶ月)
                </Badge>
              </HStack>
            </Box>
          </CardBody>
        </Card>

        {/* 開発経歴 */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box bgGradient="linear(to-r, orange.400, red.500)" h="4px" />
          <CardBody p={6}>
            <HStack mb={4}>
              <Icon as={TimeIcon} color="orange.500" boxSize={5} />
              <Heading size="md">開発経歴</Heading>
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
                  2024年4月〜現在
                </Badge>
                <Text fontWeight="bold" color="gray.600">
                  株式会社ラキール
                </Text>
              </HStack>

              <Heading size="sm" mt={4} mb={3} color={accentColor}>
                子育て世代向けチャット相談Webサービス/アプリケーション開発
              </Heading>

              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    プロジェクト概要
                  </Text>
                  <Text fontSize="sm">
                    東京都が運営する子育て世代と子供を対象としたチャット相談Webサービス/アプリケーション開発。
                    相談者向け画面（ログイン、相談予約、チャット相談、コンテンツ照会）と事務局向け管理画面（スケジュール管理、相談内容の分析、帳票出力）を提供。
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    担当フェーズ
                  </Text>
                  <HStack flexWrap="wrap" spacing={2}>
                    {[
                      "要件定義",
                      "基本設計",
                      "詳細設計",
                      "開発",
                      "テスト",
                      "リリース",
                      "運用保守",
                    ].map((phase) => (
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
                    <Badge colorScheme="purple">TypeScript</Badge>
                    <Badge colorScheme="purple">PHP</Badge>
                    <Badge colorScheme="blue">Next.js (React)</Badge>
                    <Badge colorScheme="red">Laravel</Badge>
                    <Badge colorScheme="green">MySQL</Badge>
                    <Badge colorScheme="orange">AWS</Badge>
                  </HStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    役割・規模
                  </Text>
                  <Text fontSize="sm">メンバー / プロジェクト規模：19名</Text>
                </Box>
              </VStack>
            </Box>
          </CardBody>
        </Card>

        {/* 実績・取り組み */}
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box bgGradient="linear(to-r, cyan.400, blue.500)" h="4px" />
          <CardBody p={6}>
            <HStack mb={4}>
              <Icon as={StarIcon} color="cyan.500" boxSize={5} />
              <Heading size="md">実績・取り組み</Heading>
            </HStack>

            <Accordion allowMultiple>
              {achievements.map((item, index) => (
                <AccordionItem key={index} border="none" mb={3}>
                  <AccordionButton
                    bg={cardBg}
                    borderRadius="lg"
                    _hover={{ bg: hoverBg }}
                    _expanded={{ borderBottomRadius: 0 }}
                  >
                    <Box flex="1" textAlign="left">
                      <Badge colorScheme={item.color} mr={2}>
                        {index + 1}
                      </Badge>
                      <Text as="span" fontWeight="bold" fontSize="sm">
                        {item.title}
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} bg={cardBg} borderBottomRadius="lg">
                    <VStack align="stretch" spacing={3}>
                      <Box>
                        <Text
                          fontWeight="bold"
                          fontSize="xs"
                          color="red.500"
                          mb={1}
                        >
                          直面した問題
                        </Text>
                        <UnorderedList fontSize="xs" spacing={1}>
                          {item.problem.map((p, i) => (
                            <ListItem key={i}>{p}</ListItem>
                          ))}
                        </UnorderedList>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="bold"
                          fontSize="xs"
                          color="blue.500"
                          mb={1}
                        >
                          解決策
                        </Text>
                        <UnorderedList fontSize="xs" spacing={1}>
                          {item.solution.map((s, i) => (
                            <ListItem key={i}>{s}</ListItem>
                          ))}
                        </UnorderedList>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="bold"
                          fontSize="xs"
                          color="green.500"
                          mb={1}
                        >
                          成果
                        </Text>
                        <UnorderedList fontSize="xs" spacing={1}>
                          {item.result.map((r, i) => (
                            <ListItem key={i}>{r}</ListItem>
                          ))}
                        </UnorderedList>
                      </Box>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
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
          <Box bgGradient="linear(to-r, pink.400, purple.500)" h="4px" />
          <CardBody p={6}>
            <HStack mb={4}>
              <Icon as={StarIcon} color="pink.500" boxSize={5} />
              <Heading size="md">自己PR</Heading>
            </HStack>

            <Text fontSize="sm" mb={4}>
              業務外でも自己研鑽として個人開発に取り組んでいます。
            </Text>

            <Box p={4} bg={cardBg} borderRadius="lg">
              <Text fontWeight="bold" mb={2}>
                ポートフォリオサイト
              </Text>
              <Link
                href="https://portfolio-site-pearl-mu.vercel.app/"
                isExternal
                color="blue.500"
                fontSize="sm"
              >
                https://portfolio-site-pearl-mu.vercel.app/{" "}
                <ExternalLinkIcon mx="2px" />
              </Link>
              <UnorderedList mt={3} fontSize="sm" spacing={1}>
                <ListItem>
                  Next.js（App Router）/ TypeScript によるフロントエンド開発
                </ListItem>
                <ListItem>Vercel を活用した CI/CD パイプラインの構築</ListItem>
                <ListItem>
                  Prisma + PostgreSQL（Neon）によるデータベース設計・運用
                </ListItem>
                <ListItem>TailwindCSS を用いたレスポンシブデザイン</ListItem>
              </UnorderedList>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
