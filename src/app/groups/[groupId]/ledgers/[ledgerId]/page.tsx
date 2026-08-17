// // src/app/groups/[groupId]/ledgers/[ledgerId]/page.tsx
// "use client";

// import AppShell from "@/components/layout/AppShell";
// import { ledgers } from "@/lib/ledgers";
// import { groups } from "@/lib/groups";
// import { notFound, useParams } from "next/navigation";
// import clsx from "clsx";
// import Link from "next/link";

// const formatCurrency = (amount: number) =>
//   new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     minimumFractionDigits: 0,
//     signDisplay: "always",
//   }).format(amount);

// export default function LedgerDetailsPage() {
//   const { groupId, ledgerId } = useParams<{
//     groupId: string;
//     ledgerId: string;
//   }>();

//   const ledger = ledgers.find((l) => l.id === ledgerId && l.group === groupId);
//   if (!ledger) notFound();

//   const group = groups.find((g) => g.id === ledger.group);
//   if (!group) notFound();

//   const isCredit = ledger.type === "CREDIT";
//   const signedAmount = isCredit ? ledger.amount : -ledger.amount;

//   return (
//     <AppShell title={`Ledger: ${ledger.id}`} subtitle={`Transaction Details`}>
//       {/* Main Card */}
//       <div className="rounded-xl border border-border bg-surface overflow-hidden">
//         {/* Top Card */}
//         <div className="border-b border-border bg-muted/40 px-4 py-4 space-y-3">
//           {/* Amount */}
//           <div>
//             <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//               Amount
//             </p>
//             <span
//               className={clsx(
//                 "text-3xl font-extrabold",
//                 isCredit ? "text-green-500" : "text-red-500"
//               )}
//             >
//               {formatCurrency(signedAmount)}
//             </span>
//           </div>

//           <div className="flex flex-wrap items-center gap-3">
//             {/* Type Badge */}
//             <span
//               className={clsx(
//                 "inline-flex rounded-full px-3 py-1 text-xs font-bold",
//                 isCredit
//                   ? "bg-green-500/10 text-green-500"
//                   : "bg-red-500/10 text-red-500"
//               )}
//             >
//               {ledger.type}
//             </span>

//             {/* Status */}
//             {ledger.status && (
//               <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
//                 {ledger.status}
//               </span>
//             )}

//             {/* Date */}
//             <span className="text-xs text-muted-foreground">
//               {ledger.date}
//             </span>
//           </div>
//         </div>

//         {/* Details Card */}
//         <div className="px-4 py-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             <div className="space-y-4">
//               {/* Transaction ID */}
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                   Transaction ID
//                 </p>
//                 <p className="font-mono text-sm">#{ledger.id}</p>
//               </div>

//           {/* Group */}
//           <div>
//             <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//               Group
//             </p>
//             <Link href={`/groups/${group.id}/ledgers`}>
//               <span className="inline-flex cursor-pointer rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
//                 {group.title}
//               </span>
//             </Link>
//           </div>


//               {/* Account */}
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                   Account
//                 </p>
//                 <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
//                   {ledger.account}
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               {/* Source */}
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                   Source
//                 </p>
//                 <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
//                   {ledger.source}
//                 </div>
//               </div>

//               {/* Reference */}
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                   Reference
//                 </p>
//                 <div className="rounded-lg border border-border bg-background px-3 py-2">
//                   <p className="font-mono text-xs break-all">
//                     {ledger.reference}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground flex justify-between">
//           <span>Secure ledger record</span>
//           <span className="font-mono">ID: {ledger.id}</span>
//         </div>
//       </div>
//     </AppShell>
//   );
// }



// src/app/groups/[groupId]/ledgers/[ledgerId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";
import clsx from "clsx";
import Link from "next/link";

/* ---------------- Types ---------------- */
type LedgerDetail = {
  id: string;
  group_id?: string;
  group_name?: string;
  account_id?: string;
  virtual_account_number?: string;
  account?: string;
  user_id?: string | null;
  user_name?: string;
  user_email?: string;
  type: "CREDIT" | "DEBIT" | string;
  amount_kobo?: number;
  amount?: number | string;
  currency?: string;
  source?: string;
  reference?: string;
  reference_masked?: string;
  simulated?: boolean;
  created_at?: string;
  date?: string;
  payment_channel?: string;
  rule_status?: string;
  status?: string;
  client_ref?: string | null;
  [key: string]: any;
};

type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "FAILED" | null;

/* ---------------- Helpers ---------------- */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
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
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return rawDate;
  }
};

export default function LedgerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const groupId = (params?.groupId as string) ?? "";
  const ledgerId = (params?.ledgerId as string) ?? "";

  const [ledger, setLedger] = useState<LedgerDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PageError>(null);

  /* ---------------- Fetch Single Ledger Entry ---------------- */
  const fetchLedgerDetail = useCallback(
    async (activeSignal = { active: true }) => {
      if (!groupId || !ledgerId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await authenticationFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/ledgers/${ledgerId}`,
          {
            method: "GET",
          }
        );

        if (!activeSignal.active) return;

        if (res.status === 401) {
          setError("UNAUTHENTICATED");
          return;
        }

        if (res.status === 403) {
          setError("FORBIDDEN");
          return;
        }

        if (res.status === 404) {
          setError("NOT_FOUND");
          return;
        }

        if (!res.ok) {
          setError("FAILED");
          return;
        }

        const json = await res.json();
        const fetchedDetail: LedgerDetail | null = json?.data ?? null;

        if (!fetchedDetail) {
          setError("NOT_FOUND");
        } else {
          setLedger(fetchedDetail);
        }
      } catch (err) {
        console.error("Error loading ledger detail:", err);
        if (!activeSignal.active) return;
        setError("FAILED");
      } finally {
        if (activeSignal.active) {
          setLoading(false);
        }
      }
    },
    [groupId, ledgerId]
  );

  useEffect(() => {
    const activeSignal = { active: true };
    fetchLedgerDetail(activeSignal);

    return () => {
      activeSignal.active = false;
    };
  }, [fetchLedgerDetail]);

  /* Redirect if unauthenticated */
  useEffect(() => {
    if (error === "UNAUTHENTICATED") {
      router.push(`/login?next=/groups/${groupId}/ledgers/${ledgerId}`);
    }
  }, [error, groupId, ledgerId, router]);

  /* ---------------- Error & Loading States ---------------- */
  if (loading) {
    return (
      <AppShell title={`Ledger: ${ledgerId}`} subtitle="Transaction Details">
        <p className="text-xs text-gray-500">Loading ledger entry details...</p>
      </AppShell>
    );
  }

  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Ledger Details" subtitle="Transaction Details">
        <p className="text-xs text-gray-500">
          You are not a member of this group.
        </p>
      </AppShell>
    );
  }

  if (error === "NOT_FOUND" || !ledger) {
    return (
      <AppShell title="Ledger Details" subtitle="Transaction Details">
        <p className="text-xs text-gray-500">Ledger entry not found.</p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Ledger Details" subtitle="Transaction Details">
        <p className="text-xs text-gray-500">
          Failed to load ledger entry details. Please try again later.
        </p>
      </AppShell>
    );
  }

  /* ---------------- Value Calculations ---------------- */
  const typeUpper = (ledger.type || "CREDIT").toUpperCase();
  const isCredit = typeUpper === "CREDIT";

  // Calculate standard currency amount from amount_kobo
  const rawAmount =
    typeof ledger.amount_kobo === "number"
      ? ledger.amount_kobo / 100
      : typeof ledger.amount === "string"
      ? parseFloat(ledger.amount) || 0
      : ledger.amount || 0;

  const signedAmount = isCredit ? rawAmount : -rawAmount;

  const groupTitle = ledger.group_name || "Group";
  const entryAccount =
    ledger.virtual_account_number || ledger.account_id || ledger.account || "—";
  const entrySource = ledger.source || "—";
  const entryRef = ledger.reference_masked || ledger.reference || "—";
  const entryStatus = ledger.rule_status || ledger.status;
  const entryDate = formatDate(ledger.created_at || ledger.date);

  return (
    <AppShell title={`Ledger: ${ledger.id}`} subtitle="Transaction Details">
      {/* Main Card */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {/* Top Card */}
        <div className="border-b border-border bg-muted/40 px-4 py-4 space-y-3">
          {/* Amount */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Amount
            </p>
            <span
              className={clsx(
                "text-3xl font-extrabold",
                isCredit ? "text-green-500" : "text-red-500"
              )}
            >
              {formatCurrency(signedAmount)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type Badge */}
            <span
              className={clsx(
                "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                isCredit
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {typeUpper}
            </span>

            {/* Status */}
            {entryStatus && (
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                {entryStatus}
              </span>
            )}

            {/* Date */}
            <span className="text-xs text-muted-foreground">{entryDate}</span>
          </div>
        </div>

        {/* Details Card */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              {/* Transaction ID */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Transaction ID
                </p>
                <p className="font-mono text-sm">#{ledger.id}</p>
              </div>

              {/* Group */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Group
                </p>
                <Link href={`/groups/${groupId}/ledgers`}>
                  <span className="inline-flex cursor-pointer rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                    {groupTitle}
                  </span>
                </Link>
              </div>

              {/* Account */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </p>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                  {entryAccount}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Source */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Source
                </p>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                  {entrySource}
                </div>
              </div>

              {/* Reference */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Reference
                </p>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="font-mono text-xs break-all">{entryRef}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground flex justify-between">
          <span>Secure ledger record</span>
          <span className="font-mono">ID: {ledger.id}</span>
        </div>
      </div>
    </AppShell>
  );
}