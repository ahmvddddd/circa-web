// src/app/groups/[groupId]/withdrawals/request/success/page.tsx
"use client";

import AppShell from "@/components/layout/AppShell";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Wallet, User, Building2, Hash, Info } from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

// Static data
const withdrawalId = "w001";
const withdrawalData = {
  amount: 5000,
  beneficiary: "Jane Doe",
  bank: "Access Bank",
  accountNumber: "0123456789",
  status: "Approval Required",
};

const maskAccountNumber = (a: string) =>
  a.length >= 4 ? `${a.slice(0,2)}******${a.slice(-2)}` : "******";

export default function WithdrawalRequestSuccessPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  return (
    <AppShell
      title="Withdrawal Submitted"
      subtitle="Your withdrawal request has been sent for review"
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* SUCCESS CARD */}
        <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 text-center">
          <CheckCircle size={40} className="mx-auto text-primary mb-3" />

          <h2 className="text-lg font-black text-text-main-light dark:text-white">
            Withdrawal request submitted
          </h2>

          <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-2">
            Your request has been successfully submitted and is awaiting admin
            approval.
          </p>
        </div>

        {/* SUMMARY */}
        <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
          <h3 className="text-xs font-bold text-text-main-light dark:text-white mb-4">
            Request Summary
          </h3>

          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-text-sub-light dark:text-text-sub-dark">
                <Wallet size={14} />
                Amount
              </span>
              <span className="font-bold text-text-main-light dark:text-white">
                {formatCurrency(withdrawalData.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-text-sub-light dark:text-text-sub-dark">
                <User size={14} />
                Beneficiary
              </span>
              <span className="font-medium text-text-main-light dark:text-white">
                {withdrawalData.beneficiary}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-text-sub-light dark:text-text-sub-dark">
                <Building2 size={14} />
                Bank
              </span>
              <span className="font-medium text-text-main-light dark:text-white">
                {withdrawalData.bank}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-text-sub-light dark:text-text-sub-dark">
                <Hash size={14} />
                Account Number
              </span>
              <span className="font-mono text-text-main-light dark:text-white">
                {maskAccountNumber(withdrawalData.accountNumber)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-text-sub-light dark:text-text-sub-dark">
                <Info size={14} />
                Status
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
                {withdrawalData.status}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Link
            href={`/groups/${groupId}/withdrawals/${withdrawalId}`}
            className="px-6 py-3 rounded-lg bg-primary text-white text-xs font-bold text-center hover:bg-primary/90 transition"
          >
            View this request
          </Link>

          <Link
            href={`/groups/${groupId}/withdrawals?status=approval_required`}
            className="px-6 py-3 rounded-lg border border-border-light dark:border-border-dark text-xs font-bold text-text-main-light dark:text-white text-center hover:bg-muted transition"
          >
            Back to withdrawals
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
