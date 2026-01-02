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
  href?: string;
};

export default function WithdrawalCard({
  withdrawal,
  href,
}: WithdrawalCardProps) {
  const progress =
    (withdrawal.approvals.current / withdrawal.approvals.total) * 100;

  const CardContent = (
    <div
      className="
        flex flex-col md:flex-row md:items-center justify-between
        gap-2 rounded-md border border-border
        bg-surface/70 hover:bg-surface transition-colors
        p-2
      "
    >
      {/* Left */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
        <div className="md:w-28">
          <p className="text-xs font-bold text-foreground">
            ₦{withdrawal.amount.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Beneficiary: {withdrawal.beneficiary}
          </p>
        </div>

        <div className="flex-1">
          <p className="text-xs text-foreground">{withdrawal.title}</p>
          <p className="text-[11px] text-muted-foreground">
            Requested by {withdrawal.requestedBy} on {withdrawal.requestedAt}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <span
          className={`
            h-5 px-2 rounded-full text-[11px]
            flex items-center font-medium
            ${statusStyles[withdrawal.status]}
          `}
        >
          {withdrawal.status}
        </span>

        <div className="flex items-center gap-2">
          <div className="w-16 rounded-full bg-muted overflow-hidden">
            <div
              className="h-0.5 bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-foreground">
            {withdrawal.approvals.current}/{withdrawal.approvals.total}
          </p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
