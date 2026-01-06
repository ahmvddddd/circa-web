//src/app/withdrawals/page.tsx
"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import WithdrawalCard from "@/components/withdrawals/WithdrawalCard";
import { withdrawals } from "@/lib/withdrawals";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "DECLINED" | "PAID";

export default function WithdrawalsPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const filteredWithdrawals =
    status === "ALL"
      ? withdrawals
      : withdrawals.filter(
          (w) => w.status.toUpperCase() === status
        );

  return (
    <AppShell
      title="Withdrawals"
      subtitle="Manage withdrawals across your groups"
    >
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          {(["ALL", "PENDING", "APPROVED", "DECLINED", "PAID"] as StatusFilter[]).map(
            (item) => {
              const isActive = status === item;

              return (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  className={`
                    rounded-full px-4 py-1.5
                    text-sm font-semibold
                    transition-opacity
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground hover:opacity-80"
                        : "bg-muted text-muted-foreground hover:opacity-70"
                    }
                  `}
                >
                  {item}
                </button>
              );
            }
          )}
        </div>

        {/* Withdrawal List */}
        <div className="flex flex-col gap-3">
          {filteredWithdrawals.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No withdrawals found for this filter.
            </p>
          )}

          {filteredWithdrawals.map((withdrawal) => (
            <WithdrawalCard
              key={withdrawal.id}
              withdrawal={withdrawal}
              href={`/withdrawals/${withdrawal.id}`}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-auto flex items-center justify-center gap-1 mt-8">
          {[1, 2, 3, "...", 8, 9, 10].map((page, i) => (
            <button
              key={i}
              className="size-10 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
