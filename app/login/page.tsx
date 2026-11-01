"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserRound,
  UserRoundPlus,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Leaf,
  Package,
  Heart,
  Sparkles,
  Truck,
  ShieldCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type AuthResponse = {
  success?: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "customer" | "admin";
  };
  redirectTo?: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLogin = mode === "login";

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  function getSafeRedirect(data: AuthResponse) {
    // Admins should always land on the admin dashboard.
    if (data.user?.role === "admin") {
      return "/admin";
    }

    // Support both redirectTo and next query parameters.
    const requested =
      searchParams.get("redirectTo") || searchParams.get("next");

    if (
      requested &&
      requested.startsWith("/") &&
      !requested.startsWith("//") &&
      !requested.startsWith("/api") &&
      requested !== "/login"
    ) {
      return requested;
    }

    // Use the API redirect only when it is a safe internal path.
    if (
      data.redirectTo &&
      data.redirectTo.startsWith("/") &&
      !data.redirectTo.startsWith("//") &&
      !data.redirectTo.startsWith("/api") &&
      data.redirectTo !== "/login" &&
      data.redirectTo !== "/admin"
    ) {
      return data.redirectTo;
    }

    return "/account";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isLogin) {
      if (cleanName.length < 2) {
        setError("Please enter your full name.");
        return;
      }

      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Your passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin
        ? "/api/auth/login"
        : "/api/auth/register";

      const payload = isLogin
        ? {
            email: cleanEmail,
            password,
          }
        : {
            name: cleanName,
            email: cleanEmail,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Authentication failed. Please try again.");
        return;
      }

      setSuccess(
        isLogin
          ? "Welcome back! Your bag is being restored."
          : "Your account has been created successfully."
      );

      // Notify CartContext that the authentication cookie is now set.
      window.dispatchEvent(new Event("henrys-auth-changed"));

      // Allow CartContext to restore the user's saved and guest cart.
      await new Promise((resolve) => setTimeout(resolve, 250));

      router.replace(getSafeRedirect(data));
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f6ef]">
      <div className="relative isolate min-h-[calc(100vh-80px)] px-4 py-8 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-8">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#c7dcb1]/50 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-[450px] w-[450px] rounded-full bg-[#dce9ce]/70 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-[1120px]">
          <div className="overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_25px_80px_rgba(34,65,43,0.13)]">
            <div className="grid min-h-[590px] lg:grid-cols-2">
              {/* Left promotional panel */}
              <section className="relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#c8ddb4] via-[#e3edda] to-[#a7c88d] p-8 sm:p-12 lg:min-h-[590px] lg:p-14">
                <div className="absolute -right-20 top-20 h-64 w-64 rounded-full border border-white/50" />
                <div className="absolute -right-10 top-32 h-48 w-48 rounded-full border border-white/50" />
                <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#71985e]/20 blur-2xl" />

                <div className="relative z-10">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold tracking-[0.12em] text-[#244633]">
                    <Leaf size={16} />
                    {isLogin ? "WELCOME BACK" : "CREATE ACCOUNT"}
                  </span>

                  <h1 className="mt-7 max-w-md font-serif text-4xl font-bold leading-[1.12] tracking-tight text-[#173b2b] sm:text-5xl lg:text-[54px]">
                    {isLogin ? (
                      <>
                        Your
                        <br />
                        Skincare
                        <br />
                        Journey
                        <br />
                        Continues
                      </>
                    ) : (
                      <>
                        Start
                        <br />
                        Your
                        <br />
                        Skincare
                        <br />
                        Journey
                      </>
                    )}
                  </h1>

                  <p className="mt-6 max-w-sm text-sm leading-7 text-[#234333] sm:text-base">
                    {isLogin
                      ? "Log in to access your orders, saved products and personalized recommendations."
                      : "Join Henry's Skincare for a personalized shopping experience and discover your everyday essentials."}
                  </p>
                </div>

                <div className="relative z-10 mt-8 grid max-w-[370px] grid-cols-3 gap-3">
                  {[
                    {
                      icon: Package,
                      label: "Track Orders",
                    },
                    {
                      icon: Heart,
                      label: isLogin ? "Your Favorites" : "Exclusive Deals",
                    },
                    {
                      icon: Sparkles,
                      label: isLogin ? "Personalized Picks" : "Personalized Care",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="flex min-h-[94px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/60 bg-white/45 p-3 text-center backdrop-blur-sm"
                      >
                        <Icon size={25} className="text-[#24583c]" />
                        <span className="text-[11px] font-semibold text-[#173b2b]">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Leaf
                  size={180}
                  strokeWidth={0.7}
                  className="pointer-events-none absolute -bottom-8 -right-10 rotate-[-35deg] text-white/30"
                />
              </section>

              {/* Right authentication panel */}
              <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-12 lg:px-14">
                <div className="w-full max-w-[440px]">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dcf5eb] text-[#087047]">
                      {isLogin ? (
                        <UserRound size={34} strokeWidth={1.8} />
                      ) : (
                        <UserRoundPlus size={34} strokeWidth={1.8} />
                      )}
                    </div>

                    <h2 className="mt-5 font-serif text-3xl font-bold tracking-tight text-[#173b2b] sm:text-[36px]">
                      {isLogin
                        ? "Sign in to your account"
                        : "Create your account"}
                    </h2>

                    <p className="mt-2 text-sm text-[#64766e]">
                      {isLogin
                        ? "Welcome back to Henry's Skincare"
                        : "Sign up to get started with Henry's Skincare"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    {!isLogin && (
                      <div className="relative">
                        <UserRound
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61766d]"
                        />
                        <input
                          type="text"
                          autoComplete="name"
                          placeholder="Full name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          required
                          minLength={2}
                          maxLength={80}
                          className="h-[52px] w-full rounded-2xl border border-[#e0e7e2] bg-white pl-12 pr-4 text-sm text-[#263e33] outline-none transition placeholder:text-[#84928b] focus:border-[#23805b] focus:ring-4 focus:ring-[#23805b]/10"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61766d]"
                      />
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        className="h-[52px] w-full rounded-2xl border border-[#e0e7e2] bg-white pl-12 pr-4 text-sm text-[#263e33] outline-none transition placeholder:text-[#84928b] focus:border-[#23805b] focus:ring-4 focus:ring-[#23805b]/10"
                      />
                    </div>

                    <div className="relative">
                      <LockKeyhole
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61766d]"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          isLogin ? "current-password" : "new-password"
                        }
                        placeholder={
                          isLogin ? "Enter your password" : "Create password"
                        }
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={isLogin ? undefined : 8}
                        className="h-[52px] w-full rounded-2xl border border-[#e0e7e2] bg-white pl-12 pr-12 text-sm text-[#263e33] outline-none transition placeholder:text-[#84928b] focus:border-[#23805b] focus:ring-4 focus:ring-[#23805b]/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#61766d] hover:text-[#087047]"
                      >
                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>

                    {!isLogin && (
                      <div className="relative">
                        <LockKeyhole
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61766d]"
                        />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          required
                          className="h-[52px] w-full rounded-2xl border border-[#e0e7e2] bg-white pl-12 pr-12 text-sm text-[#263e33] outline-none transition placeholder:text-[#84928b] focus:border-[#23805b] focus:ring-4 focus:ring-[#23805b]/10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((value) => !value)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#61766d] hover:text-[#087047]"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}
                        </button>
                      </div>
                    )}

                    {isLogin && (
                      <div className="flex items-center justify-between gap-3 py-1">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#52675d]">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(event) =>
                              setRememberMe(event.target.checked)
                            }
                            className="h-4 w-4 accent-[#087047]"
                          />
                          Remember me
                        </label>

                        <Link
                          href="/forgot-password"
                          className="text-sm font-semibold text-[#087047] transition hover:text-[#064e32]"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    )}

                    {error && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        {error}
                      </div>
                    )}

                    {success && (
                      <div
                        role="status"
                        className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                      >
                        <CheckCircle2 size={17} />
                        {success}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-[54px] w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#08613b] to-[#087a48] text-sm font-bold text-white shadow-lg shadow-[#087047]/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={19} className="animate-spin" />
                          Please wait...
                        </>
                      ) : (
                        <>
                          {isLogin ? "Sign In" : "Sign Up"}
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#e5eae6]" />
                    <span className="text-xs font-medium text-[#87938d]">
                      Secure account access
                    </span>
                    <div className="h-px flex-1 bg-[#e5eae6]" />
                  </div>

                  <p className="mt-6 text-center text-sm text-[#64766e]">
                    {isLogin
                      ? "Don't have an account?"
                      : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        switchMode(isLogin ? "register" : "login")
                      }
                      className="font-bold text-[#087047] hover:text-[#064e32]"
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>

                  <p className="mt-6 text-center text-xs leading-5 text-[#89958e]">
                    By continuing, you agree to Henry's Store terms and
                    privacy policy.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Service benefits */}
          <div className="mt-7 grid grid-cols-2 gap-4 rounded-2xl border border-white/80 bg-white/75 px-5 py-5 shadow-sm sm:grid-cols-4 sm:px-8">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                subtitle: "On orders above ₹699",
              },
              {
                icon: ShieldCheck,
                title: "100% Authentic",
                subtitle: "Genuine skincare products",
              },
              {
                icon: RefreshCw,
                title: "Easy Returns",
                subtitle: "7-day hassle free returns",
              },
              {
                icon: Leaf,
                title: "Dermatologist Inspired",
                subtitle: "Care you can trust",
              },
            ].map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="flex items-center gap-3"
                >
                  <Icon
                    size={27}
                    strokeWidth={1.7}
                    className="shrink-0 text-[#17643f]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#263e33] sm:text-sm">
                      {benefit.title}
                    </p>
                    <p className="mt-1 text-[10px] text-[#75847b] sm:text-xs">
                      {benefit.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f4f6ef]" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}