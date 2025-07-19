"use client";

import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { HamburgerIcon, ChevronDownIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { isLoggedIn, setShowTaskHeader } = useAuth();
  const pathname = usePathname();

  // タスク管理ツール以外のページに移動したときにタスクヘッダーを非表示にする
  useEffect(() => {
    if (isLoggedIn) {
      const taskRelatedPaths = ["/member/tasks", "/admin/dashboard", "/shared"];
      const isTaskRelatedPath = taskRelatedPaths.some((path) =>
        pathname?.startsWith(path),
      );

      if (!isTaskRelatedPath) {
        setShowTaskHeader(false);
      } else {
        setShowTaskHeader(true);
      }
    }
  }, [pathname, isLoggedIn, setShowTaskHeader]);

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex
        maxW="1200px"
        mx="auto"
        px={4}
        h="60px"
        align="center"
        justify="space-between"
      >
        <Link href="/" passHref>
          <Text
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
            cursor="pointer"
          >
            Portfolio
          </Text>
        </Link>

        {/* デスクトップメニュー */}
        <HStack spacing={8} display={{ base: "none", md: "flex" }}>
          <Link href="/about" passHref>
            <Button variant="ghost" colorScheme="blue">
              About
            </Button>
          </Link>
          <Link href="/projects" passHref>
            <Button variant="ghost" colorScheme="blue">
              Projects
            </Button>
          </Link>
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              colorScheme="blue"
              rightIcon={<ChevronDownIcon />}
            >
              Products
            </MenuButton>
            <MenuList>
              <Link href="/products" passHref>
                <MenuItem>Products概要</MenuItem>
              </Link>
              <Link href="/products/task-management" passHref>
                <MenuItem>タスク管理ツール</MenuItem>
              </Link>
              <Link href="/products/ebay-automation/login" passHref>
                <MenuItem>eBay自動化ツール</MenuItem>
              </Link>
            </MenuList>
          </Menu>
        </HStack>

        {/* モバイルメニューボタン */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={<HamburgerIcon />}
          variant="ghost"
          onClick={onOpen}
          aria-label="メニュー"
        />
      </Flex>

      {/* モバイルメニュー */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">メニュー</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Link href="/about" passHref>
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  w="full"
                  onClick={onClose}
                >
                  About
                </Button>
              </Link>
              <Link href="/projects" passHref>
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  w="full"
                  onClick={onClose}
                >
                  Projects
                </Button>
              </Link>
              <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                Products
              </Text>
              <VStack spacing={2} align="stretch" pl={4}>
                <Link href="/products" passHref>
                  <Button
                    variant="ghost"
                    colorScheme="blue"
                    w="full"
                    size="sm"
                    onClick={onClose}
                  >
                    Products概要
                  </Button>
                </Link>
                <Link href="/products/task-management" passHref>
                  <Button
                    variant="ghost"
                    colorScheme="blue"
                    w="full"
                    size="sm"
                    onClick={onClose}
                  >
                    タスク管理ツール
                  </Button>
                </Link>
                <Link href="/products/ebay-automation" passHref>
                  <Button
                    variant="ghost"
                    colorScheme="blue"
                    w="full"
                    size="sm"
                    onClick={onClose}
                  >
                    eBay自動化ツール
                  </Button>
                </Link>
              </VStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
