"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Divider,
  useToast,
} from "@chakra-ui/react";
import FileUploader from "@/components/excel-diff/FileUploader";
import DiffViewer from "@/components/excel-diff/DiffViewer";
import FileHistory from "@/components/excel-diff/FileHistory";
import DiffNavigation from "@/components/excel-diff/DiffNavigation";
import FolderUploader from "@/components/excel-diff/FolderUploader";
import { useExcelDiffStore } from "@/contexts/DiffContext";
import { compareExcelFiles } from "@/lib/excel-diff/diff";
import { getCommonSheetNames } from "@/lib/excel-diff/parser";

export default function ExcelDiffPage() {
  const [isComparing, setIsComparing] = useState(false);
  const [commonSheets, setCommonSheets] = useState<string[]>([]);
  const toast = useToast();

  const {
    originalFile,
    modifiedFile,
    selectedSheet,
    setSelectedSheet,
    setDiffResults,
    clearFiles,
  } = useExcelDiffStore();

  // 両方のファイルがアップロードされたら共通のシート名を取得
  useEffect(() => {
    if (originalFile && modifiedFile) {
      const sheetNames = getCommonSheetNames(originalFile, modifiedFile);
      setCommonSheets(sheetNames);

      // 最初のシートを選択
      if (sheetNames.length > 0 && !selectedSheet) {
        setSelectedSheet(sheetNames[0]);
      }
    } else {
      setCommonSheets([]);
      setSelectedSheet(null);
    }
  }, [originalFile, modifiedFile, selectedSheet, setSelectedSheet]);

  // 差分比較を実行
  const handleCompare = async () => {
    if (!originalFile || !modifiedFile || !selectedSheet) {
      toast({
        title: "エラー",
        description: "ファイルとシートを選択してください",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsComparing(true);

      // 差分比較を実行
      const diffResult = compareExcelFiles(
        originalFile,
        modifiedFile,
        selectedSheet
      );
      setDiffResults([diffResult]);

      // 差分比較履歴をデータベースに保存
      const comparisonRecord = {
        id: crypto.randomUUID(), // uuid の代わりに組み込みの randomUUID を使用
        name: `${originalFile.name} vs ${modifiedFile.name}`,
        path: JSON.stringify({
          originalId: originalFile.id,
          modifiedId: modifiedFile.id,
          sheetName: selectedSheet,
        }),
        size: JSON.stringify(diffResult).length,
      };

      console.log("比較記録を作成:", comparisonRecord);

      // APIを呼び出して履歴を保存
      try {
        const response = await fetch("/api/excel-diff/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(comparisonRecord),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("履歴の保存に失敗しました", errorData);
          toast({
            title: "履歴保存エラー",
            description: errorData.error || "履歴の保存に失敗しました",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        console.log("比較履歴の保存に成功しました");
      } catch (apiError) {
        console.error("API呼び出しエラー:", apiError);
        toast({
          title: "ネットワークエラー",
          description: "サーバーとの通信に失敗しました",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsComparing(false);
    }
  };

  // シートの選択変更
  const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSheet(e.target.value);
  };

  // すべてクリア
  const handleClear = () => {
    clearFiles();
    setSelectedSheet(null);
    setCommonSheets([]);
  };

  // フォルダアップロード完了時の処理
  const handleFolderUploadComplete = () => {
    // 必要に応じて状態を更新
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            Excel差分比較ツール
          </Heading>
          <Text color="gray.600">
            2つのExcelファイルを比較して差分を視覚的に表示します
          </Text>
        </Box>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <FileUploader type="original" label="元のファイル（比較元）" />
            <HStack mt={2} justify="flex-end">
              <FileHistory type="original" onSelect={() => {}} />
            </HStack>
          </GridItem>

          <GridItem>
            <FileUploader
              type="modified"
              label="変更後のファイル（比較対象）"
            />
            <HStack mt={2} justify="flex-end">
              <FileHistory type="modified" onSelect={() => {}} />
            </HStack>
          </GridItem>
        </Grid>

        <Divider />

        <HStack spacing={4} justify="space-between">
          <Box>
            <HStack spacing={4}>
              <Text fontWeight="medium">シート選択：</Text>
              <Select
                placeholder="シートを選択..."
                value={selectedSheet || ""}
                onChange={handleSheetChange}
                width="200px"
                isDisabled={commonSheets.length === 0}
              >
                {commonSheets.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </Select>
            </HStack>
          </Box>

          <HStack spacing={4}>
            <FolderUploader onComplete={handleFolderUploadComplete} />
            <Button colorScheme="red" variant="outline" onClick={handleClear}>
              すべてクリア
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCompare}
              isLoading={isComparing}
              loadingText="比較中..."
              isDisabled={!originalFile || !modifiedFile || !selectedSheet}
            >
              差分を比較
            </Button>
          </HStack>
        </HStack>

        <Divider />

        <DiffNavigation />

        {selectedSheet && (
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <DiffViewer sheetName={selectedSheet} />
          </Box>
        )}
      </VStack>
    </Container>
  );
}
