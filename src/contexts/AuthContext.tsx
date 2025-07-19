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

const safeBase64Encode = (str: string, user: any) => {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }),
    );
  } catch (e) {
    console.error("Base64エンコードエラー:", e);
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
  isInitialized: boolean; // 追加
  showTaskHeader: boolean;
  setShowTaskHeader: Dispatch<SetStateAction<boolean>>;
  login: (login_id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetSessionTimer: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // 追加
  const [showTaskHeader, setShowTaskHeader] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const resetSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    if (user) {
      const timer = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT);
      setSessionTimer(timer);
    }
  };

  useEffect(() => {
    const activityEvents = ["mousedown", "keypress", "scroll", "touchstart"];
    const handleActivity = () => resetSessionTimer();

    if (user) {
      activityEvents.forEach((event) => {
        window.addEventListener(event, handleActivity);
      });
      resetSessionTimer();
    }

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          userData.id = parseInt(userData.id);
          if (!userData.id || !userData.username || !userData.role) {
            sessionStorage.removeItem("user");
            setIsInitialized(true);
            return;
          }
          setUser(userData);
          setIsLoggedIn(true);
          setShowTaskHeader(true);
        }
      } catch (e) {
        sessionStorage.removeItem("user");
      } finally {
        setIsInitialized(true); // 初期化完了
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!user);
    setShowTaskHeader(!!user);
  }, [user]);

  useEffect(() => {
    if (user) {
      const taskRelatedPaths = [
        "/member/tasks",
        "/admin/dashboard",
        "/shared",
        "/admin/users",
      ];
      const isTaskRelatedPath = taskRelatedPaths.some((path) =>
        pathname?.startsWith(path),
      );
      setShowTaskHeader(isTaskRelatedPath);
    }
  }, [user, pathname]);

  const login = async (login_id: string, password: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const headers = { "Content-Type": "application/json" };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers,
        body: JSON.stringify({ login_id, password }),
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.success) {
        const userData = {
          id: parseInt(data.userId),
          username: data.username,
          role: data.role,
        };

        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("role", data.role);

        setUser(userData);
        setIsLoggedIn(true);
        setShowTaskHeader(true);

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
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("role");
        if (sessionTimer) {
          clearTimeout(sessionTimer);
          setSessionTimer(null);
        }
        setUser(null);
        setIsLoggedIn(false);
        setShowTaskHeader(false);
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
    isLoggedIn,
    setIsLoggedIn,
    isInitialized, // 追加
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
