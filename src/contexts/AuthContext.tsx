"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";

// マルチバイト文字をエンコードするための安全なbase64エンコード関数
const safeBase64Encode = (str: string, user: any) => {
  try {
    // UTF-8でエンコードしてからbase64に変換
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch (e) {
    console.error("Base64エンコードエラー:", e);
    // エラー時は単純な文字列を返す（ロールバック）
    return btoa(JSON.stringify({ id: user?.id || 0 }));
  }
};

type User = {
  id: number;
  username: string;
  role: string;
} | null;

type AuthContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  showTaskHeader: boolean;
  setShowTaskHeader: Dispatch<SetStateAction<boolean>>;
  login: (login_id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetSessionTimer: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// セッションタイムアウト時間（ミリ秒）: 30分
const SESSION_TIMEOUT = 30 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [showTaskHeader, setShowTaskHeader] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // セッションタイマーをリセットする関数
  const resetSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    if (user) {
      const timer = setTimeout(() => {
        // タイムアウト時に自動ログアウト
        logout();
      }, SESSION_TIMEOUT);

      setSessionTimer(timer);
    }
  };

  // ユーザーのアクティビティを検出するイベントリスナー
  useEffect(() => {
    const activityEvents = ["mousedown", "keypress", "scroll", "touchstart"];

    const handleActivity = () => {
      resetSessionTimer();
    };

    // ユーザーがログインしている場合のみイベントリスナーを設定
    if (user) {
      activityEvents.forEach((event) => {
        window.addEventListener(event, handleActivity);
      });

      // 初期タイマーを設定
      resetSessionTimer();
    }

    return () => {
      // クリーンアップ時にイベントリスナーとタイマーを削除
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, [user]); // userが変わったときに再設定

  // セッションストレージからユーザーデータを取得
  useEffect(() => {
    // 初期ロード時にセッションストレージからユーザー情報を取得
    try {
      const userStr = sessionStorage.getItem("user");

      if (userStr) {
        try {
          const userData = JSON.parse(userStr);

          // ユーザーIDを数値に変換
          userData.id = parseInt(userData.id);

          // 必須フィールドの存在を確認
          if (!userData.id || !userData.username || !userData.role) {
            // 不完全なデータは使用しない
            sessionStorage.removeItem("user");
            return;
          }

          setUser(userData);
          setIsLoggedIn(true);
          setShowTaskHeader(true);
        } catch (e) {
          // 不正なデータを削除
          sessionStorage.removeItem("user");
        }
      }
    } catch (e) {
      // セッションストレージにアクセスできない場合はエラー処理
    }
  }, []);

  // ユーザー情報が変更されたときにログイン状態と表示状態を更新
  useEffect(() => {
    // ユーザー情報が存在する場合はログイン状態を更新
    setIsLoggedIn(!!user);

    if (user) {
      setShowTaskHeader(true);
    } else {
      setShowTaskHeader(false);
    }
  }, [user]);

  // パスの変更を監視し、タスク管理ツール以外のページではヘッダーを非表示にする
  useEffect(() => {
    if (user) {
      // タスク管理ツール関連のページパスのリスト
      const taskRelatedPaths = [
        "/member/tasks",
        "/admin/dashboard",
        "/shared",
        "/admin/users",
      ];

      // 現在のパスがタスク管理ツール関連でない場合はヘッダーを非表示に
      const isTaskRelatedPath = taskRelatedPaths.some((path) =>
        pathname?.startsWith(path)
      );
      setShowTaskHeader(isTaskRelatedPath);
    }
  }, [user, pathname]);

  const login = async (login_id: string, password: string) => {
    try {
      // Laravel APIを使用してログイン
      const data = await api.auth.login(login_id, password);

      if (data.success) {
        // ユーザー情報を保存（IDは数値として保存）
        const userData = {
          id: parseInt(data.userId), // 数値に変換
          username: data.username,
          role: data.role,
        };

        // セッションストレージに保存
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("role", data.role);

        // 認証状態を更新
        setUser(userData);
        setIsLoggedIn(true);
        setShowTaskHeader(true);

        // ロールに応じてリダイレクト
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/member/tasks");
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Laravel APIを使用してログアウト
      const data = await api.auth.logout();

      if (data.success) {
        // セッションストレージからユーザー情報を削除
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("role");

        // タイマーをクリア
        if (sessionTimer) {
          clearTimeout(sessionTimer);
          setSessionTimer(null);
        }

        // 認証状態を更新
        setUser(null);
        setIsLoggedIn(false);
        // タスクヘッダーを非表示にする
        setShowTaskHeader(false);

        // ログアウト後は/productsページにリダイレクト
        router.push("/products");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const values: AuthContextType = {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    showTaskHeader,
    setShowTaskHeader,
    login,
    logout,
    resetSessionTimer,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
