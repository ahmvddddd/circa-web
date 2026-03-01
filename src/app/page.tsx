// src/app/page.tsx

import Link from "next/link";
import AuthShell from "@/components/layout/AuthShell";

export default function LandingPage() {
  return (
    <AuthShell>
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-3xl space-y-10">
          {/* Brand + Hero */}
          <header className="space-y-4 text-center">
            <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-[11px] text-gray-600">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
              Simple, transparent community wallet
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Circa helps you manage group money without spreadsheets or drama
            </h1>

            <p className="text-sm sm:text-[15px] text-gray-600 max-w-2xl mx-auto">
              Create or manage contribution groups, approve withdrawals, and keep
              every member in the loop. Contributors can track deposits without
              needing an account.
            </p>
          </header>

          {/* Primary Actions */}
          <section className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              Sign in / manage my groups
            </Link>

            <Link
              href="/deposit/tracking"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-gray-800 hover:bg-muted w-full sm:w-auto"
            >
              Track my deposit
            </Link>
          </section>

          {/* Feature Highlights */}
          <section className="grid gap-4 sm:grid-cols-3 text-left">
            <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700">
                For organisers
              </p>
              <p className="text-xs text-gray-600">
                Create groups, track who has paid in, and manage withdrawals with
                clear approval rules.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700">
                For members
              </p>
              <p className="text-xs text-gray-600">
                Use your payment reference or token to confirm deposits without
                creating an account.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700">
                For treasurers
              </p>
              <p className="text-xs text-gray-600">
                Approve withdrawals, see audit trails, and keep group funds safe
                with shared visibility.
              </p>
            </div>
          </section>

          {/* Helper text */}
          <section className="text-center text-[11px] text-gray-500 space-y-1">
            <p>
              Just sent money and want to check it was received? Use{" "}
              <Link
                href="/deposit/tracking"
                className="font-semibold text-primary hover:underline"
              >
                Track my deposit
              </Link>
              .
            </p>
            <p>
              Want to start a new contribution circle?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Create an organiser account
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </AuthShell>
  );
}