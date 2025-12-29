// src/app/groups/[groupId]/withdrawals/page.tsx
"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import WithdrawalCard from "@/components/withdrawals/WithdrawalCard";
import { withdrawals } from "@/lib/withdrawals";
import { groups } from "@/lib/groups";

export default function GroupWithdrawalsPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const groupId = params.groupId as string;
  const status = searchParams.get("status");

  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <AppShell title="Group Not Found" subtitle="">
        <p className="text-red-500">No group found for ID: {groupId}</p>
      </AppShell>
    );
  }

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesGroup = w.groupId === groupId;
    const matchesStatus = status ? w.status === status : true;
    return matchesGroup && matchesStatus;
  });

  const subtitle = status
    ? `${status
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase())} withdrawals`
    : "All withdrawals";


  const filters: Array<[string | null, string]> = [
    [null, "All"],
    ["approval_required", "Approval Required"],
    ["pending", "Pending"],
    ["approved", "Approved"],
    ["paid", "Paid"],
    ["declined", "Declined"],
  ];

  return (
    <AppShell
      title={`${group.title} Withdrawals`}
      subtitle={subtitle}
    >
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-y border-border py-4">
          {filters.map(([key, label]) => {
            const isActive = key === status || (!key && !status);

            return (
              <Link
                key={key ?? "all"}
                href={
                  key
                    ? `/groups/${groupId}/withdrawals?status=${key}`
                    : `/groups/${groupId}/withdrawals`
                }
                className={`
                  h-8 px-4 rounded-lg inline-flex items-center justify-center
                  text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }
                `}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Withdrawals List */}
        <div className="flex flex-col gap-2">
          {filteredWithdrawals.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No withdrawals found for this filter.
            </p>
          )}

          {filteredWithdrawals.map((withdrawal) => (
            <Link
              key={withdrawal.id}
              href={`/groups/${groupId}/withdrawals/${withdrawal.id}`}
              className="block"
            >
              <WithdrawalCard withdrawal={withdrawal} />
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-auto mt-8 flex items-center justify-center gap-1">
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
