//src/app/ledgers/page.tsx

"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import { ledgers } from "@/lib/ledgers";
import clsx from "clsx";
import Link from "next/link";

type FilterType = "ALL" | "CREDIT" | "DEBIT";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    signDisplay: "always",
  }).format(amount);

export default function GlobalLedgersPage() {
  const [filter, setFilter] = useState<FilterType>("ALL");

  const filteredLedgers = useMemo(() => {
    if (filter === "ALL") return ledgers;
    return ledgers.filter((l) => l.type === filter);
  }, [filter]);

  return (
    <AppShell
      title="Global Ledgers"
      subtitle="Track all credits and debits across all groups"
    >
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      {/* Status Filter */}
      <div className="mb-4 flex items-center gap-2">
        {(["ALL", "CREDIT", "DEBIT"] as FilterType[]).map((item) => {
          const isActive = filter === item;

          return (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={clsx(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-opacity",
                isActive
                  ? "bg-primary text-primary-foreground hover:opacity-80"
                  : "bg-muted text-muted-foreground hover:opacity-70"
              )}
            >
              {item.charAt(0) + item.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Ledger List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredLedgers.map((ledger) => {
          const isCredit = ledger.type === "CREDIT";
          const signedAmount = isCredit
            ? +ledger.amount
            : -ledger.amount;

          return (
            <Link
              key={ledger.id}
              href={`/ledgers/${ledger.id}`}
              className="block rounded-lg border border-border bg-surface p-3 sm:p-4 transition-colors hover:bg-muted">
              <div
                className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                {/* Transaction / Group */}
                <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Transaction ID
                  </div>
                  <div className="text-xs font-medium">#{ledger.id}</div>

                  <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Group
                  </div>

                  <span
                    className="inline-flex w-fit rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground"
                  >
                    {ledger.groupName}
                  </span>
                </div>

                {/* Type / Source */}
                <div className="space-y-1.5 lg:col-span-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </div>

                  <span
                    className={clsx(
                      "inline-flex w-fit items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      isCredit
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    )}
                  >
                    {ledger.type}
                  </span>

                  <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Source
                  </div>
                  <div
                    className="text-xs font-medium truncate"
                    title={ledger.source}
                  >
                    {ledger.source}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1.5 text-left sm:text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </div>
                  <div
                    className={clsx(
                      "text-sm font-extrabold",
                      isCredit ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {formatCurrency(signedAmount)}
                  </div>
                </div>

                {/* Reference / Date */}
                <div className="space-y-1.5 md:col-span-2 lg:col-span-2 text-left lg:text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Reference
                  </div>
                  <div
                    className="font-mono text-xs truncate"
                    title={ledger.reference}
                  >
                    {ledger.reference}
                  </div>

                  <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </div>
                  <div className="text-xs">{ledger.date}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
        {/* Pagination */}
        <div className="mt-auto mt-6 flex items-center justify-center gap-1">
          {[1, 2, 3, "...", 8, 9, 10].map((page, i) => (
            <button
              key={i}
              className="size-7 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
