import { Withdrawal } from "@/lib/withdrawals";
import Link from "next/link";

const statusStyles = {
  PENDING: "bg-yellow-500/10 text-orange-500",
  APPROVED: "bg-blue-500/10 text-blue-500",
  DECLINED: "bg-red-500/10 text-red-500",
  PAID: "bg-green-500/10 text-green-500",
} as const;

type WithdrawalCardProps = {
  withdrawal: Withdrawal;
  href?: string; // 👈 optional link
};

export default function WithdrawalCard({
  withdrawal,
  href,
}: WithdrawalCardProps) {
  const progress =
    (withdrawal.approvals.current / withdrawal.approvals.total) * 100;

  const CardContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border border-border bg-surface/70 hover:bg-surface transition-colors p-4">
      {/* Left */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
        <div className="md:w-40">
          <p className="text-sm font-bold text-foreground">
            ₦{withdrawal.amount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Beneficiary: {withdrawal.beneficiary}
          </p>
        </div>

        <div className="flex-1">
          <p className="text-sm text-foreground">{withdrawal.title}</p>
          <p className="text-xs text-muted-foreground">
            Requested by {withdrawal.requestedBy} on {withdrawal.requestedAt}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <span
          className={`h-7 px-3 rounded-full text-xs flex items-center ${
            statusStyles[withdrawal.status]
          }`}
        >
          {withdrawal.status}
        </span>

        <div className="flex items-center gap-3">
          <div className="w-24 rounded-full bg-muted overflow-hidden">
            <div
              className="h-1 bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-foreground">
            {withdrawal.approvals.current} / {withdrawal.approvals.total}
          </p>
        </div>
      </div>
    </div>
  );

  // 👇 Only wrap with Link if href is provided
  if (href) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
