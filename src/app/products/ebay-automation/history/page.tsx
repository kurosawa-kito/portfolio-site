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
  useColorModeValue,
  HStack,
  Badge,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  EditIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ListingHistory {
  id: string;
  title: string;
  mercariPrice: number;
  ebayPrice: number;
  profit: number;
  status: "active" | "sold" | "ended" | "draft";
  listedDate: string;
  soldDate?: string;
  ebayUrl?: string;
  mercariUrl: string;
}

export default function ListingHistory() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { isLoggedIn, setShowTaskHeader } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState<ListingHistory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("30days");

  useEffect(() => {
    setShowTaskHeader(false);

    // ログインチェック
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // モックデータを設定
    const mockHistory: ListingHistory[] = [
      {
        id: "1",
        title: "Nintendo Switch 本体 グレー",
        mercariPrice: 25000,
        ebayPrice: 35000,
        profit: 9500,
        status: "sold",
        listedDate: "2024-01-15",
        soldDate: "2024-01-18",
        ebayUrl: "https://ebay.com/item/1",
        mercariUrl: "https://mercari.com/jp/items/1",
      },
      {
        id: "2",
        title: "iPhone 13 128GB ブルー",
        mercariPrice: 65000,
        ebayPrice: 89000,
        profit: 23500,
        status: "active",
        listedDate: "2024-01-10",
        ebayUrl: "https://ebay.com/item/2",
        mercariUrl: "https://mercari.com/jp/items/2",
      },
      {
        id: "3",
        title: "Apple AirPods Pro",
        mercariPrice: 18000,
        ebayPrice: 25000,
        profit: 6500,
        status: "ended",
        listedDate: "2024-01-05",
        mercariUrl: "https://mercari.com/jp/items/3",
      },
    ];

    setHistory(mockHistory);
  }, [setShowTaskHeader, isLoggedIn, router]);

  // ログインしていない場合は何も表示しない（リダイレクト処理中）
  if (!isLoggedIn) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "blue";
      case "sold":
        return "green";
      case "ended":
        return "red";
      case "draft":
        return "gray";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "出品中";
      case "sold":
        return "売却済み";
      case "ended":
        return "終了";
      case "draft":
        return "下書き";
      default:
        return "不明";
    }
  };

  const totalProfit = history
    .filter((item) => item.status === "sold")
    .reduce((sum, item) => sum + item.profit, 0);

  const totalSold = history.filter((item) => item.status === "sold").length;
  const totalActive = history.filter((item) => item.status === "active").length;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading
            size="xl"
            bgGradient="linear(to-r, green.500, blue.500)"
            bgClip="text"
            mb={4}
          >
            出品履歴
          </Heading>
          <Text fontSize="lg" color="gray.600">
            過去の出品データとパフォーマンスを確認
          </Text>
        </Box>

        {/* 統計情報 */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>総売上利益</StatLabel>
                <StatNumber color="green.500">
                  ¥{totalProfit.toLocaleString()}
                </StatNumber>
                <StatHelpText>売却済み商品のみ</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>売却済み</StatLabel>
                <StatNumber color="blue.500">{totalSold}件</StatNumber>
                <StatHelpText>全期間</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>出品中</StatLabel>
                <StatNumber color="orange.500">{totalActive}件</StatNumber>
                <StatHelpText>現在アクティブ</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>平均利益</StatLabel>
                <StatNumber color="purple.500">
                  ¥
                  {totalSold > 0
                    ? Math.round(totalProfit / totalSold).toLocaleString()
                    : "0"}
                </StatNumber>
                <StatHelpText>1件あたり</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* フィルターとアクション */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <HStack justify="space-between">
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                  表示期間:{" "}
                  {selectedPeriod === "30days"
                    ? "過去30日"
                    : selectedPeriod === "90days"
                    ? "過去90日"
                    : "全期間"}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setSelectedPeriod("30days")}>
                    過去30日
                  </MenuItem>
                  <MenuItem onClick={() => setSelectedPeriod("90days")}>
                    過去90日
                  </MenuItem>
                  <MenuItem onClick={() => setSelectedPeriod("all")}>
                    全期間
                  </MenuItem>
                </MenuList>
              </Menu>

              <Button
                colorScheme="blue"
                onClick={() => {
                  // TODO: データエクスポート機能
                  alert("CSVエクスポート機能を実装予定");
                }}
              >
                CSVエクスポート
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* 履歴テーブル */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">出品履歴一覧</Heading>

              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>商品名</Th>
                      <Th isNumeric>メルカリ価格</Th>
                      <Th isNumeric>eBay価格</Th>
                      <Th isNumeric>利益</Th>
                      <Th>ステータス</Th>
                      <Th>出品日</Th>
                      <Th>売却日</Th>
                      <Th>アクション</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {history.map((item) => (
                      <Tr key={item.id}>
                        <Td maxW="200px">
                          <Text noOfLines={2} fontSize="sm">
                            {item.title}
                          </Text>
                        </Td>
                        <Td isNumeric>¥{item.mercariPrice.toLocaleString()}</Td>
                        <Td isNumeric>¥{item.ebayPrice.toLocaleString()}</Td>
                        <Td isNumeric>
                          <Text
                            color={item.profit > 0 ? "green.500" : "red.500"}
                          >
                            ¥{item.profit.toLocaleString()}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(item.status)}>
                            {getStatusText(item.status)}
                          </Badge>
                        </Td>
                        <Td>{item.listedDate}</Td>
                        <Td>{item.soldDate || "-"}</Td>
                        <Td>
                          <HStack spacing={1}>
                            {item.ebayUrl && (
                              <IconButton
                                aria-label="eBayで見る"
                                icon={<ExternalLinkIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  window.open(item.ebayUrl, "_blank")
                                }
                              />
                            )}
                            <IconButton
                              aria-label="編集"
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // TODO: 編集機能
                                alert("編集機能を実装予定");
                              }}
                            />
                            <IconButton
                              aria-label="削除"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => {
                                // TODO: 削除機能
                                alert("削除機能を実装予定");
                              }}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {history.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">出品履歴がありません</Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
