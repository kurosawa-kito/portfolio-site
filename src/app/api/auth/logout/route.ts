import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 実際のアプリケーションでは、ここでセッションの削除などの処理を行う
    return NextResponse.json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
