// // src/app/groups/[groupId]/withdrawals/page.tsx
// "use client";

// import { useParams, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import AppShell from "@/components/layout/AppShell";
// import WithdrawalCard from "@/components/withdrawals/WithdrawalCard";
// import { withdrawals } from "@/lib/withdrawals";
// import { groups } from "@/lib/groups";

// export default function GroupWithdrawalsPage() {
//   const params = useParams();
//   const searchParams = useSearchParams();

//   const groupId = params.groupId as string;
//   const status = searchParams.get("status");

//   const group = groups.find((g) => g.id === groupId);

//   if (!group) {
//     return (
//       <AppShell title="Group Not Found" subtitle="">
//         <p className="text-red-500">No group found for ID: {groupId}</p>
//       </AppShell>
//     );
//   }

//   const filteredWithdrawals = withdrawals.filter((w) => {
//     const matchesGroup = w.groupId === groupId;
//     const matchesStatus = status ? w.status === status : true;
//     return matchesGroup && matchesStatus;
//   });

//   const subtitle = status
//     ? `${status
//         .replace(/_/g, " ")
//         .replace(/^\w/, (c) => c.toUpperCase())} withdrawals`
//     : "All withdrawals";


//   const filters: Array<[string | null, string]> = [
//     [null, "All"],
//     ["pending", "Pending"],
//     ["approved", "Approved"],
//     ["paid", "Paid"],
//     ["declined", "Declined"],
//   ];

//   return (
//     <AppShell
//       title={`${group.title} Withdrawals`}
//       subtitle={subtitle}
//     >
//       <div className="flex min-h-[calc(100vh-8rem)] flex-col">
// {/* Status Filters */}
// <div className="mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
//   {filters.map(([key, label]) => {
//     const isActive = key === status || (!key && !status);

//     return (
//       <Link
//         key={key ?? "all"}
//         href={
//           key
//             ? `/groups/${groupId}/withdrawals?status=${key}`
//             : `/groups/${groupId}/withdrawals`
//         }
//         className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-opacity
//           ${
//             isActive
//               ? "bg-primary text-primary-foreground hover:opacity-80"
//               : "bg-muted text-muted-foreground hover:opacity-70"
//           }
//         `}
//       >
//         {label}
//       </Link>
//     );
//   })}
// </div>


//         {/* Withdrawals List */}
//         <div className="flex flex-col gap-2">
//           {filteredWithdrawals.length === 0 && (
//             <p className="py-6 text-center text-xs text-muted-foreground">
//               No withdrawals found for this filter.
//             </p>
//           )}

//           {filteredWithdrawals.map((withdrawal) => (
//             <Link
//               key={withdrawal.id}
//               href={`/groups/${groupId}/withdrawals/${withdrawal.id}`}
//               className="block"
//             >
//               <WithdrawalCard withdrawal={withdrawal} />
//             </Link>
//           ))}
//         </div>

//         {/* Pagination */}
//         <div className="mt-auto mt-6 flex items-center justify-center gap-1">
//           {[1, 2, 3, "...", 8, 9, 10].map((page, i) => (
//             <button
//               key={i}
//               className="size-7 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
//             >
//               {page}
//             </button>
//           ))}
//         </div>
//       </div>
//     </AppShell>
//   );
// }



// src/app/groups/[groupId]/withdrawals/page.tsx
"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import WithdrawalCard from "@/components/withdrawals/WithdrawalCard";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";
import { Withdrawal } from "@/lib/withdrawals";
import clsx from "clsx";

type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

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

  const groupId = (params?.groupId as string) ?? "";
  const status = searchParams.get("status");

  const [withdrawalsList, setWithdrawalsList] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PageError>(null);

  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchWithdrawals = useCallback(
    async (pageToFetch: number, activeSignal = { active: true }) => {
      if (!groupId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await authenticationFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/withdrawals?page=${pageToFetch}&pageSize=20`,
          { method: "GET" }
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

        if (!res.ok) {
          setError("FAILED");
          return;
        }

        const json = await res.json().catch(() => null);

        const fetchedWithdrawals: Withdrawal[] = json?.data?.withdrawals ?? [];
        const meta: PaginationMeta = json?.data?.pagination ?? {
          page: pageToFetch,
          pageSize: 20,
          total: fetchedWithdrawals.length,
          totalPages: 1,
        };

        setWithdrawalsList(fetchedWithdrawals);
        setPagination(meta);
      } catch (err) {
        console.error("Error loading group withdrawals:", err);
        if (!activeSignal.active) return;
        setError("FAILED");
      } finally {
        if (activeSignal.active) {
          setLoading(false);
        }
      }
    },
    [groupId]
  );

  useEffect(() => {
    const activeSignal = { active: true };
    fetchWithdrawals(1, activeSignal);

    return () => {
      activeSignal.active = false;
    };
  }, [fetchWithdrawals]);

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

  const filteredWithdrawals = withdrawalsList.filter((w) => {
    if (!status) return true;
    return w.status?.toLowerCase() === status.toLowerCase();
  });

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
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-opacity ${
                  isActive
                    ? "bg-primary text-primary-foreground hover:opacity-80"
                    : "bg-muted text-muted-foreground hover:opacity-70"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Withdrawals List */}
        <div className="flex flex-col gap-2">
          {loading ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Loading withdrawals...
            </p>
          ) : filteredWithdrawals.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No withdrawals found for this filter.
            </p>
          ) : (
            filteredWithdrawals.map((withdrawal) => (
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
        {!loading && !error && filteredWithdrawals.length > 0 && (
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