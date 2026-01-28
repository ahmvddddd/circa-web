// src/app/groups/[groupId]/withdrawals/request/page.tsx
"use client";

import AppShell from "@/components/layout/AppShell";
import { banks } from "@/lib/banks";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Info, Send, Wallet, User } from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

const AVAILABLE_BALANCE = 12_450;

export default function RequestWithdrawalPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  return (
    <AppShell
      title="Request Withdrawal"
      subtitle="Submit a withdrawal request for admin approval"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT FORM */}
        <div className="lg:col-span-8 flex flex-col gap-4 order-2 lg:order-1">
          {/* Amount */}
          <section className="rounded-xl border border-border bg-muted p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-text-main-light dark:text-text-main-dark mb-4">
              <Wallet size={16} className="text-primary" />
              Withdrawal Amount
            </h3>

            <label className="flex flex-col gap-2">
              <span className="text-[10px]">
                Amount to withdraw
              </span>

              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                min={100}
                max={AVAILABLE_BALANCE}
                required
                className="h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <p className="text-[10px]">
                Daily limit: {formatCurrency(5_000_000)}
              </p>
            </label>
          </section>

          {/* Beneficiary */}
          <section className="rounded-xl border border-border bg-muted p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-text-main-light dark:text-text-main-dark mb-4">
              <User size={16} className="text-primary" />
              Beneficiary Details
            </h3>

            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-[10px]">
                  Beneficiary Name
                </span>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  required
                  className="h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-[10px]">
                    Bank Name
                  </span>

                  <select
                    defaultValue=""
                    required
                    className="h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-muted px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>
                      Select bank
                    </option>

                    {banks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[10px]">
                    Account Number
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="0123456789"
                    required
                    className="h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-[10px]">
                    10 digits
                  </span>
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[10px]">
                  Reason for Withdrawal
                </span>
                <textarea
                  placeholder="Briefly describe the purpose of this withdrawal..."
                  rows={4}
                  required
                  className="rounded-lg border border-gray-200 dark:border-white/10 bg-transparent px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/groups/${groupId}`}
              className="px-5 py-3 rounded-lg text-xs font-bold bg-white/5 text-text-sub-light dark:text-text-sub-dark hover:bg-gray-200 dark:hover:bg-white/20 transition"
            >
              Cancel
            </Link>

            <Link
            href={`/groups/${groupId}/withdrawals/request/success`}
            >
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition">
              Submit Request
              <Send size={14} />
            </button>
            </Link>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 flex flex-col gap-4 order-1 lg:order-2">
          <div className="rounded-xl border border-border bg-muted p-6">
            <p className="text-[10px]">
              Available Balance
            </p>
            <p className="text-xl">
              {formatCurrency(AVAILABLE_BALANCE)}
            </p>

            <div className="h-px bg-border-light dark:bg-border-dark my-4" />
          </div>

          <div className="rounded-xl border border-border bg-muted p-6">
            <h4 className="flex items-center gap-2 text-[xs font-bold mb-2 text-text-main-light dark:text-white]">
              <Info size={16} className="text-primary" />
              Important Note
            </h4>
            <p className="text-[10px]">
              Withdrawals are processed within 24 hours on business days. Ensure
              all beneficiary details are correct to avoid delays.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
