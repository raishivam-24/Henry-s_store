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
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email,
      role: "admin",
    }).select("+password name email role");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { success: false, message: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const safeUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: "admin" as const,
    };

    const token = createAuthToken(safeUser);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Admin login successful.",
      user: safeUser,
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { success: false, message: "Could not log in as admin." },
      { status: 500 }
    );
  }
}