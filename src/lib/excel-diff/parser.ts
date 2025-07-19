import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import {
  ExcelFile,
  ExcelSheet,
  ExcelRow,
  ExcelCell,
  CellValue,
} from "@/types/excel";

/**
 * Excelファイルを解析してデータ構造に変換する
 */
export async function parseExcelFile(file: File): Promise<ExcelFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheets: ExcelSheet[] = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[];

          const rows: ExcelRow[] = jsonData.map((row, rowIndex) => {
            const cells: ExcelCell[] = (row as any[]).map((cellValue, cellIndex) => {
              return {
                value: formatCellValue(cellValue),
              };
            });

            return {
              index: rowIndex,
              cells,
            };
          });

          return {
            name: sheetName,
            rows,
          };
        });

        resolve({
          id: uuidv4(),
          name: file.name,
          uploadedAt: new Date().toISOString(),
          sheets,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * セルの値を適切な形式にフォーマットする
 */
function formatCellValue(value: any): CellValue {
  if (value === undefined || value === null) {
    return null;
  }

  // 日付の場合はISOString形式に
  if (value instanceof Date) {
    return value.toISOString();
  }

  // 数値・文字列・真偽値はそのまま
  return value;
}

/**
 * ExcelファイルをBlobとして出力する
 */
export function exportToExcel(excelData: ExcelFile): Blob {
  const workbook = XLSX.utils.book_new();

  excelData.sheets.forEach((sheet) => {
    const wsData = sheet.rows.map((row) => row.cells.map((cell) => cell.value));

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(workbook, ws, sheet.name);
  });

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * シート名の一覧を取得する
 */
export function getSheetNames(excelFile: ExcelFile): string[] {
  return excelFile.sheets.map((sheet) => sheet.name);
}

/**
 * 共通のシート名を取得する
 */
export function getCommonSheetNames(
  file1: ExcelFile,
  file2: ExcelFile,
): string[] {
  const sheet1Names = new Set(file1.sheets.map((s) => s.name));
  return file2.sheets
    .map((s) => s.name)
    .filter((name) => sheet1Names.has(name));
}
