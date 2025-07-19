// 設定管理API
// TODO: 実際の設定保存・読み込みを実装

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import EbayAuthService from "@/lib/ebay-auth";

// eBay専用認証チェック関数
async function checkEbayAuth() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("ebay-session")?.value;

    if (!sessionToken) {
      return { isAuthenticated: false, user: null };
    }

    const user = await EbayAuthService.validateSession(sessionToken);
    return { isAuthenticated: !!user, user };
  } catch (error) {
    return { isAuthenticated: false, user: null };
  }
}

export async function GET() {
  try {
    // eBay専用認証チェック
    const auth = await checkEbayAuth();
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { success: false, error: "eBayツールへのログインが必要です" },
        { status: 401 },
      );
    }

    // TODO: 実際の設定読み込みを実装
    // ユーザー別の設定をVercel BlobやJSONファイルから読み込む

    const defaultSettings = {
      defaultProfitRate: 30,
      defaultShippingCost: 500,
      defaultHandlingTime: 3,
      defaultReturnPolicy: "30日以内返品可",
      defaultCategory: "Consumer Electronics",
      defaultCondition: "Used",
      autoRelist: false,
      maxRelistTimes: 3,
      priceMonitoring: false,
      priceAdjustmentRate: 5,
      emailNotifications: true,
      smsNotifications: false,
    };

    return NextResponse.json({ success: true, settings: defaultSettings });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { success: false, error: "設定の読み込みに失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // eBay専用認証チェック
    const auth = await checkEbayAuth();
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { success: false, error: "eBayツールへのログインが必要です" },
        { status: 401 },
      );
    }

    const settings = await request.json();

    // TODO: 実際の設定保存を実装
    // ユーザー別の設定をVercel BlobやJSONファイルに保存
    console.log("Saving settings for user:", auth.user.id, settings);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json(
      { success: false, error: "設定の保存に失敗しました" },
      { status: 500 },
    );
  }
}
