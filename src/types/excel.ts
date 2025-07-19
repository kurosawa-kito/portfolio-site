export type CellValue = string | number | boolean | null;

export interface ExcelCell {
  value: CellValue;
  style?: {
    color?: string;
    backgroundColor?: string;
    fontWeight?: string;
    [key: string]: any;
  };
}

export interface ExcelRow {
  cells: ExcelCell[];
  index: number;
}

export interface ExcelSheet {
  name: string;
  rows: ExcelRow[];
}

export interface ExcelFile {
  id?: string;
  name: string;
  path?: string;
  uploadedAt?: string;
  sheets: ExcelSheet[];
}

export interface DiffResult {
  sheetName: string;
  rowDiffs: RowDiff[];
}

export interface RowDiff {
  index: number;
  type: "added" | "removed" | "modified" | "unchanged";
  cellDiffs: CellDiff[];
  original?: ExcelRow;
  modified?: ExcelRow;
}

export interface CellDiff {
  index: number;
  type: "added" | "removed" | "modified" | "unchanged";
  originalValue?: CellValue;
  modifiedValue?: CellValue;
}

export interface HistoryFile {
  id: string;
  name: string;
  path: string;
  uploadedAt: string;
  size: number;
}

export interface FileUploadState {
  originalFile: ExcelFile | null;
  modifiedFile: ExcelFile | null;
  selectedSheet: string | null;
  diffResults: DiffResult[];
  history: HistoryFile[];
  currentDiffIndex: number;
  totalDiffs: number;
}
