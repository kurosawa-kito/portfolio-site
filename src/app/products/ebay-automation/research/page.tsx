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
  Input,
  FormControl,
  FormLabel,
  HStack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Image,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface MercariItem {
  id: string;
  title: string;
  price: number;
  image: string;
  sold: boolean;
  url: string;
  seller: string;
  condition: string;
}

export default function MercariResearch() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { isLoggedIn, setShowTaskHeader } = useAuth();
  const router = useRouter();

  const [searchUrl, setSearchUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MercariItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [profitRate, setProfitRate] = useState(30);
  const [shippingCost, setShippingCost] = useState(500);

  useEffect(() => {
    setShowTaskHeader(false);

    // ログインチェック
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
  }, [setShowTaskHeader, isLoggedIn, router]);

  const handleSearch = async () => {
    if (!searchUrl.trim()) {
      alert("メルカリの検索URLを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 実際のAPI呼び出しを実装
      // 現在はモックデータを表示
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResults: MercariItem[] = [
        {
          id: "1",
          title: "Nintendo Switch 本体 グレー",
          price: 25000,
          image: "/placeholder-image.jpg",
          sold: true,
          url: "https://mercari.com/jp/items/1",
          seller: "user123",
          condition: "目立った傷や汚れなし",
        },
        {
          id: "2",
          title: "iPhone 13 128GB ブルー",
          price: 65000,
          image: "/placeholder-image.jpg",
          sold: true,
          url: "https://mercari.com/jp/items/2",
          seller: "user456",
          condition: "未使用に近い",
        },
        {
          id: "3",
          title: "Apple AirPods Pro",
          price: 18000,
          image: "/placeholder-image.jpg",
          sold: false,
          url: "https://mercari.com/jp/items/3",
          seller: "user789",
          condition: "やや傷や汚れあり",
        },
      ];

      setResults(mockResults);
    } catch (error) {
      console.error("リサーチエラー:", error);
      alert("リサーチに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEbayPrice = (mercariPrice: number) => {
    return Math.round(mercariPrice * (1 + profitRate / 100) + shippingCost);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkList = async () => {
    if (selectedItems.size === 0) {
      alert("出品する商品を選択してください");
      return;
    }

    const selectedProducts = results.filter((item) =>
      selectedItems.has(item.id)
    );

    // TODO: eBay出品API呼び出しを実装
    alert(`${selectedProducts.length}件の商品をeBayに出品します（実装予定）`);
  };

  // ログインしていない場合は何も表示しない（リダイレクト処理中）
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading
            size="xl"
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
            mb={4}
          >
            メルカリリサーチ
          </Heading>
          <Text fontSize="lg" color="gray.600">
            メルカリの売れ筋商品を分析してeBay出品候補を見つけます
          </Text>
        </Box>

        {/* 検索フォーム */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>メルカリ検索URL</FormLabel>
                <Input
                  placeholder="https://mercari.com/jp/search?keyword=..."
                  value={searchUrl}
                  onChange={(e) => setSearchUrl(e.target.value)}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl maxW="200px">
                  <FormLabel>利益率 (%)</FormLabel>
                  <NumberInput
                    value={profitRate}
                    onChange={(value) => setProfitRate(Number(value))}
                    min={0}
                    max={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl maxW="200px">
                  <FormLabel>送料 (円)</FormLabel>
                  <NumberInput
                    value={shippingCost}
                    onChange={(value) => setShippingCost(Number(value))}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <Button
                colorScheme="blue"
                onClick={handleSearch}
                isLoading={isLoading}
                loadingText="リサーチ中..."
                size="lg"
              >
                リサーチ開始
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* 結果表示 */}
        {results.length > 0 && (
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">リサーチ結果 ({results.length}件)</Heading>
                  <Button
                    colorScheme="green"
                    onClick={handleBulkList}
                    isDisabled={selectedItems.size === 0}
                  >
                    選択した商品を出品 ({selectedItems.size})
                  </Button>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {results.map((item) => (
                    <Card
                      key={item.id}
                      variant="outline"
                      _hover={{ boxShadow: "md" }}
                      bg={selectedItems.has(item.id) ? "blue.50" : "white"}
                    >
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Checkbox
                              isChecked={selectedItems.has(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                            />
                            {item.sold && <Badge colorScheme="red">SOLD</Badge>}
                          </HStack>

                          <Box
                            h="150px"
                            bg="gray.100"
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text color="gray.500">画像準備中</Text>
                          </Box>

                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            noOfLines={2}
                          >
                            {item.title}
                          </Text>

                          <VStack spacing={1} align="stretch">
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">
                                メルカリ価格:
                              </Text>
                              <Text fontWeight="semibold">
                                ¥{item.price.toLocaleString()}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">
                                予想eBay価格:
                              </Text>
                              <Text fontWeight="semibold" color="green.500">
                                ¥
                                {calculateEbayPrice(
                                  item.price
                                ).toLocaleString()}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">
                                予想利益:
                              </Text>
                              <Text fontWeight="semibold" color="blue.500">
                                ¥
                                {(
                                  calculateEbayPrice(item.price) -
                                  item.price -
                                  shippingCost
                                ).toLocaleString()}
                              </Text>
                            </HStack>
                          </VStack>

                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {item.condition}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* 注意事項 */}
        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="semibold">注意事項</Text>
            <Text fontSize="sm">
              • 現在はデモデータを表示しています •
              実際のメルカリAPI連携は開発中です •
              価格計算は目安であり、実際の市場価格とは異なる場合があります
            </Text>
          </VStack>
        </Alert>
      </VStack>
    </Container>
  );
}
