import { NextRequest, NextResponse } from "next/server";

// Mock users data for demonstration
export const users = [
  {
    id: "user1",
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    id: "user2",
    username: "user",
    password: "user123",
    role: "user",
  },
  {
    id: "user3",
    username: "dev1",
    password: "dev123",
    role: "user",
  },
  {
    id: "user4",
    username: "dev2",
    password: "dev123",
    role: "user",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Find user
    const user = users.find((u) => u.username === username);

    // Check if user exists and password matches
    if (user && user.password === password) {
      // Success login
      return NextResponse.json({
        success: true,
        userId: user.id,
        role: user.role,
      });
    } else {
      // Failed login
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
