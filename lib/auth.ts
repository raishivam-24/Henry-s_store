import { cookies } from "next/headers";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const COOKIE_NAME = "henrys-store-token";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }

  return secret;
}

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

type TokenPayload = JwtPayload & {
  role: "customer" | "admin";
};

export function createAuthToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      role: user.role,
    },
    getSecret(),
    {
      subject: user.id,
      expiresIn: "7d",
      issuer: "henrys-store",
      audience: "henrys-store-users",
    }
  );
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, getSecret(), {
      issuer: "henrys-store",
      audience: "henrys-store-users",
    }) as TokenPayload;

    if (
      typeof decoded.sub !== "string" ||
      (decoded.role !== "customer" && decoded.role !== "admin")
    ) {
      return null;
    }

    await connectDB();

    // Read the current role from MongoDB, not just the JWT.
    // This means a demoted admin loses admin access immediately.
    const user = await User.findById(decoded.sub)
      .select("_id name email role")
      .lean();

    if (!user) return null;

    if (user.role !== "customer" && user.role !== "admin") {
      return null;
    }

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function requireCustomer() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "customer") {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}