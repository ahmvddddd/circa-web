// src/app/groups/[groupId]/withdrawals/[withdrawalId]/page.tsx
import AppShell from "@/components/layout/AppShell";
import { withdrawals } from "@/lib/withdrawals";
import { notFound } from "next/navigation";

type PageProps = {
  params: { withdrawalId: string };
};

export default async function WithdrawalDetailsPage({ params }: PageProps) {
  const { withdrawalId } = await params;

  const withdrawal = withdrawals.find((w) => w.id === withdrawalId);

  if (!withdrawal) return notFound();

  return (
    <AppShell
      title="Withdrawal Details"
      subtitle={`Withdrawal #${withdrawal.id}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          {/* Amount + Status */}
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

            <div className="flex flex-wrap gap-2 mt-4">
              <button className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
                Approve
              </button>
              <button className="h-8 px-3 rounded-md bg-muted text-foreground text-xs font-semibold">
                Reject
              </button>
            </div>
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
                <p className="text-muted-foreground">Group ID</p>
                <p className="font-medium">#G-789101</p>
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
              <li className="flex justify-between">
                <span className="font-medium">Emily Davis</span>
                <span className="text-green-600">Approved</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">John Smith</span>
                <span className="text-green-600">Approved</span>
              </li>
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
            <p className="text-xs font-medium">Sarah Miller</p>
            <p className="text-[11px] text-muted-foreground">
              Finance Department
            </p>
          </div>

          {/* Important Dates */}
          <div className="rounded-lg border border-border bg-surface p-3">
            <h3 className="mb-2 text-xs font-semibold text-foreground">
              Important Dates
            </h3>

            <ul className="space-y-2 text-[11px]">
              <li>
                <p className="font-medium">Created</p>
                <p className="text-muted-foreground">
                  June 24, 2024 · 9:30 AM
                </p>
              </li>
              <li>
                <p className="font-medium">Expires</p>
                <p className="text-muted-foreground">
                  July 1, 2024 · 9:30 AM
                </p>
              </li>
              <li>
                <p className="font-medium text-muted-foreground">
                  Executed
                </p>
                <p className="text-muted-foreground">
                  Not yet executed
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
