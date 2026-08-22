// import { Withdrawal } from "@/lib/withdrawals";
// import Link from "next/link";

// const statusStyles = {
//   PENDING: "bg-yellow-500/10 text-orange-500",
//   APPROVED: "bg-blue-500/10 text-blue-500",
//   DECLINED: "bg-red-500/10 text-red-500",
//   PAID: "bg-green-500/10 text-green-500",
// } as const;

// type WithdrawalCardProps = {
//   withdrawal: Withdrawal;
//   href?: string;
// };

// export default function WithdrawalCard({
//   withdrawal,
//   href,
// }: WithdrawalCardProps) {
//   const progress =
//     (withdrawal.approvals.current / withdrawal.approvals.total) * 100;

//   const CardContent = (
//     <div
//       className="flex flex-col md:flex-row md:items-center justify-between gap-2 rounded-md border border-border bg-surface/70 hover:bg-surface transition-colors p-2">
//       {/* Left */}
//       <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
//         <div className="md:w-28">
//           <p className="text-xs font-bold text-foreground">
//             ₦{withdrawal.amount.toLocaleString()}
//           </p>
//           <p className="text-[11px] text-muted-foreground">
//             Beneficiary: {withdrawal.beneficiary}
//           </p>
//         </div>

//         <div className="flex-1">
//           <p className="text-xs text-foreground">{withdrawal.title}</p>
//           <p className="text-[11px] text-muted-foreground">
//             Requested by {withdrawal.requestedBy} on {withdrawal.requestedAt}
//           </p>
//         </div>
//       </div>

//       {/* Right */}
//       <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
//         <span
//           className={`
//             h-5 px-2 rounded-full text-[11px]
//             flex items-center font-medium
//             ${statusStyles[withdrawal.status]}
//           `}
//         >
//           {withdrawal.status}
//         </span>

//         <div className="flex items-center gap-2">
//           <div className="w-16 rounded-full bg-muted overflow-hidden">
//             <div
//               className="h-0.5 bg-primary rounded-full"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//           <p className="text-[11px] text-foreground">
//             {withdrawal.approvals.current}/{withdrawal.approvals.total}
//           </p>
//         </div>
//       </div>
//     </div>
//   );

//   if (href) {
//     return (
//       <Link href={href} className="block">
//         {CardContent}
//       </Link>
//     );
//   }

//   return CardContent;
// }



// src/components/withdrawals/WithdrawalCard.tsx

import React from "react";
import { Withdrawal, BeneficiaryObject } from "@/lib/withdrawals";

interface WithdrawalCardProps {
  withdrawal: Withdrawal;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (rawDate?: string) => {
  if (!rawDate) return "—";
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return rawDate;
    return d.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return rawDate;
  }
};

const formatBeneficiary = (
  beneficiary?: string | BeneficiaryObject
): string => {
  if (!beneficiary) return "—";
  if (typeof beneficiary === "string") return beneficiary;
  if (typeof beneficiary === "object") {
    const { name, bank_name, account_number } = beneficiary;
    if (name && bank_name) return `${name} (${bank_name})`;
    if (name) return name;
    if (account_number && bank_name) return `${account_number} - ${bank_name}`;
    if (account_number) return account_number;
  }
  return "—";
};

const getStatusBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-green-500/10 text-green-500";
    case "paid":
      return "bg-blue-500/10 text-blue-500";
    case "declined":
      return "bg-red-500/10 text-red-500";
    case "pending":
    default:
      return "bg-yellow-500/10 text-yellow-500";
  }
};

export default function WithdrawalCard({ withdrawal }: WithdrawalCardProps) {
  const rawAmount =
    typeof withdrawal.amount_kobo === "number"
      ? withdrawal.amount_kobo / 100
      : typeof withdrawal.amount === "number"
      ? withdrawal.amount
      : 0;

  const titleOrReason = withdrawal.reason || withdrawal.title || "Withdrawal Request";
  const requester = withdrawal.requester_name || withdrawal.requestedBy || "Unknown";
  const requestDate = formatDate(withdrawal.created_at || withdrawal.requestedAt);
  const statusLower = withdrawal.status?.toLowerCase() || "pending";
  const beneficiaryText = formatBeneficiary(withdrawal.beneficiary);

  return (
    <div className="rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-muted">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{titleOrReason}</h3>
          <p className="text-xs text-muted-foreground">
            Beneficiary: <span className="font-medium text-foreground">{beneficiaryText}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Requested by <span className="font-medium text-foreground">{requester}</span> on {requestDate}
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm font-extrabold text-foreground">
            {formatCurrency(rawAmount)}
          </div>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${getStatusBadgeClass(
              statusLower
            )}`}
          >
            {statusLower}
          </span>
        </div>
      </div>

      {withdrawal.approvals && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
          <span>Approvals</span>
          <span className="font-medium text-foreground">
            {withdrawal.approvals.current} / {withdrawal.approvals.total}
          </span>
        </div>
      )}
    </div>
  );
}