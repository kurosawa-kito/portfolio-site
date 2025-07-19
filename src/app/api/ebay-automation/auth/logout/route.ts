// eBay自動化ツール専用ログアウトAPI

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import EbayAuthService from "@/lib/ebay-auth";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("ebay-session")?.value;

    if (sessionToken) {
      await EbayAuthService.revokeSession(sessionToken);
    }

    const response = NextResponse.json({
      success: true,
      message: "ログアウトしました",
    });

    // クッキーを削除
    response.cookies.set("ebay-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("eBay logout error:", error);
    return NextResponse.json(
      { success: false, error: "ログアウトに失敗しました" },
      { status: 500 }
    );
  }
}
