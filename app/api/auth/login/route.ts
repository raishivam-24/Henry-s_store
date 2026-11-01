
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createAuthToken, setAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // Allow both customer and admin accounts.
    // Never accept a role from the request body.
    const user = await User.findOne({ email }).select(
      "+password name email role"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const safeUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role as "customer" | "admin",
    };

    const token = createAuthToken(safeUser);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: safeUser,
        redirectTo:
          user.role === "admin" ? "/admin" : "/account",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not log in.",
      },
      { status: 500 }
    );
  }
}
