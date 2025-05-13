import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ExcelFile, 
  DiffResult, 
  HistoryFile,
} from '@/types/excel';

interface ExcelDiffState {
  // ファイル状態
  originalFile: ExcelFile | null;
  modifiedFile: ExcelFile | null;
  
  // 比較状態
  selectedSheet: string | null;
  diffResults: DiffResult[];
  currentDiffIndex: number;
  
  // 履歴状態
  fileHistory: HistoryFile[];
  
  // アクション
  setOriginalFile: (file: ExcelFile | null) => void;
  setModifiedFile: (file: ExcelFile | null) => void;
  setSelectedSheet: (sheetName: string | null) => void;
  setDiffResults: (results: DiffResult[]) => void;
  setCurrentDiffIndex: (index: number) => void;
  navigateToNextDiff: () => void;
  navigateToPrevDiff: () => void;
  addToHistory: (file: HistoryFile) => void;
  removeFromHistory: (fileId: string) => void;
  clearFiles: () => void;
}

export const useExcelDiffStore = create<ExcelDiffState>()(
  persist(
    (set, get) => ({
      // 初期状態
      originalFile: null,
      modifiedFile: null,
      selectedSheet: null,
      diffResults: [],
      currentDiffIndex: -1,
      fileHistory: [],
      
      // アクション
      setOriginalFile: (file) => set({ originalFile: file }),
      setModifiedFile: (file) => set({ modifiedFile: file }),
      setSelectedSheet: (sheetName) => set({ selectedSheet: sheetName }),
      setDiffResults: (results) => set({ 
        diffResults: results,
        currentDiffIndex: results.length > 0 ? 0 : -1,
      }),
      setCurrentDiffIndex: (index) => set({ currentDiffIndex: index }),
      
      navigateToNextDiff: () => {
        const { currentDiffIndex, diffResults } = get();
        const totalDiffs = diffResults.reduce(
          (sum, sheet) => sum + sheet.rowDiffs.filter(row => row.type !== 'unchanged').length, 
          0
        );
        
        if (currentDiffIndex < totalDiffs - 1) {
          set({ currentDiffIndex: currentDiffIndex + 1 });
        }
      },
      
      navigateToPrevDiff: () => {
        const { currentDiffIndex } = get();
        if (currentDiffIndex > 0) {
          set({ currentDiffIndex: currentDiffIndex - 1 });
        }
      },
      
      addToHistory: (file) => {
        const { fileHistory } = get();
        // 重複チェック
        const exists = fileHistory.some(f => f.id === file.id);
        if (!exists) {
          set({ fileHistory: [...fileHistory, file] });
        }
      },
      
      removeFromHistory: (fileId) => {
        const { fileHistory } = get();
        set({ fileHistory: fileHistory.filter(f => f.id !== fileId) });
      },
      
      clearFiles: () => set({ 
        originalFile: null, 
        modifiedFile: null,
        diffResults: [],
        currentDiffIndex: -1,
      }),
    }),
    {
      name: 'excel-diff-storage',
      partialize: (state) => ({
        fileHistory: state.fileHistory,
      }),
    }
  )
); 