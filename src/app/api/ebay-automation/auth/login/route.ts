// eBay自動化ツール専用ログインAPI

import { NextResponse } from "next/server";
import EbayAuthService from "@/lib/ebay-auth";

export async function POST(request) {
  try {
    const { email, username, password } = await request.json();

    // emailまたはusernameのどちらかが必要
    const loginId = email || username;

    console.log("eBay Login attempt:", { email, username, loginId });

    if (!loginId || !password) {
      console.log("Missing credentials:", {
        loginId: !!loginId,
        password: !!password,
      });
      return NextResponse.json(
        { success: false, error: "ユーザー名とパスワードを入力してください" },
        { status: 400 }
      );
    }

    const { user, sessionToken } = await EbayAuthService.loginUser(
      loginId,
      password
    );

    // セッショントークンをHTTPOnlyクッキーに設定
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        subscriptionPlan: user.subscriptionPlan,
      },
    });

    response.cookies.set("ebay-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("eBay login error:", error);
    let message = "ログインに失敗しました";
    let stack = undefined;
    if (typeof error === "object" && error !== null) {
      if ("message" in error && typeof error.message === "string") {
        message = error.message;
      }
      if ("stack" in error && typeof error.stack === "string") {
        stack = error.stack;
      }
    }
    console.error("Error details:", {
      message,
      stack,
    });
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 }
    );
  }
}
