// src/app/groups/[groupId]/withdrawals/[withdrawalId]/approve/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { withdrawals } from "@/lib/withdrawals";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));

export default function ApproveWithdrawalPage() {
  const params = useParams();
  const router = useRouter();

  const { groupId, withdrawalId } = params as {
    groupId: string;
    withdrawalId: string;
  };

  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const withdrawal = withdrawals.find(
    (w) => w.id === withdrawalId && w.groupId === groupId
  );

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(action);

    // simulate request
    setTimeout(() => {
      setLoading(null);
      router.push(`/groups/${groupId}/withdrawals`);
    }, 1200);
  };

  if (!withdrawal) {
    return (
      <AppShell title="Approve Withdrawal">
        <p className="text-sm text-gray-500">
          Withdrawal not found.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Approve Withdrawal"
      subtitle="Admin confirmation required"
    >
      {/* Withdrawal Summary */}
      <section className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C26] p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Withdrawal Details
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Reference</span>
            <span className="font-medium text-gray-900 dark:text-white">
              WDR-{withdrawal.id}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Requested by</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {withdrawal.requestedBy}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-red-600">
              {formatCurrency(withdrawal.amount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Beneficiary</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {withdrawal.beneficiary}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Requested on</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(withdrawal.requestedAt)}
            </span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="mt-6 flex gap-3">
        <button
          disabled={loading !== null}
          onClick={() => handleAction("reject")}
          className="flex-1 h-11 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50"
        >
          {loading === "reject" ? "Rejecting..." : "Reject Withdrawal"}
        </button>

        <button
          disabled={loading !== null}
          onClick={() => handleAction("approve")}
          className="flex-1 h-11 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading === "approve" ? "Approving..." : "Approve Withdrawal"}
        </button>
      </section>

      {/* Warning */}
      <section className="mt-6 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 p-4">
        <p className="text-[10px] text-yellow-700 dark:text-yellow-400">
          ⚠️ This action is irreversible once confirmed. Please verify the
          withdrawal details before proceeding.
        </p>
      </section>
    </AppShell>
  );
}
