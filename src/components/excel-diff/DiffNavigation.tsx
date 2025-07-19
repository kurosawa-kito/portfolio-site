import React, { useEffect } from "react";
import {
  Box,
  Button,
  HStack,
  Text,
  Badge,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useExcelDiffStore } from "@/contexts/DiffContext";
import { getDiffAtIndex } from "@/lib/excel-diff/diff";

const DiffNavigation: React.FC = () => {
  const {
    diffResults,
    currentDiffIndex,
    navigateToNextDiff,
    navigateToPrevDiff,
  } = useExcelDiffStore();

  // 差分の合計数を計算
  const totalDiffs = diffResults.reduce(
    (total, result) =>
      total + result.rowDiffs.filter((row) => row.type !== "unchanged").length,
    0,
  );

  // ショートカットキーの設定
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 上下キーで差分ナビゲーション
      if (event.key === "ArrowDown" && !event.ctrlKey) {
        event.preventDefault();
        navigateToNextDiff();
      } else if (event.key === "ArrowUp" && !event.ctrlKey) {
        event.preventDefault();
        navigateToPrevDiff();
      }
    };

    // キーダウンイベントのリスナーを追加
    window.addEventListener("keydown", handleKeyDown);

    // クリーンアップ
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigateToNextDiff, navigateToPrevDiff]);

  // 現在の差分の種類を取得
  const getCurrentDiffType = () => {
    if (currentDiffIndex === -1 || totalDiffs === 0) return null;

    const diffInfo = getDiffAtIndex(diffResults, currentDiffIndex);
    if (!diffInfo) return null;

    return diffInfo.rowDiff.type;
  };

  const currentDiffType = getCurrentDiffType();

  // 差分種類に応じたバッジの色を設定
  const getBadgeColor = () => {
    if (currentDiffType === "added") return "green";
    if (currentDiffType === "removed") return "red";
    if (currentDiffType === "modified") return "yellow";
    return "gray";
  };

  // 差分種類に応じたラベルを設定
  const getDiffTypeLabel = () => {
    if (currentDiffType === "added") return "追加";
    if (currentDiffType === "removed") return "削除";
    if (currentDiffType === "modified") return "変更";
    return "";
  };

  // 現在のシート名を取得
  const getCurrentSheetName = () => {
    if (currentDiffIndex === -1 || totalDiffs === 0) return "";

    const diffInfo = getDiffAtIndex(diffResults, currentDiffIndex);
    if (!diffInfo) return "";

    return diffInfo.diffResult.sheetName;
  };

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      bg={useColorModeValue("white", "gray.800")}
      boxShadow="sm"
    >
      <HStack spacing={4} justify="space-between" align="center">
        <HStack spacing={3}>
          <Text fontSize="sm" fontWeight="medium">
            差分：
          </Text>
          <Badge colorScheme="blue">
            {currentDiffIndex + 1} / {totalDiffs}
          </Badge>

          {currentDiffType && (
            <>
              <Badge colorScheme={getBadgeColor()}>{getDiffTypeLabel()}</Badge>
              <Text fontSize="sm" color="gray.500">
                シート: {getCurrentSheetName()}
              </Text>
            </>
          )}
        </HStack>

        <HStack spacing={2}>
          <Tooltip label="前の差分 (↑)">
            <Button
              size="sm"
              leftIcon={<ChevronUpIcon />}
              onClick={navigateToPrevDiff}
              isDisabled={currentDiffIndex <= 0 || totalDiffs === 0}
            >
              前へ
            </Button>
          </Tooltip>
          <Tooltip label="次の差分 (↓)">
            <Button
              size="sm"
              rightIcon={<ChevronDownIcon />}
              onClick={navigateToNextDiff}
              isDisabled={
                currentDiffIndex >= totalDiffs - 1 || totalDiffs === 0
              }
            >
              次へ
            </Button>
          </Tooltip>
        </HStack>
      </HStack>
    </Box>
  );
};

export default DiffNavigation;
