//src/app/ledgers/[ledgerId]/page.tsx

"use client";
import AppShell from "@/components/layout/AppShell";
import { ledgers } from "@/lib/ledgers";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

export default function LedgerDetailsPage() {
  const params = useParams();
  const ledgerId = params.ledgerId as string;

  const ledger = ledgers.find((l) => l.id === ledgerId);
  if (!ledger) notFound();

  const isCredit = ledger.type === "CREDIT";

  return (
    <AppShell
      title="Ledger Details"
      subtitle={`Transaction ${ledger.id}`}
    >
      {/* Main Card */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {/* Top Card */}
        <div className="border-b border-border bg-muted/40 px-4 py-4 space-y-3">
          {/* Amount */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Amount
            </p>
            <span
              className={clsx(
                "text-3xl font-extrabold",
                isCredit ? "text-green-500" : "text-red-500"
              )}
            >
              {isCredit ? "+" : "-"}
              {formatCurrency(ledger.amount)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type Badge */}
            <span
              className={clsx(
                "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                isCredit
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {ledger.type}
            </span>

            {/* Status */}
            {ledger.status && (
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                {ledger.status}
              </span>
            )}

            {/* Date */}
            <span className="text-xs text-muted-foreground">
              {ledger.date}
            </span>
          </div>
        </div>

        {/* Details Card */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              {/* Transaction ID */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Transaction ID
                </p>
                <p className="font-mono text-sm">#{ledger.id}</p>
              </div>

          {/* Group */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Group
            </p>
            <Link href={`/groups/${ledger.group}/ledger`}>
              <span className="inline-flex cursor-pointer rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                {ledger.groupName}
              </span>
            </Link>
          </div>


              {/* Account */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </p>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                  {ledger.account}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Source */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Source
                </p>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                  {ledger.source}
                </div>
              </div>

              {/* Reference */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Reference
                </p>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="font-mono text-xs break-all">
                    {ledger.reference}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground flex justify-between">
          <span>Secure ledger record</span>
          <span className="font-mono">ID: {ledger.id}</span>
        </div>
      </div>
    </AppShell>
  );
}
