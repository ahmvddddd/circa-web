//src/app/groups/[groupId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { groups } from "@/lib/groups";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import Link from "next/link";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

const recentActivity = [
  { id: 1, type: "credit", amount: 50000, reference: "DEP-10294", date: "Dec 20, 2025" },
  { id: 2, type: "debit", amount: 12500, reference: "WDR-88321", date: "Dec 19, 2025" },
  { id: 3, type: "credit", amount: 30000, reference: "DEP-10280", date: "Dec 18, 2025" },
  { id: 4, type: "debit", amount: 8000, reference: "WDR-88210", date: "Dec 17, 2025" },
  { id: 5, type: "credit", amount: 75000, reference: "DEP-10210", date: "Dec 16, 2025" },
];

/* ---------------- CTA Buttons ---------------- */
const GroupActions = ({ groupId }: { groupId: string }) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <Link href={`/groups/${groupId}/withdrawals/request`}>
    <button
      className="flex items-center justify-center h-9 w-9 sm:w-auto sm:px-4 rounded-lg bg-gray-300 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-[10px] font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition"
      aria-label="Request Withdrawal"
    >
      <ArrowUpRight className="sm:hidden" size={12} strokeWidth={2} />
      <span className="hidden sm:inline">Request Withdrawal</span>
    </button>
    </Link>

    <Link href={`/groups/${groupId}/deposit`}>
    <button
      className="flex items-center justify-center h-9 w-9 sm:w-auto sm:px-4 rounded-lg bg-primary text-white text-[10px] font-bold hover:bg-primary/90 transition"
      aria-label="Make Deposit"
    >
      <ArrowDownLeft className="sm:hidden" size={12} strokeWidth={2} />
      <span className="hidden sm:inline">Make Deposit</span>
    </button>
    </Link>
  </div>
);

/* ---------------- Stat Card ---------------- */
const StatCard = ({
  label,
  value,
  subLabel,
}: {
  label: string;
  value: string | number;
  subLabel?: string;
}) => (
  <div className="flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C26] p-6">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    {subLabel && <p className="text-[10px] text-gray-400">{subLabel}</p>}
  </div>
);

/* ---------------- Status Card ---------------- */
const StatusCard = ({
  label,
  value,
  icon,
  bg,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  bg: string;
  color: string;
}) => (
  <div
  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C26] p-2 sm:p-4 w-full cursor-pointer transition group-hover:bg-muted group-hover:border-primary group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-primary"
>

    <div className={`flex size-10 items-center justify-center rounded-lg ${bg} ${color}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
    </div>

    <div className="flex-1">
      <p className="text-[10px] font-medium text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800 dark:text-white">{value}</p>
    </div>

    <ChevronRight
      className="hidden sm:block text-gray-400 group-hover:text-primary transition"
      size={12}
    />
  </div>
);

/* ---------------- Page ---------------- */
export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <AppShell title="Group Not Found" subtitle="">
        <p className="text-red-500 text-xs">No group found for ID: {groupId}</p>
      </AppShell>
    );
  }

  return (
    <AppShell 
    title={group.title} 
    subtitle="Group Summary" 
    cta={<GroupActions groupId={groupId} />}>
      <section className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-6 w-full">
        <div className="col-span-2">
          <StatCard
            label="Balance"
            value={formatCurrency(1_234_560)}
            subLabel="Updated today, 10:42"
          />
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-2">
          <StatCard label="Withdrawals (count)" value={12} />
          <StatCard label="Deposits (count)" value={34} />
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Transaction Status
        </h3>

        <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={`/groups/${groupId}/withdrawals`} className="block group transition sm:hover:scale-[1.01] active:scale-[0.99] focus:outline-none">
            <StatusCard label="All Withdrawals" value={2} icon="list_alt" bg="bg-orange-100 dark:bg-orange-500/20" color="text-orange-600 dark:text-orange-400" />
          </Link>

          <Link href={`/groups/${groupId}/withdrawals?status=pending`} className="block group transition sm:hover:scale-[1.01] active:scale-[0.99] focus:outline-none">
            <StatusCard label="Pending Withdrawals" value={5} icon="hourglass_top" bg="bg-yellow-100 dark:bg-yellow-500/20" color="text-yellow-600 dark:text-yellow-400" />
          </Link>

          <Link href={`/groups/${groupId}/withdrawals?status=approved`} className="block group transition sm:hover:scale-[1.01] active:scale-[0.99] focus:outline-none">
            <StatusCard label="Approved Unpaid" value={3} icon="approval_delegation" bg="bg-blue-100 dark:bg-blue-500/20" color="text-blue-600 dark:text-blue-400" />
          </Link>

          <Link href={`/groups/${groupId}/withdrawals?status=paid`} className="block group transition sm:hover:scale-[1.01] active:scale-[0.99] focus:outline-none">
            <StatusCard label="Paid Items" value={29} icon="task_alt" bg="bg-green-100 dark:bg-green-500/20" color="text-green-600 dark:text-green-400" />
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C26] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <Link href={`/groups/${groupId}/ledgers`} className="text-xs font-bold text-primary hover:underline">
            View full ledger
          </Link>
        </div>

        <div className="space-y-3">
          {recentActivity.map((item) => {
            const isCredit = item.type === "credit";

            return (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  {isCredit ? (
                    <ArrowDownLeft size={12} className="text-green-600" />
                  ) : (
                    <ArrowUpRight size={12} className="text-red-600" />
                  )}

                  <div>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {item.reference}
                    </p>
                    <p className="text-[10px] text-gray-500">{item.date}</p>
                  </div>
                </div>

                <p className={`text-xs font-bold ${isCredit ? "text-green-600" : "text-red-600"}`}>
                  {isCredit ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C26] p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Group Details
        </h3>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 max-w-3xl">
          This fund is for our annual ski trip to Aspen. All deposits are for shared expenses like lodging, lift tickets, and group dinners. Please submit withdrawal requests for reimbursements with receipts.
        </p>
        <div className="mt-4">
          <button className="text-xs font-bold text-primary hover:underline">View Members</button>
        </div>
      </section>
    </AppShell>
  );
}
