import React, { useEffect, useRef } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Badge,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useExcelDiffStore } from "@/contexts/DiffContext";
import { RowDiff, CellDiff } from "@/types/excel";
import { getDiffAtIndex } from "@/lib/excel-diff/diff";

interface DiffViewerProps {
  sheetName: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ sheetName }) => {
  const { diffResults, currentDiffIndex } = useExcelDiffStore();

  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  // 変更行の背景色
  const addedBg = useColorModeValue("green.50", "green.900");
  const removedBg = useColorModeValue("red.50", "red.900");
  const modifiedBg = useColorModeValue("yellow.50", "yellow.900");

  // 変更セルの背景色
  const addedCellBg = useColorModeValue("green.100", "green.800");
  const removedCellBg = useColorModeValue("red.100", "red.800");
  const modifiedCellBg = useColorModeValue("yellow.100", "yellow.800");

  // 差分結果の取得
  const diffResult = diffResults.find((diff) => diff.sheetName === sheetName);

  // 現在の差分に移動
  useEffect(() => {
    if (currentDiffIndex === -1 || !tbodyRef.current) return;

    const currentDiff = getDiffAtIndex(diffResults, currentDiffIndex);
    if (!currentDiff || currentDiff.diffResult.sheetName !== sheetName) return;

    const rowIndex = currentDiff.rowDiff.index;
    const rows = tbodyRef.current.querySelectorAll("tr");

    if (rows[rowIndex]) {
      rows[rowIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentDiffIndex, diffResults, sheetName]);

  if (!diffResult) {
    return (
      <Box p={4} textAlign="center">
        <Text>シート「{sheetName}」の差分データが見つかりません</Text>
      </Box>
    );
  }

  // スプレッドシートの差分表示
  return (
    <Box
      overflowX="auto"
      overflowY="auto"
      maxH="600px"
      borderWidth="1px"
      borderRadius="md"
    >
      <Table size="sm" variant="striped">
        <Thead position="sticky" top={0} bg="white" zIndex={1}>
          <Tr>
            <Th width="50px">#</Th>
            {/* カラム数を取得（最大のセル数） */}
            {diffResult.rowDiffs.length > 0 &&
              Array.from({
                length: Math.max(
                  ...diffResult.rowDiffs.map((row) =>
                    row.cellDiffs ? row.cellDiffs.length : 0,
                  ),
                ),
              }).map((_, i) => <Th key={i}>列 {i + 1}</Th>)}
          </Tr>
        </Thead>
        <Tbody ref={tbodyRef}>
          {diffResult.rowDiffs.map((rowDiff, rowIdx) => {
            // 行の状態に応じた背景色の設定
            let rowBg;
            if (rowDiff.type === "added") rowBg = addedBg;
            else if (rowDiff.type === "removed") rowBg = removedBg;
            else if (rowDiff.type === "modified") rowBg = modifiedBg;

            return (
              <Tr
                key={rowIdx}
                bg={rowBg}
                id={`row-${rowIdx}`}
                data-diff-type={rowDiff.type}
              >
                <Td>
                  <HStack spacing={2}>
                    <Text>{rowIdx + 1}</Text>
                    {rowDiff.type !== "unchanged" && (
                      <Badge
                        colorScheme={
                          rowDiff.type === "added"
                            ? "green"
                            : rowDiff.type === "removed"
                              ? "red"
                              : "yellow"
                        }
                      >
                        {rowDiff.type === "added"
                          ? "追加"
                          : rowDiff.type === "removed"
                            ? "削除"
                            : "変更"}
                      </Badge>
                    )}
                  </HStack>
                </Td>

                {rowDiff.cellDiffs &&
                  rowDiff.cellDiffs.map((cellDiff, cellIdx) => {
                    // セルの状態に応じた背景色の設定
                    let cellBg;
                    if (cellDiff.type === "added") cellBg = addedCellBg;
                    else if (cellDiff.type === "removed")
                      cellBg = removedCellBg;
                    else if (cellDiff.type === "modified")
                      cellBg = modifiedCellBg;

                    // セルの表示内容
                    return (
                      <Td
                        key={cellIdx}
                        bg={cellBg}
                        data-diff-type={cellDiff.type}
                      >
                        {rowDiff.type === "unchanged" ? (
                          <Text>{cellDiff.originalValue ?? ""}</Text>
                        ) : rowDiff.type === "added" ? (
                          <Text color="green.600" fontWeight="medium">
                            {cellDiff.modifiedValue ?? ""}
                          </Text>
                        ) : rowDiff.type === "removed" ? (
                          <Text color="red.600" fontWeight="medium">
                            {cellDiff.originalValue ?? ""}
                          </Text>
                        ) : (
                          <Flex direction="column">
                            <Text color="red.600" textDecoration="line-through">
                              {cellDiff.originalValue ?? ""}
                            </Text>
                            <Text color="green.600">
                              {cellDiff.modifiedValue ?? ""}
                            </Text>
                          </Flex>
                        )}
                      </Td>
                    );
                  })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default DiffViewer;
