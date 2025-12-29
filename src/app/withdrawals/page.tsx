//src/app/withdrawals/page.tsx
import AppShell from "@/components/layout/AppShell";
import WithdrawalCard from "@/components/withdrawals/WithdrawalCard";
import { withdrawals } from "@/lib/withdrawals";



export default function WithdrawalsPage() {
  return (
    <AppShell
      title="Withdrawals"
      subtitle="Manage withdrawals across your groups"
    >

      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-y border-border py-4 mb-6">
        <p className="text-sm font-medium text-muted-foreground">
          Filter by Status:
        </p>

        {["PENDING", "APPROVED", "DECLINED", "PAID"].map((status) => (
          <button
            key={status}
            className="h-8 px-4 rounded-lg text-sm font-medium bg-muted hover:bg-muted/70 text-foreground transition"
          >
            {status}
          </button>
        ))}
      </div>

      {/* Withdrawal List */}
      <div className="flex flex-col gap-3">
        {withdrawals.map((withdrawal) => (
          <WithdrawalCard
            key={withdrawal.id}
            withdrawal={withdrawal}
            href={`/withdrawals/${withdrawal.id}`}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-auto flex flex items-center justify-center gap-1 mt-8">
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
