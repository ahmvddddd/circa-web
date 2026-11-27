// src/app/groups/[groupId]/withdrawals/page.tsx
"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import WithdrawalCard from "@/components/withdrawals/WithdrawalCard";
import { withdrawalsService, PaginationMeta } from "@/lib/services/withdrawalsService";
import { Withdrawal } from "@/lib/withdrawals";
import { ApiError } from "@/lib/api/error-handler";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGroupAccess } from "@/lib/hooks/useGroupAccess";
import clsx from "clsx";

type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "FAILED" | null;

function getPaginationRange(
  currentPage: number,
  totalPages: number
): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];

  if (currentPage > 3) pages.push("...");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push("...");

  pages.push(totalPages);

  return pages;
}

export default function GroupWithdrawalsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isInitialized, isAuthenticated, initializationError } = useAuth();

  const groupId = (params?.groupId as string) ?? "";
  const status = searchParams.get("status");

  const {
    isLoading: isAccessLoading,
    isNotMember,
    canViewResources,
    status: accessStatus,
  } = useGroupAccess(isInitialized && isAuthenticated ? groupId : null);

  const [withdrawalsList, setWithdrawalsList] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PageError>(null);

  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  const requestSeqRef = useRef<number>(0);

  const fetchWithdrawals = useCallback(
    async (pageToFetch: number) => {
      if (!groupId) return;

      const currentSeq = ++requestSeqRef.current;
      setLoading(true);
      setError(null);

      try {
        const result = await withdrawalsService.getGroupWithdrawals(
          groupId,
          pageToFetch,
          20,
          status
        );

        if (currentSeq !== requestSeqRef.current) return;

        setWithdrawalsList(result.withdrawals);
        setPagination(result.pagination);
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
        }
        setError("FAILED");
      } finally {
        if (currentSeq === requestSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [groupId, status]
  );

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

    fetchWithdrawals(1);

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
    fetchWithdrawals,
  ]);

  useEffect(() => {
    if (error === "UNAUTHENTICATED") {
      router.push(`/login?next=/groups/${groupId}/withdrawals`);
    }
  }, [error, groupId, router]);

  const handlePageChange = (newPage: number) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === pagination.page
    ) {
      return;
    }
    fetchWithdrawals(newPage);
  };

  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Group Withdrawals" subtitle="">
        <p className="py-6 text-center text-xs text-muted-foreground">
          You are not a member of this group.
        </p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Group Withdrawals" subtitle="">
        <p className="py-6 text-center text-xs text-muted-foreground">
          Failed to load group withdrawals. Please try again later.
        </p>
      </AppShell>
    );
  }

  const subtitle = status
    ? `${status
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase())} withdrawals`
    : "All withdrawals";

  const filters: Array<[string | null, string]> = [
    [null, "All"],
    ["pending", "Pending"],
    ["approved", "Approved"],
    ["paid", "Paid"],
    ["declined", "Declined"],
  ];

  const isPageLoading = loading || isAccessLoading;

  return (
    <AppShell title="Group Withdrawals" subtitle={subtitle}>
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        {/* Status Filters */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          {filters.map(([key, label]) => {
            const isActive = key === status || (!key && !status);

            return (
              <Link
                key={key ?? "all"}
                href={
                  key
                    ? `/groups/${groupId}/withdrawals?status=${key}`
                    : `/groups/${groupId}/withdrawals`
                }
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-opacity",
                  isActive
                    ? "bg-primary text-primary-foreground hover:opacity-80"
                    : "bg-muted text-muted-foreground hover:opacity-70"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Withdrawals List */}
        <div className="flex flex-col gap-2">
          {isPageLoading ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Loading withdrawals...
            </p>
          ) : withdrawalsList.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No withdrawals found for this filter.
            </p>
          ) : (
            withdrawalsList.map((withdrawal) => (
              <Link
                key={withdrawal.id}
                href={`/groups/${groupId}/withdrawals/${withdrawal.id}`}
                className="block"
              >
                <WithdrawalCard withdrawal={withdrawal} />
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {!isPageLoading && !error && withdrawalsList.length > 0 && (
          <div className="mt-auto pt-6 flex items-center justify-center gap-1">
            {getPaginationRange(pagination.page, pagination.totalPages).map(
              (pageItem, i) => {
                const isEllipsis = pageItem === "...";
                const isActive = pageItem === pagination.page;
                const isDisabled = isEllipsis || isActive;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isDisabled}
                    onClick={() =>
                      typeof pageItem === "number" && handlePageChange(pageItem)
                    }
                    className={clsx(
                      "size-7 rounded-lg text-xs font-medium transition-colors",
                      isDisabled
                        ? "cursor-not-allowed opacity-50"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground"
                    )}
                  >
                    {pageItem}
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}