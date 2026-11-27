// src/app/groups/[groupId]/withdrawals/[withdrawalId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import { withdrawalsService } from "@/lib/services/withdrawalsService";
import { ApiError } from "@/lib/api/error-handler";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGroupAccess } from "@/lib/hooks/useGroupAccess";
import clsx from "clsx";
import Link from "next/link";
import { BeneficiaryObject, Withdrawal } from "@/lib/withdrawals";

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
  const { isInitialized, isAuthenticated, initializationError } = useAuth();

  const groupId = (params?.groupId as string) ?? "";
  const withdrawalId = (params?.withdrawalId as string) ?? "";

  const {
    isLoading: isAccessLoading,
    isNotMember,
    canViewResources,
    canReviewWithdrawal,
    status: accessStatus,
  } = useGroupAccess(isInitialized && isAuthenticated ? groupId : null);

  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PageError>(null);

  const requestSeqRef = useRef<number>(0);

  const fetchWithdrawalDetail = useCallback(async () => {
    if (!groupId || !withdrawalId) return;

    const currentSeq = ++requestSeqRef.current;
    setLoading(true);
    setError(null);

    try {
      const fetchedDetail = await withdrawalsService.getGroupWithdrawalDetails(
        groupId,
        withdrawalId
      );

      if (currentSeq !== requestSeqRef.current) return;

      if (!fetchedDetail) {
        setError("NOT_FOUND");
      } else {
        setWithdrawal(fetchedDetail);
      }
    } catch (err: unknown) {
      if (currentSeq !== requestSeqRef.current) return;

      if ((err as { isSuperseded?: boolean })?.isSuperseded) return;

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("UNAUTHENTICATED");
          return;
        }
        if (err.status === 403) {
          setError("FORBIDDEN");
          return;
        }
        if (err.status === 404) {
          setError("NOT_FOUND");
          return;
        }
      }
      setError("FAILED");
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, [groupId, withdrawalId]);

  useEffect(() => {
    if (!isInitialized) {
      requestSeqRef.current++;
      if (initializationError) {
        setLoading(false);
        setError("FAILED");
      }
      return;
    }

    if (!isAuthenticated) {
      requestSeqRef.current++;
      setLoading(false);
      setError("UNAUTHENTICATED");
      return;
    }

    if (isAccessLoading || accessStatus === "idle") {
      return;
    }

    if (isNotMember) {
      requestSeqRef.current++;
      setLoading(false);
      setError("FORBIDDEN");
      return;
    }

    if (accessStatus === "error") {
      requestSeqRef.current++;
      setLoading(false);
      setError("FAILED");
      return;
    }

    if (!canViewResources) {
      requestSeqRef.current++;
      setLoading(false);
      setError("FORBIDDEN");
      return;
    }

    fetchWithdrawalDetail();

    return () => {
      requestSeqRef.current++;
    };
  }, [
    isInitialized,
    isAuthenticated,
    initializationError,
    isAccessLoading,
    accessStatus,
    isNotMember,
    canViewResources,
    fetchWithdrawalDetail,
  ]);

  useEffect(() => {
    if (error === "UNAUTHENTICATED") {
      router.push(`/login?next=/groups/${groupId}/withdrawals/${withdrawalId}`);
    }
  }, [error, groupId, withdrawalId, router]);

  if (loading || isAccessLoading) {
    return (
      <AppShell title={`Withdrawal: ${withdrawalId}`} subtitle="Withdrawal Request Details">
        <p className="py-6 text-center text-xs text-muted-foreground">
          Loading withdrawal details...
        </p>
      </AppShell>
    );
  }

  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Withdrawal Details" subtitle="Withdrawal Request Details">
        <p className="py-6 text-center text-xs text-muted-foreground">
          You are not a member of this group.
        </p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Withdrawal Details" subtitle="Withdrawal Request Details">
        <p className="py-6 text-center text-xs text-muted-foreground">
          Failed to load withdrawal details. Please try again later.
        </p>
      </AppShell>
    );
  }

  if (error === "NOT_FOUND" || !withdrawal) {
    return (
      <AppShell title="Withdrawal Details" subtitle="Withdrawal Request Details">
        <p className="py-6 text-center text-xs text-muted-foreground">
          Withdrawal request not found.
        </p>
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
  const isRejected =
    statusUpper === "REJECTED" ||
    statusUpper === "CANCELLED" ||
    statusUpper === "DECLINED";

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

  const canTakeReviewAction =
    canReviewWithdrawal &&
    (withdrawal.user_permissions?.can_approve ?? true);

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

            {/* Action Buttons: Only rendered for OWNER or TREASURER; navigate to approve page */}
            {isPending && canReviewWithdrawal && (
              <div className="flex items-center gap-2">
                {canTakeReviewAction ? (
                  <>
                    <Link href={`/groups/${groupId}/withdrawals/${withdrawal.id}/approve`}>
                      <button
                        type="button"
                        className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Approve
                      </button>
                    </Link>
                    <Link
                      href={`/groups/${groupId}/withdrawals/${withdrawal.id}/approve?action=reject`}
                    >
                      <button
                        type="button"
                        className="h-8 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Reject
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled
                      title="You have already voted on this request"
                      className="h-8 px-3 rounded-md bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed border border-border"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled
                      title="You have already voted on this request"
                      className="h-8 px-3 rounded-md bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed border border-border"
                    >
                      Reject
                    </button>
                  </>
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