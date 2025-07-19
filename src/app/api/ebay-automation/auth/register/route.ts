// eBay自動化ツール専用登録API

import { NextResponse } from "next/server";
import EbayAuthService from "@/lib/ebay-auth";

export async function POST(request) {
  try {
    const { username, email, password, fullName } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "必須項目を入力してください" },
        { status: 400 },
      );
    }

    // パスワード強度チェック
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "パスワードは8文字以上である必要があります" },
        { status: 400 },
      );
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "有効なメールアドレスを入力してください" },
        { status: 400 },
      );
    }

    const user = await EbayAuthService.registerUser({
      username,
      email,
      password,
      fullName,
    });

    return NextResponse.json({
      success: true,
      message: "アカウントが作成されました。ログインしてください。",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    console.error("eBay registration error:", error);

    let code = undefined;
    let detail = undefined;
    let message = "アカウント作成に失敗しました";
    if (typeof error === "object" && error !== null) {
      if ("code" in error && typeof error.code === "string") {
        code = error.code;
      }
      if ("detail" in error && typeof error.detail === "string") {
        detail = error.detail;
      }
      if ("message" in error && typeof error.message === "string") {
        message = error.message;
      }
    }

    // 重複エラーの処理
    if (code === "23505") {
      if (detail?.includes("username")) {
        return NextResponse.json(
          { success: false, error: "このユーザー名は既に使用されています" },
          { status: 409 },
        );
      }
      if (detail?.includes("email")) {
        return NextResponse.json(
          { success: false, error: "このメールアドレスは既に登録されています" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
