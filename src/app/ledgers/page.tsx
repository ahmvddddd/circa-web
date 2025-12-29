import AppShell from "@/components/layout/AppShell";
import { ledgers } from "@/lib/ledgers";
import clsx from "clsx";
import Link from "next/link";


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    signDisplay: "always",
  }).format(amount);

export default function GlobalLedgersPage() {
  return (
    <AppShell
      title="Global Ledgers"
      subtitle="Track all credits and debits across all groups"
    >
      <div className="space-y-3 sm:space-y-4">
        {ledgers.map((ledger) => {
          const isCredit = ledger.type === "CREDIT";
          const signedAmount = isCredit
            ? +ledger.amount
            : -ledger.amount;

          return (
           <Link
              key={ledger.id}
              href={`/ledgers/${ledger.id}`}
              className="
                block rounded-lg border border-border bg-surface
                p-3 sm:p-4
                transition-colors hover:bg-muted
              "
            >

              <div
                className="
                  grid grid-cols-1
                  gap-x-6 gap-y-3
                  sm:grid-cols-2
                  md:grid-cols-4
                  lg:grid-cols-6
                "
              >
                {/* Transaction / Group */}
                <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Transaction ID
                  </div>
                  <div className="text-xs font-medium">#{ledger.id}</div>

                  <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Group
                  </div>

                  {/* Group badge (ONLY addition) */}
                  <span
                    className="
                      inline-flex w-fit rounded-full
                      bg-primary px-2.5 py-0.5
                      text-[11px] font-semibold
                      text-primary-foreground
                    "
                    title={ledger.groupName}
                  >
                    {ledger.groupName}
                  </span>
                </div>

                {/* Type / Source */}
                <div className="space-y-1.5 lg:col-span-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </div>

                  <span
                    className={clsx(
                      "inline-flex w-fit items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      isCredit
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    )}
                  >
                    {ledger.type}
                  </span>

                  <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Source
                  </div>
                  <div
                    className="text-xs font-medium truncate"
                    title={ledger.source}
                  >
                    {ledger.source}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1.5 text-left sm:text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </div>
                  <div
                    className={clsx(
                      "text-sm font-extrabold",
                      isCredit ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {formatCurrency(signedAmount)}
                  </div>
                </div>

                {/* Reference / Date */}
                <div className="space-y-1.5 md:col-span-2 lg:col-span-2 text-left lg:text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Reference
                  </div>
                  <div
                    className="font-mono text-xs truncate"
                    title={ledger.reference}
                  >
                    {ledger.reference}
                  </div>

                  <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </div>
                  <div className="text-xs">{ledger.date}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination (unchanged) */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold">21</span> to{" "}
          <span className="font-semibold">30</span> of{" "}
          <span className="font-semibold">95</span> entries
        </p>

        <div className="flex items-center gap-1">
          {["<", "1", "2", "3", "...", "10", ">"].map((item, i) => (
            <button
              key={i}
              className={clsx(
                "h-8 w-8 rounded-lg text-sm transition-colors",
                item === "3"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/20 hover:text-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
