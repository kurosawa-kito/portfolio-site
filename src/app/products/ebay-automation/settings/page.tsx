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
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Textarea,
  Switch,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface EbaySettings {
  defaultProfitRate: number;
  defaultShippingCost: number;
  defaultHandlingTime: number;
  defaultReturnPolicy: string;
  defaultCategory: string;
  defaultCondition: string;
  autoRelist: boolean;
  maxRelistTimes: number;
  priceMonitoring: boolean;
  priceAdjustmentRate: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function EbaySettings() {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { isLoggedIn, setShowTaskHeader } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [settings, setSettings] = useState<EbaySettings>({
    defaultProfitRate: 30,
    defaultShippingCost: 500,
    defaultHandlingTime: 3,
    defaultReturnPolicy: "30日以内返品可",
    defaultCategory: "Consumer Electronics",
    defaultCondition: "Used",
    autoRelist: false,
    maxRelistTimes: 3,
    priceMonitoring: false,
    priceAdjustmentRate: 5,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [apiStatus, setApiStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");

  useEffect(() => {
    setShowTaskHeader(false);

    // ログインチェック
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // 設定を読み込み（実際にはAPIから取得）
    // TODO: 実際の設定読み込みAPIを実装

    // API接続状態をチェック
    checkApiConnection();
  }, [setShowTaskHeader, isLoggedIn, router]);

  const checkApiConnection = async () => {
    setApiStatus("checking");

    try {
      // TODO: 実際のAPI接続確認を実装
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setApiStatus("connected");
    } catch (error) {
      setApiStatus("disconnected");
    }
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: 実際の設定保存APIを実装
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "設定を保存しました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "設定の保存に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTestApi = async () => {
    try {
      // TODO: 実際のAPIテストを実装
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "API接続テスト成功",
        description: "eBay APIとの接続が正常に動作しています",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "API接続テスト失敗",
        description: "eBay APIとの接続に問題があります",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ログインしていない場合は何も表示しない（リダイレクト処理中）
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading
            size="xl"
            bgGradient="linear(to-r, purple.500, pink.500)"
            bgClip="text"
            mb={4}
          >
            出品設定
          </Heading>
          <Text fontSize="lg" color="gray.600">
            eBay出品の基本設定と自動化オプション
          </Text>
        </Box>

        {/* API接続状態 */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">eBay API接続状態</Heading>
                <Badge
                  colorScheme={
                    apiStatus === "connected"
                      ? "green"
                      : apiStatus === "disconnected"
                        ? "red"
                        : "yellow"
                  }
                >
                  {apiStatus === "connected"
                    ? "接続済み"
                    : apiStatus === "disconnected"
                      ? "未接続"
                      : "確認中"}
                </Badge>
              </HStack>

              <Alert
                status={apiStatus === "connected" ? "success" : "warning"}
                variant="left-accent"
              >
                <AlertIcon />
                {apiStatus === "connected"
                  ? "eBay APIとの接続が正常に動作しています"
                  : "eBay APIとの接続を確認してください"}
              </Alert>

              <HStack>
                <Button
                  onClick={checkApiConnection}
                  isLoading={apiStatus === "checking"}
                >
                  接続状態を確認
                </Button>
                <Button colorScheme="blue" onClick={handleTestApi}>
                  API接続テスト
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* 基本設定 */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">基本出品設定</Heading>

              <HStack spacing={6}>
                <FormControl>
                  <FormLabel>デフォルト利益率 (%)</FormLabel>
                  <NumberInput
                    value={settings.defaultProfitRate}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        defaultProfitRate: Number(value),
                      })
                    }
                    min={0}
                    max={200}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>デフォルト送料 (円)</FormLabel>
                  <NumberInput
                    value={settings.defaultShippingCost}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        defaultShippingCost: Number(value),
                      })
                    }
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

              <HStack spacing={6}>
                <FormControl>
                  <FormLabel>デフォルト発送日数</FormLabel>
                  <Select
                    value={settings.defaultHandlingTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultHandlingTime: Number(e.target.value),
                      })
                    }
                  >
                    <option value={1}>1営業日</option>
                    <option value={2}>2営業日</option>
                    <option value={3}>3営業日</option>
                    <option value={5}>5営業日</option>
                    <option value={7}>7営業日</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>デフォルトカテゴリ</FormLabel>
                  <Select
                    value={settings.defaultCategory}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultCategory: e.target.value,
                      })
                    }
                  >
                    <option value="Consumer Electronics">
                      Consumer Electronics
                    </option>
                    <option value="Cell Phones & Accessories">
                      Cell Phones & Accessories
                    </option>
                    <option value="Video Games & Consoles">
                      Video Games & Consoles
                    </option>
                    <option value="Clothing, Shoes & Accessories">
                      Clothing, Shoes & Accessories
                    </option>
                    <option value="Home & Garden">Home & Garden</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>デフォルト商品状態</FormLabel>
                <Select
                  value={settings.defaultCondition}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultCondition: e.target.value,
                    })
                  }
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Acceptable">Acceptable</option>
                  <option value="Used">Used</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>デフォルト返品ポリシー</FormLabel>
                <Textarea
                  value={settings.defaultReturnPolicy}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultReturnPolicy: e.target.value,
                    })
                  }
                  placeholder="返品に関するポリシーを入力してください"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* 自動化設定 */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">自動化設定</Heading>

              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="semibold">自動再出品</Text>
                    <Text fontSize="sm" color="gray.600">
                      出品期間が終了した商品を自動的に再出品します
                    </Text>
                  </Box>
                  <Switch
                    isChecked={settings.autoRelist}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoRelist: e.target.checked,
                      })
                    }
                  />
                </HStack>

                {settings.autoRelist && (
                  <FormControl maxW="200px">
                    <FormLabel>最大再出品回数</FormLabel>
                    <NumberInput
                      value={settings.maxRelistTimes}
                      onChange={(value) =>
                        setSettings({
                          ...settings,
                          maxRelistTimes: Number(value),
                        })
                      }
                      min={1}
                      max={10}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                )}

                <Divider />

                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="semibold">価格監視</Text>
                    <Text fontSize="sm" color="gray.600">
                      競合商品の価格変動を監視し、自動で価格調整を行います
                    </Text>
                  </Box>
                  <Switch
                    isChecked={settings.priceMonitoring}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        priceMonitoring: e.target.checked,
                      })
                    }
                  />
                </HStack>

                {settings.priceMonitoring && (
                  <FormControl maxW="200px">
                    <FormLabel>価格調整率 (%)</FormLabel>
                    <NumberInput
                      value={settings.priceAdjustmentRate}
                      onChange={(value) =>
                        setSettings({
                          ...settings,
                          priceAdjustmentRate: Number(value),
                        })
                      }
                      min={1}
                      max={20}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* 通知設定 */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">通知設定</Heading>

              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="semibold">メール通知</Text>
                    <Text fontSize="sm" color="gray.600">
                      出品完了や売却時にメールで通知を受け取ります
                    </Text>
                  </Box>
                  <Switch
                    isChecked={settings.emailNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailNotifications: e.target.checked,
                      })
                    }
                  />
                </HStack>

                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="semibold">SMS通知</Text>
                    <Text fontSize="sm" color="gray.600">
                      重要な更新をSMSで受け取ります
                    </Text>
                  </Box>
                  <Switch
                    isChecked={settings.smsNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smsNotifications: e.target.checked,
                      })
                    }
                  />
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* 保存ボタン */}
        <Box textAlign="center">
          <Button
            colorScheme="purple"
            size="lg"
            onClick={handleSaveSettings}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "lg",
            }}
          >
            設定を保存
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}
