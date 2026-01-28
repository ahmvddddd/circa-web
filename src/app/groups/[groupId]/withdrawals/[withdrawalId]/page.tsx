// src/app/groups/[groupId]/withdrawals/[withdrawalId]/page.tsx

import AppShell from "@/components/layout/AppShell";
import { withdrawals,  } from "@/lib/withdrawals";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";

type PageProps = {
  params: Promise<{
    groupId: string;
    withdrawalId: string;
  }>;
};

export default async function WithdrawalDetailsPage({ params }: PageProps) {
  // 🔐 Require authenticated user
  const user = await requireAuth();

  const { groupId, withdrawalId } = await params;

  const withdrawal = withdrawals.find(
    (w) => w.id === withdrawalId && w.groupId === groupId
  );

  if (!withdrawal) return notFound();

  const isRequester = user.id === withdrawal.requestedBy;
  const isPending = withdrawal.status === "pending";

  const showActions = !isRequester && isPending;

  return (
    <AppShell
      title="Withdrawal Details"
      subtitle={`Withdrawal #${withdrawal.id}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          {/* Amount and Status */}
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="flex flex-col md:flex-row justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-lg font-bold text-foreground">
                  ₦{withdrawal.amount.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-5 px-2 rounded-full text-[11px] flex items-center bg-muted text-foreground">
                  {withdrawal.status}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {withdrawal.approvals.current}/{withdrawal.approvals.total} approvals
                </span>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href={`/groups/${groupId}/withdrawals/${withdrawal.id}/approve`}
                >
                  <button
                    className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    Approve
                  </button>
                </Link>

                <button
                  className="h-8 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold"
                >
                  Reject
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="rounded-lg border border-border bg-surface p-3">
            <h3 className="mb-3 text-xs font-semibold text-foreground">
              Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <p className="text-muted-foreground">Withdrawal ID</p>
                <p className="font-medium">#{withdrawal.id}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Group</p>
                <p className="font-medium">
                  {withdrawal.groupName} (#{withdrawal.groupId})
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Beneficiary</p>
                <p className="font-medium">{withdrawal.beneficiary}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Reason</p>
                <p className="font-medium">{withdrawal.title}</p>
              </div>
            </div>
          </div>

          {/* Approval History */}
          <div className="rounded-lg border border-border bg-surface p-3">
            <h3 className="mb-3 text-xs font-semibold text-foreground">
              Approval History
            </h3>

            <ul className="space-y-2 text-[11px]">
              {withdrawal.approvals.history.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span
                    className={
                      item.status === "approved"
                        ? "text-green-600"
                        : item.status === "rejected"
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Requestor */}
          <div className="rounded-lg border border-border bg-surface p-3">
            <h3 className="mb-2 text-xs font-semibold text-foreground">
              Requestor
            </h3>
            <p className="text-xs font-medium">{withdrawal.requestedBy}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
