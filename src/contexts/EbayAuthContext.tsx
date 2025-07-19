"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface EbayUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  subscriptionPlan: string;
}

interface EbayAuthContextType {
  user: EbayUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const EbayAuthContext = createContext<EbayAuthContextType | undefined>(
  undefined
);

export function EbayAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EbayUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時にセッションをチェック
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/ebay-automation/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error("認証チェックエラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/ebay-automation/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("ログインエラー:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/ebay-automation/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      setUser(null);
    }
  };

  const value: EbayAuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <EbayAuthContext.Provider value={value}>
      {children}
    </EbayAuthContext.Provider>
  );
}

export function useEbayAuth() {
  const context = useContext(EbayAuthContext);
  if (context === undefined) {
    throw new Error("useEbayAuth must be used within an EbayAuthProvider");
  }
  return context;
}
