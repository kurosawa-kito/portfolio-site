"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

type User = {
  id: number;
  username: string;
  role: string;
} | null;

type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
  isLoggedIn: boolean;
  showTaskHeader: boolean;
  setShowTaskHeader: (show: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
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

  useEffect(() => {
    // 初期ロード時にセッションストレージからユーザー情報を取得
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      // ユーザーIDを数値に変換
      userData.id = parseInt(userData.id);
      setUser(userData);
      // ユーザーが存在する場合はヘッダーを表示
      setShowTaskHeader(true);
    }
  }, []);

  // ユーザー情報が変更されたときにヘッダーの表示状態を更新
  useEffect(() => {
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

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // ユーザー情報を保存（IDは数値として保存）
        const userData = {
          id: parseInt(data.userId), // 数値に変換
          username,
          role: data.role,
        };

        // セッションストレージに保存
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("role", data.role);

        // 認証状態を更新
        setUser(userData);

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
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

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

  const value = {
    user,
    setUser,
    isLoggedIn: !!user,
    showTaskHeader,
    setShowTaskHeader,
    login,
    logout,
    resetSessionTimer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
