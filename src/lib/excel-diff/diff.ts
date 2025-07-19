import {
  ExcelFile,
  ExcelSheet,
  ExcelRow,
  DiffResult,
  RowDiff,
  CellDiff,
  CellValue,
} from "@/types/excel";

/**
 * 2つのExcelファイルの差分を取得する
 */
export function compareExcelFiles(
  originalFile: ExcelFile,
  modifiedFile: ExcelFile,
  sheetName: string,
): DiffResult {
  // 同じシート名を持つシートを取得
  const originalSheet = originalFile.sheets.find((s) => s.name === sheetName);
  const modifiedSheet = modifiedFile.sheets.find((s) => s.name === sheetName);

  if (!originalSheet || !modifiedSheet) {
    throw new Error(`シート "${sheetName}" が見つかりません`);
  }

  // LCS (Longest Common Subsequence) アルゴリズムを使用して行レベルの差分を計算
  const rowDiffs = compareRows(originalSheet, modifiedSheet);

  return {
    sheetName,
    rowDiffs,
  };
}

/**
 * 行レベルの差分を計算する
 */
function compareRows(
  originalSheet: ExcelSheet,
  modifiedSheet: ExcelSheet,
): RowDiff[] {
  const originalRows = originalSheet.rows;
  const modifiedRows = modifiedSheet.rows;
  const result: RowDiff[] = [];

  let i = 0,
    j = 0;

  while (i < originalRows.length || j < modifiedRows.length) {
    // 両方の行が存在する場合
    if (i < originalRows.length && j < modifiedRows.length) {
      const originalRow = originalRows[i];
      const modifiedRow = modifiedRows[j];

      // セルレベルの差分を計算
      const cellDiffs = compareCells(originalRow, modifiedRow);
      const hasChanges = cellDiffs.some((diff) => diff.type !== "unchanged");

      if (hasChanges) {
        // 変更があった行
        result.push({
          index: i,
          type: "modified",
          cellDiffs,
          original: originalRow,
          modified: modifiedRow,
        });
      } else {
        // 変更がない行
        result.push({
          index: i,
          type: "unchanged",
          cellDiffs,
        });
      }

      i++;
      j++;
    }
    // 原本にのみ存在する行（削除された行）
    else if (i < originalRows.length) {
      const originalRow = originalRows[i];
      result.push({
        index: i,
        type: "removed",
        cellDiffs: originalRow.cells.map((cell, index) => ({
          index,
          type: "removed",
          originalValue: cell.value,
        })),
        original: originalRow,
      });
      i++;
    }
    // 変更後にのみ存在する行（追加された行）
    else if (j < modifiedRows.length) {
      const modifiedRow = modifiedRows[j];
      result.push({
        index: j,
        type: "added",
        cellDiffs: modifiedRow.cells.map((cell, index) => ({
          index,
          type: "added",
          modifiedValue: cell.value,
        })),
        modified: modifiedRow,
      });
      j++;
    }
  }

  return result;
}

/**
 * セルレベルの差分を計算する
 */
function compareCells(
  originalRow: ExcelRow,
  modifiedRow: ExcelRow,
): CellDiff[] {
  const result: CellDiff[] = [];
  const maxCells = Math.max(originalRow.cells.length, modifiedRow.cells.length);

  for (let i = 0; i < maxCells; i++) {
    const originalCell =
      i < originalRow.cells.length ? originalRow.cells[i].value : null;
    const modifiedCell =
      i < modifiedRow.cells.length ? modifiedRow.cells[i].value : null;

    // セルの値を比較
    if (areCellValuesEqual(originalCell, modifiedCell)) {
      // 値が同じ
      result.push({
        index: i,
        type: "unchanged",
        originalValue: originalCell,
        modifiedValue: modifiedCell,
      });
    } else {
      // 値が異なる
      result.push({
        index: i,
        type: "modified",
        originalValue: originalCell,
        modifiedValue: modifiedCell,
      });
    }
  }

  return result;
}

/**
 * セルの値が等しいかどうかを判定する
 */
function areCellValuesEqual(value1: CellValue, value2: CellValue): boolean {
  // 両方nullまたはundefinedの場合は等しい
  if (value1 == null && value2 == null) return true;

  // どちらか一方だけがnullまたはundefinedの場合は等しくない
  if (value1 == null || value2 == null) return false;

  // 型が異なる場合は文字列に変換して比較
  if (typeof value1 !== typeof value2) {
    return String(value1) === String(value2);
  }

  // 同じ型の場合は直接比較
  return value1 === value2;
}

/**
 * 差分の合計数を取得する
 */
export function getTotalDiffs(diffResult: DiffResult): number {
  return diffResult.rowDiffs.reduce((total, rowDiff) => {
    if (rowDiff.type === "unchanged") return total;
    return total + 1;
  }, 0);
}

/**
 * インデックスから差分行を取得する
 */
export function getDiffAtIndex(
  diffResults: DiffResult[],
  index: number,
): { diffResult: DiffResult; rowDiff: RowDiff } | null {
  let counter = 0;

  for (const diffResult of diffResults) {
    for (const rowDiff of diffResult.rowDiffs) {
      if (rowDiff.type !== "unchanged") {
        if (counter === index) {
          return { diffResult, rowDiff };
        }
        counter++;
      }
    }
  }

  return null;
}
