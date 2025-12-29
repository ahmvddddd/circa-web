//src/app/withdrawals/[withdrawalId]/page.tsx
import AppShell from "@/components/layout/AppShell";
import { withdrawals } from "@/lib/withdrawals";
import { notFound } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";


type PageProps = {
  params: { withdrawalId: string };
};

export default async function WithdrawalDetailsPage({ params }: PageProps) {
  const { withdrawalId } = await params;
  
    const withdrawal = withdrawals.find(
      (w) => w.id === withdrawalId
    );
  
    if (!withdrawal) return notFound();

  return (
    <AppShell
      title="Withdrawal Details"
      subtitle={`Withdrawal #${withdrawal.id}`}
    >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount + Status */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-bold text-foreground">
                  ₦{withdrawal.amount.toLocaleString()}
                </p>
              </div>

              <span className="h-7 w-20 px-3 rounded-full text-xs flex items-center bg-muted text-foreground">
                {withdrawal.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                Approve
              </button>
              <button className="h-10 px-4 rounded-lg bg-muted text-foreground text-sm font-semibold">
                Reject
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-semibold text-foreground mb-4">Details</h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
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
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Approval History
            </h3>

            <ul className="space-y-4 text-xs">
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
        <div className="space-y-6">
          {/* Requestor */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-semibold text-foreground mb-4">Requestor</h3>
            <p className="font-medium">Sarah Miller</p>
            <p className="text-xs text-muted-foreground">
              Finance Department
            </p>
          </div>

          {/* Important Dates */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Important Dates
            </h3>

            <ul className="space-y-3 text-xs">
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
