import { v4 as uuidv4 } from 'uuid';
import { ExcelFile, HistoryFile } from '@/types/excel';

// 保存先のDBテーブル名
const DB_VERSION = 1;
const DB_NAME = 'excel_diff_db';
const FILE_STORE = 'excel_files';
const HISTORY_STORE = 'file_history';

/**
 * IndexedDBを初期化する
 */
function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject('データベースの初期化に失敗しました');
    };
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // エクセルファイルを保存するストア
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, { keyPath: 'id' });
      }
      
      // ファイル履歴を保存するストア
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
        historyStore.createIndex('name', 'name', { unique: false });
      }
    };
  });
}

/**
 * エクセルファイルをストレージに保存する
 */
export async function saveExcelFile(file: ExcelFile): Promise<string> {
  const db = await initDb();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FILE_STORE], 'readwrite');
    const store = transaction.objectStore(FILE_STORE);
    
    // IDがない場合は生成
    if (!file.id) {
      file.id = uuidv4();
    }
    
    const request = store.put(file);
    
    request.onsuccess = () => {
      resolve(file.id as string);
    };
    
    request.onerror = () => {
      reject('ファイルの保存に失敗しました');
    };
  });
}

/**
 * エクセルファイルをストレージから取得する
 */
export async function getExcelFile(id: string): Promise<ExcelFile | null> {
  const db = await initDb();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FILE_STORE], 'readonly');
    const store = transaction.objectStore(FILE_STORE);
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = () => {
      reject('ファイルの取得に失敗しました');
    };
  });
}

/**
 * ファイル履歴を保存する
 */
export async function saveToHistory(historyFile: HistoryFile): Promise<void> {
  const db = await initDb();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([HISTORY_STORE], 'readwrite');
    const store = transaction.objectStore(HISTORY_STORE);
    
    // IDがない場合は生成
    if (!historyFile.id) {
      historyFile.id = uuidv4();
    }
    
    const request = store.put(historyFile);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject('履歴の保存に失敗しました');
    };
  });
}

/**
 * 履歴からファイルを検索する
 */
export async function searchHistory(query: string): Promise<HistoryFile[]> {
  const db = await initDb();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([HISTORY_STORE], 'readonly');
    const store = transaction.objectStore(HISTORY_STORE);
    const request = store.openCursor();
    const results: HistoryFile[] = [];
    
    // クエリが空の場合はすべての履歴を返す
    const searchTerm = query.toLowerCase();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      
      if (cursor) {
        const historyFile = cursor.value as HistoryFile;
        
        // ファイル名にクエリが含まれているかチェック
        if (!searchTerm || historyFile.name.toLowerCase().includes(searchTerm)) {
          results.push(historyFile);
        }
        
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    
    request.onerror = () => {
      reject('履歴の検索に失敗しました');
    };
  });
}

/**
 * 履歴からファイルを削除する
 */
export async function removeFromHistory(id: string): Promise<void> {
  const db = await initDb();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([HISTORY_STORE], 'readwrite');
    const store = transaction.objectStore(HISTORY_STORE);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject('履歴の削除に失敗しました');
    };
  });
} 