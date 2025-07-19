// eBay自動化ツール専用セッション確認API

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import EbayAuthService from "@/lib/ebay-auth";

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("ebay-session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, isAuthenticated: false });
    }

    const user = await EbayAuthService.validateSession(sessionToken);

    if (!user) {
      return NextResponse.json({ success: false, isAuthenticated: false });
    }

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    console.error("eBay session check error:", error);
    return NextResponse.json({ success: false, isAuthenticated: false });
  }
}
