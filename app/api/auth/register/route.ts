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

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { success: false, message: "Name must be 2–80 characters." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be between 8 and 72 characters.",
        },
        { status: 400 }
      );
    }

    if (phone.length > 20) {
      return NextResponse.json(
        { success: false, message: "Phone number is too long." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email }).select("_id");

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Never accept a role from the registration request.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "customer",
      addresses: [],
    });

    const safeUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: "customer" as const,
    };

    const token = createAuthToken(safeUser);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer registration error:", error);

    return NextResponse.json(
      { success: false, message: "Could not create your account." },
      { status: 500 }
    );
  }
}