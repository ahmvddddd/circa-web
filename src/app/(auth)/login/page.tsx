// src/app/(auth)/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import AuthShell from "@/components/layout/AuthShell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

type PageError = "INVALID_CREDENTIALS" | "FAILED" | null;

export default function LoginPage() {
  const router = useRouter();
  const { login, initializeAuth, isInitialized } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<PageError>(null);

  // Ensure authentication bootstrap completes if arriving directly on login page
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Delegate authentication, token storage, and profile fetch to useAuth()
      await login({ email, password });
      router.push("/groups");
    } catch (err: any) {
      if (err?.status === 401 || err?.statusCode === 401) {
        setError("INVALID_CREDENTIALS");
      } else {
        setError("FAILED");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-[420px]">
          {/* Header */}
          <header className="flex flex-col items-center pb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">Circa</h2>
            </div>
          </header>

          {/* Card */}
          <section className="rounded-xl border border-border bg-muted p-8 space-y-8">
            <div className="text-center">
              <h1 className="text-xl font-bold leading-tight">Welcome Back</h1>
              <p className="text-sm text-gray-500">
                Log in to manage your group transactions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <Link
                    href="#"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error === "INVALID_CREDENTIALS" && (
                <p className="text-xs text-red-500">
                  Invalid email or password.
                </p>
              )}

              {error === "FAILED" && (
                <p className="text-xs text-red-500">
                  Login failed. Please try again later.
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>
          </section>

          {/* Footer */}
          <p className="pt-6 text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}