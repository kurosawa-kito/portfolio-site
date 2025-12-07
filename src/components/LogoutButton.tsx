"use client";

import { Button } from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // ログアウト後は/productsページにリダイレクト
      router.push("/products");
    } catch (error) {
      console.error("ログアウトエラー", error);
    }
  };

  return (
    <Button
      size="sm"
      colorScheme="blue"
      variant="outline"
      onClick={handleLogout}
    >
      ログアウト
    </Button>
  );
}
