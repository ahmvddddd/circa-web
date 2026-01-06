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
<div className="mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
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
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-opacity
          ${
            isActive
              ? "bg-primary text-primary-foreground hover:opacity-80"
              : "bg-muted text-muted-foreground hover:opacity-70"
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
            <p className="py-6 text-center text-xs text-muted-foreground">
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
