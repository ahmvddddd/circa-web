// src/app/groups/[groupId]/withdrawals/[withdrawalId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";
import clsx from "clsx";
import Link from "next/link";
import { BeneficiaryObject } from "@/lib/withdrawals";

type ApprovalHistoryItem = {
  approval_id?: string;
  approver_user_id?: string;
  approver_name?: string;
  approver_email?: string;
  name?: string;
  status?: string;
  approved_at?: string;
};

type UserPermissions = {
  role: "OWNER" | "TREASURER" | "MEMBER";
  can_approve: boolean;
  has_already_approved: boolean;
  is_admin: boolean;
};

type WithdrawalDetail = {
  id: string;
  group_id?: string;
  group_name?: string;
  amount_kobo?: number;
  amount?: number | string;
  beneficiary?: string | BeneficiaryObject;
  reason?: string;
  status: string;
  requested_by?: string;
  requester_name?: string;
  requester_email?: string;
  expires_at?: string;
  created_at?: string;
  user_permissions?: UserPermissions;
  approvals?: {
    current: number;
    total: number;
    history: ApprovalHistoryItem[];
  };
  [key: string]: any;
};

type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "FAILED" | null;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (rawDate?: string) => {
  if (!rawDate) return "—";
  try {
    const d = new Date(rawDate);
    return isNaN(d.getTime())
      ? rawDate
      : d.toLocaleDateString("en-NG", {
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

const formatBeneficiary = (beneficiary?: string | BeneficiaryObject): string => {
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

export default function WithdrawalDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const groupId = (params?.groupId as string) ?? "";
  const withdrawalId = (params?.withdrawalId as string) ?? "";

  const [withdrawal, setWithdrawal] = useState<WithdrawalDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PageError>(null);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const fetchWithdrawalDetail = useCallback(
    async (activeSignal = { active: true }) => {
      if (!groupId || !withdrawalId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await authenticationFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/withdrawal-details/${withdrawalId}`,
          { method: "GET" }
        );

        if (!activeSignal.active) return;

        if (res.status === 401) return setError("UNAUTHENTICATED");
        if (res.status === 403) return setError("FORBIDDEN");
        if (res.status === 404) return setError("NOT_FOUND");
        if (!res.ok) return setError("FAILED");

        const json = await res.json();
        const fetchedDetail: WithdrawalDetail | null =
          json?.data?.withdrawal ?? json?.data ?? null;

        if (!fetchedDetail) {
          setError("NOT_FOUND");
        } else {
          setWithdrawal(fetchedDetail);
        }
      } catch (err) {
        console.error("Error loading withdrawal detail:", err);
        if (activeSignal.active) setError("FAILED");
      } finally {
        if (activeSignal.active) setLoading(false);
      }
    },
    [groupId, withdrawalId]
  );

  useEffect(() => {
    const activeSignal = { active: true };
    fetchWithdrawalDetail(activeSignal);
    return () => {
      activeSignal.active = false;
    };
  }, [fetchWithdrawalDetail]);

  useEffect(() => {
    if (error === "UNAUTHENTICATED") {
      router.push(`/login?next=/groups/${groupId}/withdrawals/${withdrawalId}`);
    }
  }, [error, groupId, withdrawalId, router]);

  const handleReject = async () => {
    if (!groupId || !withdrawalId || isRejecting) return;

    setIsRejecting(true);
    setRejectError(null);

    try {
      const res = await authenticationFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/withdrawals/${withdrawalId}/reject`,
        { method: "POST" }
      );

      if (res.status === 401) {
        router.push(`/login?next=/groups/${groupId}/withdrawals/${withdrawalId}`);
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setRejectError(json?.message || "Failed to reject withdrawal request.");
        return;
      }

      await fetchWithdrawalDetail();
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      setRejectError("An unexpected error occurred while rejecting.");
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <AppShell title={`Withdrawal: ${withdrawalId}`} subtitle="Withdrawal Request Details">
        <p className="text-xs text-gray-500">Loading withdrawal details...</p>
      </AppShell>
    );
  }

  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Withdrawal Details" subtitle="Withdrawal Request Details">
        <p className="text-xs text-gray-500">You are not a member of this group.</p>
      </AppShell>
    );
  }

  if (error === "NOT_FOUND" || !withdrawal) {
    return (
      <AppShell title="Withdrawal Details" subtitle="Withdrawal Request Details">
        <p className="text-xs text-gray-500">Withdrawal request not found.</p>
      </AppShell>
    );
  }

  const rawAmount =
    typeof withdrawal.amount_kobo === "number"
      ? withdrawal.amount_kobo / 100
      : typeof withdrawal.amount === "string"
      ? parseFloat(withdrawal.amount) || 0
      : withdrawal.amount || 0;

  const statusUpper = (withdrawal.status || "PENDING").toUpperCase();
  const isPending = statusUpper === "PENDING";
  const isApproved = statusUpper === "APPROVED" || statusUpper === "COMPLETED";
  const isRejected = statusUpper === "REJECTED" || statusUpper === "CANCELLED";

  const groupTitle = withdrawal.group_name || "Group";
  const beneficiaryText = formatBeneficiary(withdrawal.beneficiary);
  const reasonText = withdrawal.reason || "Withdrawal Request";
  const requesterDisplayName =
    withdrawal.requester_name || withdrawal.requester_email || "Unknown";

  const createdDate = formatDate(withdrawal.created_at);
  const expiresDate = formatDate(withdrawal.expires_at);

  const approvalsCurrent = withdrawal.approvals?.current ?? 0;
  const approvalsTotal = withdrawal.approvals?.total ?? 1;
  const approvalHistory = withdrawal.approvals?.history ?? [];

  const permissions = withdrawal.user_permissions || {
    role: "MEMBER",
    can_approve: false,
    has_already_approved: false,
    is_admin: false,
  };

  return (
    <AppShell title={`Withdrawal: ${withdrawal.id}`} subtitle="Withdrawal Request Details">
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {/* Top Header Card */}
        <div className="border-b border-border bg-muted/40 px-4 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Requested Amount
              </p>
              <span className="text-3xl font-extrabold text-foreground">
                {formatCurrency(rawAmount)}
              </span>
            </div>

            {/* Action Buttons */}
            {isPending && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  {permissions.can_approve ? (
                    <Link href={`/groups/${groupId}/withdrawals/${withdrawal.id}/approve`}>
                      <button className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                        Approve
                      </button>
                    </Link>
                  ) : (
                    <button
                      disabled
                      title={
                        !permissions.is_admin
                          ? "Only group admins (Owner/Treasurer) can approve requests"
                          : "You have already voted on this request"
                      }
                      className="h-8 px-3 rounded-md bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed border border-border"
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={handleReject}
                    disabled={!permissions.can_approve || isRejecting}
                    title={
                      !permissions.is_admin
                        ? "Only group admins (Owner/Treasurer) can reject requests"
                        : "Action unavailable"
                    }
                    className={clsx(
                      "h-8 px-3 rounded-md text-xs font-semibold transition-opacity",
                      permissions.can_approve && !isRejecting
                        ? "bg-destructive text-destructive-foreground hover:opacity-90"
                        : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                    )}
                  >
                    {isRejecting ? "Rejecting..." : "Reject"}
                  </button>
                </div>
                {rejectError && (
                  <span className="text-[10px] text-destructive">{rejectError}</span>
                )}
                {!permissions.is_admin && (
                  <span className="text-[10px] text-muted-foreground">
                    Admin authorization required
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={clsx(
                "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                isApproved && "bg-green-500/10 text-green-500",
                isPending && "bg-amber-500/10 text-amber-500",
                isRejected && "bg-red-500/10 text-red-500"
              )}
            >
              {statusUpper}
            </span>

            <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {approvalsCurrent} / {approvalsTotal} Approvals
            </span>

            <span className="text-xs text-muted-foreground">Created: {createdDate}</span>
          </div>
        </div>

        {/* Details & Approval History */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Request ID
                </p>
                <p className="font-mono text-sm">#{withdrawal.id}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Group
                </p>
                <Link href={`/groups/${groupId}/withdrawals`}>
                  <span className="inline-flex cursor-pointer rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                    {groupTitle}
                  </span>
                </Link>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Beneficiary
                </p>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                  {beneficiaryText}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Reason
                </p>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                  {reasonText}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Requested By
                </p>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                  {requesterDisplayName}
                </div>
              </div>

              {withdrawal.expires_at && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Expires At
                  </p>
                  <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                    {expiresDate}
                  </div>
                </div>
              )}

              {/* Approval History List */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Approval History
                </p>
                <div className="rounded-lg border border-border bg-background p-3">
                  {approvalHistory.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No approval records found.</p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {approvalHistory.map((item, idx) => {
                        const approverName =
                          item.approver_name || item.name || item.approver_email || "Approved User";
                        const itemStatus = (item.status || "APPROVED").toUpperCase();

                        return (
                          <li
                            key={item.approval_id || idx}
                            className="flex items-center justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0"
                          >
                            <div>
                              <span className="font-medium text-foreground block">
                                {approverName}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(item.approved_at)}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-green-500">
                              {itemStatus}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground flex justify-between">
          <span>Secure withdrawal record</span>
          <span className="font-mono">ID: {withdrawal.id}</span>
        </div>
      </div>
    </AppShell>
  );
}



// // src/app/groups/[groupId]/withdrawals/[withdrawalId]/page.tsx
// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useState, useEffect, useCallback } from "react";
// import AppShell from "@/components/layout/AppShell";
// import { authenticationFetch } from "@/lib/auth/authenticationFetch";
// import clsx from "clsx";
// import Link from "next/link";
// import { BeneficiaryObject } from "@/lib/withdrawals";

// type ApprovalHistoryItem = {
//   approval_id?: string;
//   approver_user_id?: string;
//   approver_name?: string;
//   approver_email?: string;
//   name?: string;
//   status?: string;
//   approved_at?: string;
// };

// type UserPermissions = {
//   role: "OWNER" | "TREASURER" | "MEMBER";
//   can_approve: boolean;
//   has_already_approved: boolean;
//   is_admin: boolean;
// };

// type WithdrawalDetail = {
//   id: string;
//   group_id?: string;
//   group_name?: string;
//   amount_kobo?: number;
//   amount?: number | string;
//   beneficiary?: string | BeneficiaryObject;
//   reason?: string;
//   status: string;
//   requested_by?: string;
//   requester_name?: string;
//   requester_email?: string;
//   expires_at?: string;
//   created_at?: string;
//   user_permissions?: UserPermissions;
//   approvals?: {
//     current: number;
//     total: number;
//     history: ApprovalHistoryItem[];
//   };
//   [key: string]: any;
// };

// type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "FAILED" | null;

// const formatCurrency = (amount: number) =>
//   new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     minimumFractionDigits: 2,
//   }).format(amount);

// const formatDate = (rawDate?: string) => {
//   if (!rawDate) return "—";
//   try {
//     const d = new Date(rawDate);
//     return isNaN(d.getTime())
//       ? rawDate
//       : d.toLocaleDateString("en-NG", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//   } catch {
//     return rawDate;
//   }
// };

// const formatBeneficiary = (beneficiary?: string | BeneficiaryObject): string => {
//   if (!beneficiary) return "—";
//   if (typeof beneficiary === "string") return beneficiary;
//   if (typeof beneficiary === "object") {
//     const { name, bank_name, account_number } = beneficiary;
//     if (name && bank_name) return `${name} (${bank_name})`;
//     if (name) return name;
//     if (account_number && bank_name) return `${account_number} - ${bank_name}`;
//     if (account_number) return account_number;
//   }
//   return "—";
// };

// export default function WithdrawalDetailsPage() {
//   const params = useParams();
//   const router = useRouter();

//   const groupId = (params?.groupId as string) ?? "";
//   const withdrawalId = (params?.withdrawalId as string) ?? "";

//   const [withdrawal, setWithdrawal] = useState<WithdrawalDetail | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<PageError>(null);

//   const fetchWithdrawalDetail = useCallback(
//     async (activeSignal = { active: true }) => {
//       if (!groupId || !withdrawalId) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const res = await authenticationFetch(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/withdrawal-details/${withdrawalId}`,
//           { method: "GET" }
//         );

//         if (!activeSignal.active) return;

//         if (res.status === 401) return setError("UNAUTHENTICATED");
//         if (res.status === 403) return setError("FORBIDDEN");
//         if (res.status === 404) return setError("NOT_FOUND");
//         if (!res.ok) return setError("FAILED");

//         const json = await res.json();
//         const fetchedDetail: WithdrawalDetail | null =
//           json?.data?.withdrawal ?? json?.data ?? null;

//         if (!fetchedDetail) {
//           setError("NOT_FOUND");
//         } else {
//           setWithdrawal(fetchedDetail);
//         }
//       } catch (err) {
//         console.error("Error loading withdrawal detail:", err);
//         if (activeSignal.active) setError("FAILED");
//       } finally {
//         if (activeSignal.active) setLoading(false);
//       }
//     },
//     [groupId, withdrawalId]
//   );

//   useEffect(() => {
//     const activeSignal = { active: true };
//     fetchWithdrawalDetail(activeSignal);
//     return () => {
//       activeSignal.active = false;
//     };
//   }, [fetchWithdrawalDetail]);

//   useEffect(() => {
//     if (error === "UNAUTHENTICATED") {
//       router.push(`/login?next=/groups/${groupId}/withdrawals/${withdrawalId}`);
//     }
//   }, [error, groupId, withdrawalId, router]);

//   if (loading) {
//     return (
//       <AppShell title={`Withdrawal: ${withdrawalId}`} subtitle="Withdrawal Request Details">
//         <p className="text-xs text-gray-500">Loading withdrawal details...</p>
//       </AppShell>
//     );
//   }

//   if (error === "FORBIDDEN") {
//     return (
//       <AppShell title="Withdrawal Details" subtitle="Withdrawal Request Details">
//         <p className="text-xs text-gray-500">You are not a member of this group.</p>
//       </AppShell>
//     );
//   }

//   if (error === "NOT_FOUND" || !withdrawal) {
//     return (
//       <AppShell title="Withdrawal Details" subtitle="Withdrawal Request Details">
//         <p className="text-xs text-gray-500">Withdrawal request not found.</p>
//       </AppShell>
//     );
//   }

//   const rawAmount =
//     typeof withdrawal.amount_kobo === "number"
//       ? withdrawal.amount_kobo / 100
//       : typeof withdrawal.amount === "string"
//       ? parseFloat(withdrawal.amount) || 0
//       : withdrawal.amount || 0;

//   const statusUpper = (withdrawal.status || "PENDING").toUpperCase();
//   const isPending = statusUpper === "PENDING";
//   const isApproved = statusUpper === "APPROVED" || statusUpper === "COMPLETED";
//   const isRejected = statusUpper === "REJECTED" || statusUpper === "CANCELLED";

//   const groupTitle = withdrawal.group_name || "Group";
//   const beneficiaryText = formatBeneficiary(withdrawal.beneficiary);
//   const reasonText = withdrawal.reason || "Withdrawal Request";
//   const requesterDisplayName =
//     withdrawal.requester_name || withdrawal.requester_email || "Unknown";

//   const createdDate = formatDate(withdrawal.created_at);
//   const expiresDate = formatDate(withdrawal.expires_at);

//   const approvalsCurrent = withdrawal.approvals?.current ?? 0;
//   const approvalsTotal = withdrawal.approvals?.total ?? 1;
//   const approvalHistory = withdrawal.approvals?.history ?? [];

//   const permissions = withdrawal.user_permissions || {
//     role: "MEMBER",
//     can_approve: false,
//     has_already_approved: false,
//     is_admin: false,
//   };

//   return (
//     <AppShell title={`Withdrawal: ${withdrawal.id}`} subtitle="Withdrawal Request Details">
//       <div className="rounded-xl border border-border bg-surface overflow-hidden">
//         {/* Top Header Card */}
//         <div className="border-b border-border bg-muted/40 px-4 py-4 space-y-3">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//             <div>
//               <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                 Requested Amount
//               </p>
//               <span className="text-3xl font-extrabold text-foreground">
//                 {formatCurrency(rawAmount)}
//               </span>
//             </div>

//             {/* Action Buttons: Kept visible but functionally disabled for non-admins */}
//             {isPending && (
//               <div className="flex flex-col items-end gap-1">
//                 <div className="flex items-center gap-2">
//                   {permissions.can_approve ? (
//                     <Link href={`/groups/${groupId}/withdrawals/${withdrawal.id}/approve`}>
//                       <button className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
//                         Approve
//                       </button>
//                     </Link>
//                   ) : (
//                     <button
//                       disabled
//                       title={
//                         !permissions.is_admin
//                           ? "Only group admins (Owner/Treasurer) can approve requests"
//                           : "You have already voted on this request"
//                       }
//                       className="h-8 px-3 rounded-md bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed border border-border"
//                     >
//                       Approve
//                     </button>
//                   )}

//                   <button
//                     disabled={!permissions.can_approve}
//                     title={
//                       !permissions.is_admin
//                         ? "Only group admins (Owner/Treasurer) can reject requests"
//                         : "Action unavailable"
//                     }
//                     className={clsx(
//                       "h-8 px-3 rounded-md text-xs font-semibold transition-opacity",
//                       permissions.can_approve
//                         ? "bg-destructive text-destructive-foreground hover:opacity-90"
//                         : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
//                     )}
//                   >
//                     Reject
//                   </button>
//                 </div>
//                 {!permissions.is_admin && (
//                   <span className="text-[10px] text-muted-foreground">
//                     Admin authorization required
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="flex flex-wrap items-center gap-3">
//             <span
//               className={clsx(
//                 "inline-flex rounded-full px-3 py-1 text-xs font-bold",
//                 isApproved && "bg-green-500/10 text-green-500",
//                 isPending && "bg-amber-500/10 text-amber-500",
//                 isRejected && "bg-red-500/10 text-red-500"
//               )}
//             >
//               {statusUpper}
//             </span>

//             <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
//               {approvalsCurrent} / {approvalsTotal} Approvals
//             </span>

//             <span className="text-xs text-muted-foreground">Created: {createdDate}</span>
//           </div>
//         </div>

//         {/* Details & Approval History */}
//         <div className="px-4 py-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             <div className="space-y-4">
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                   Request ID
//                 </p>
//                 <p className="font-mono text-sm">#{withdrawal.id}</p>
//               </div>

//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                   Group
//                 </p>
//                 <Link href={`/groups/${groupId}/withdrawals`}>
//                   <span className="inline-flex cursor-pointer rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
//                     {groupTitle}
//                   </span>
//                 </Link>
//               </div>

//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                   Beneficiary
//                 </p>
//                 <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
//                   {beneficiaryText}
//                 </div>
//               </div>

//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                   Reason
//                 </p>
//                 <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
//                   {reasonText}
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                   Requested By
//                 </p>
//                 <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
//                   {requesterDisplayName}
//                 </div>
//               </div>

//               {withdrawal.expires_at && (
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                     Expires At
//                   </p>
//                   <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
//                     {expiresDate}
//                   </div>
//                 </div>
//               )}

//               {/* Approval History List */}
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
//                   Approval History
//                 </p>
//                 <div className="rounded-lg border border-border bg-background p-3">
//                   {approvalHistory.length === 0 ? (
//                     <p className="text-xs text-muted-foreground">No approval records found.</p>
//                   ) : (
//                     <ul className="space-y-2 text-xs">
//                       {approvalHistory.map((item, idx) => {
//                         const approverName = item.approver_name || "Approved User";
//                         const itemStatus = (item.status || "APPROVED").toUpperCase();

//                         return (
//                           <li
//                             key={item.approval_id || idx}
//                             className="flex items-center justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0"
//                           >
//                             <div>
//                               <span className="font-medium text-foreground block">
//                                 {approverName}
//                               </span>
//                               <span className="text-[10px] text-muted-foreground">
//                                 {formatDate(item.approved_at)}
//                               </span>
//                             </div>
//                             <span className="text-[11px] font-bold text-green-500">
//                               {itemStatus}
//                             </span>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground flex justify-between">
//           <span>Secure withdrawal record</span>
//           <span className="font-mono">ID: {withdrawal.id}</span>
//         </div>
//       </div>
//     </AppShell>
//   );
// }