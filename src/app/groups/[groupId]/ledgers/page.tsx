// src/app/groups/[groupId]/ledgers/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";
import clsx from "clsx";
import Link from "next/link";

/* ---------------- Types ---------------- */
type LedgerEntry = {
  id: string | number;
  group_id?: string;
  group_name?: string;
  group?: string;
  account?: string;
  type: "CREDIT" | "DEBIT" | string;
  source?: string;
  amount?: number | string;
  amount_kobo?: number;
  reference?: string;
  reference_masked?: string;
  date?: string;
  created_at?: string;
  [key: string]: any;
};

type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "FAILED" | null;

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
    });
  } catch {
    return rawDate;
  }
};

/* Helper to construct pagination sequence */
function getPaginationRange(
  currentPage: number,
  totalPages: number
): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];

  if (currentPage > 3) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}

export default function GroupLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = (params?.groupId as string) ?? "";

  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PageError>(null);

  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  /* ---------------- Fetch Ledger Snapshot ---------------- */
  const fetchLedger = useCallback(
    async (pageToFetch: number, activeSignal = { active: true }) => {
      if (!groupId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await authenticationFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/ledger-snapshot?page=${pageToFetch}&pageSize=20`,
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

        if (!res.ok) {
          setError("FAILED");
          return;
        }

        let json: any = null;
        try {
          json = await res.json();
        } catch {
          json = null;
        }

        const fetchedEntries: LedgerEntry[] = json?.data?.entries ?? [];
        const meta: PaginationMeta = json?.data?.pagination ?? {
          page: pageToFetch,
          pageSize: 20,
          total: fetchedEntries.length,
          totalPages: 1,
        };

        setEntries(fetchedEntries);
        setPagination(meta);
      } catch (err) {
        console.error("Error loading group ledger:", err);
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

  /* Load initial data on mount or groupId change */
  useEffect(() => {
    const activeSignal = { active: true };
    fetchLedger(1, activeSignal);

    return () => {
      activeSignal.active = false;
    };
  }, [fetchLedger]);

  /* Redirect if unauthenticated */
  useEffect(() => {
    if (error === "UNAUTHENTICATED") {
      router.push(`/login?next=/groups/${groupId}/ledgers`);
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
    fetchLedger(newPage);
  };

  /* ---------------- Error States ---------------- */
  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Group Ledger" subtitle="">
        <p className="text-xs text-gray-500">
          You are not a member of this group.
        </p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Group Ledger" subtitle="">
        <p className="text-xs text-gray-500">
          Failed to load ledger entries. Please try again later.
        </p>
      </AppShell>
    );
  }

  const groupTitle = entries[0]?.group_name || entries[0]?.group || "Group";

  return (
    <AppShell
      title={`${groupTitle} Ledger`}
      subtitle="Track all credits and debits for this group"
    >
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            <p className="text-xs text-gray-500">Loading ledger entries...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ledgers found for this group.
            </p>
          ) : (
            entries.map((ledger) => {
              const typeUpper = (ledger.type || "CREDIT").toUpperCase();
              const isCredit = typeUpper === "CREDIT";

              // Handle amount_kobo conversion to standard currency units
              const rawAmount =
                typeof ledger.amount_kobo === "number"
                  ? ledger.amount_kobo / 100
                  : typeof ledger.amount === "string"
                  ? parseFloat(ledger.amount) || 0
                  : ledger.amount || 0;

              const signedAmount = isCredit ? rawAmount : -rawAmount;

              const entryGroup = ledger.group_name || ledger.group || groupId;
              const entrySource = ledger.source || "—";

              // Strictly prefer reference_masked over raw reference for role-based data minimization
              const entryRef =
                ledger.reference_masked || ledger.reference || "—";

              const entryDate = formatDate(ledger.date || ledger.created_at);

              return (
                <Link
                  key={ledger.id}
                  href={`/groups/${groupId}/ledgers/${ledger.id}`}
                  className="block rounded-lg border border-border bg-surface p-3 sm:p-4 transition-colors hover:bg-muted"
                >
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                    {/* Transaction / Group */}
                    <div className="space-y-1.5 min-w-0 md:col-span-2 lg:col-span-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Transaction ID
                      </div>
                      <div
                        className="text-xs font-medium truncate"
                        title={`#${ledger.id}`}
                      >
                        #{ledger.id}
                      </div>

                      <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Group
                      </div>
                      <div
                        className="text-xs font-medium truncate"
                        title={entryGroup}
                      >
                        {entryGroup}
                      </div>
                    </div>

                    {/* Type / Source */}
                    <div className="space-y-1.5 min-w-0 lg:col-span-2">
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
                        {typeUpper}
                      </span>

                      <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Source
                      </div>
                      <div
                        className="text-xs font-medium truncate"
                        title={entrySource}
                      >
                        {entrySource}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5 min-w-0 text-left sm:text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Amount
                      </div>
                      <div
                        className={clsx(
                          "text-sm font-extrabold truncate",
                          isCredit ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {formatCurrency(signedAmount)}
                      </div>
                    </div>

                    {/* Reference / Date */}
                    <div className="space-y-1.5 min-w-0 md:col-span-2 lg:col-span-2 text-left lg:text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Reference
                      </div>
                      <div
                        className="font-mono text-xs truncate"
                        title={entryRef}
                      >
                        {entryRef}
                      </div>

                      <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Date
                      </div>
                      <div className="text-xs">{entryDate}</div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && entries.length > 0 && (
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



// // src/app/groups/[groupId]/ledgers/page.tsx
// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useState, useEffect, useCallback } from "react";
// import AppShell from "@/components/layout/AppShell";
// import { authenticationFetch } from "@/lib/auth/authenticationFetch";
// import clsx from "clsx";
// import Link from "next/link";

// /* ---------------- Types ---------------- */
// type LedgerEntry = {
//   id: string | number;
//   group_id?: string;
//   group_name?: string;
//   group?: string;
//   account?: string;
//   type: "CREDIT" | "DEBIT" | string;
//   source?: string;
//   amount?: number | string;
//   amount_kobo?: number;
//   reference?: string;
//   reference_masked?: string;
//   date?: string;
//   created_at?: string;
//   [key: string]: any;
// };

// type PaginationMeta = {
//   page: number;
//   pageSize: number;
//   total: number;
//   totalPages: number;
// };

// type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "FAILED" | null;

// /* ---------------- Helpers ---------------- */
// const formatCurrency = (amount: number) =>
//   new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//     signDisplay: "always",
//   }).format(amount);

// const formatDate = (rawDate?: string) => {
//   if (!rawDate) return "—";
//   try {
//     const d = new Date(rawDate);
//     if (isNaN(d.getTime())) return rawDate;
//     return d.toLocaleDateString("en-NG", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   } catch {
//     return rawDate;
//   }
// };

// /* Helper to construct pagination sequence */
// function getPaginationRange(
//   currentPage: number,
//   totalPages: number
// ): (number | string)[] {
//   if (totalPages <= 7) {
//     return Array.from({ length: totalPages }, (_, i) => i + 1);
//   }

//   const pages: (number | string)[] = [1];

//   if (currentPage > 3) {
//     pages.push("...");
//   }

//   const start = Math.max(2, currentPage - 1);
//   const end = Math.min(totalPages - 1, currentPage + 1);

//   for (let i = start; i <= end; i++) {
//     pages.push(i);
//   }

//   if (currentPage < totalPages - 2) {
//     pages.push("...");
//   }

//   pages.push(totalPages);

//   return pages;
// }

// export default function GroupLedgerPage() {
//   const params = useParams();
//   const router = useRouter();
//   const groupId = (params?.groupId as string) ?? "";

//   const [entries, setEntries] = useState<LedgerEntry[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<PageError>(null);

//   const [pagination, setPagination] = useState<PaginationMeta>({
//     page: 1,
//     pageSize: 20,
//     total: 0,
//     totalPages: 1,
//   });

//   /* ---------------- Fetch Ledger Snapshot ---------------- */
//   const fetchLedger = useCallback(
//     async (pageToFetch: number, activeSignal = { active: true }) => {
//       if (!groupId) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const res = await authenticationFetch(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/ledger-snapshot?page=${pageToFetch}&pageSize=20`,
//           {
//             method: "GET",
//           }
//         );

//         if (!activeSignal.active) return;

//         if (res.status === 401) {
//           setError("UNAUTHENTICATED");
//           return;
//         }

//         if (res.status === 403) {
//           setError("FORBIDDEN");
//           return;
//         }

//         if (!res.ok) {
//           setError("FAILED");
//           return;
//         }

//         let json: any = null;
//         try {
//           json = await res.json();
//         } catch {
//           json = null;
//         }

//         const fetchedEntries: LedgerEntry[] = json?.data?.entries ?? [];
//         const meta: PaginationMeta = json?.data?.pagination ?? {
//           page: pageToFetch,
//           pageSize: 20,
//           total: fetchedEntries.length,
//           totalPages: 1,
//         };

//         setEntries(fetchedEntries);
//         setPagination(meta);
//       } catch (err) {
//         console.error("Error loading group ledger:", err);
//         if (!activeSignal.active) return;
//         setError("FAILED");
//       } finally {
//         if (activeSignal.active) {
//           setLoading(false);
//         }
//       }
//     },
//     [groupId]
//   );

//   /* Load initial data on mount or groupId change */
//   useEffect(() => {
//     const activeSignal = { active: true };
//     fetchLedger(1, activeSignal);

//     return () => {
//       activeSignal.active = false;
//     };
//   }, [fetchLedger]);

//   /* Redirect if unauthenticated */
//   useEffect(() => {
//     if (error === "UNAUTHENTICATED") {
//       router.push(`/login?next=/groups/${groupId}/ledgers`);
//     }
//   }, [error, groupId, router]);

//   const handlePageChange = (newPage: number) => {
//     if (
//       newPage < 1 ||
//       newPage > pagination.totalPages ||
//       newPage === pagination.page
//     ) {
//       return;
//     }
//     fetchLedger(newPage);
//   };

//   /* ---------------- Error States ---------------- */
//   if (error === "FORBIDDEN") {
//     return (
//       <AppShell title="Group Ledger" subtitle="">
//         <p className="text-xs text-gray-500">
//           You are not a member of this group.
//         </p>
//       </AppShell>
//     );
//   }

//   if (error === "FAILED") {
//     return (
//       <AppShell title="Group Ledger" subtitle="">
//         <p className="text-xs text-gray-500">
//           Failed to load ledger entries. Please try again later.
//         </p>
//       </AppShell>
//     );
//   }

//   const groupTitle = entries[0]?.group_name || entries[0]?.group || "Group";

//   return (
//     <AppShell
//       title={`${groupTitle} Ledger`}
//       subtitle="Track all credits and debits for this group"
//     >
//       <div className="flex min-h-[calc(100vh-8rem)] flex-col">
//         <div className="space-y-3 sm:space-y-4">
//           {loading ? (
//             <p className="text-xs text-gray-500">Loading ledger entries...</p>
//           ) : entries.length === 0 ? (
//             <p className="text-sm text-muted-foreground">
//               No ledgers found for this group.
//             </p>
//           ) : (
//             entries.map((ledger) => {
//               const typeUpper = (ledger.type || "CREDIT").toUpperCase();
//               const isCredit = typeUpper === "CREDIT";

//               // Handle amount_kobo conversion to standard currency units
//               const rawAmount =
//                 typeof ledger.amount_kobo === "number"
//                   ? ledger.amount_kobo / 100
//                   : typeof ledger.amount === "string"
//                   ? parseFloat(ledger.amount) || 0
//                   : ledger.amount || 0;

//               const signedAmount = isCredit ? rawAmount : -rawAmount;

//               const entryGroup = ledger.group_name || ledger.group || groupId;
//               const entrySource = ledger.source || "—";
              
//               // Prefer reference_masked if available
//               const entryRef =
//                 ledger.reference_masked || ledger.reference || "—";
              
//               const entryDate = formatDate(ledger.date || ledger.created_at);

//               return (
//                 <Link
//                   key={ledger.id}
//                   href={`/groups/${groupId}/ledgers/${ledger.id}`}
//                   className="block rounded-lg border border-border bg-surface p-3 sm:p-4 transition-colors hover:bg-muted"
//                 >
//                   <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
//                     {/* Transaction / Group */}
//                     <div className="space-y-1.5 min-w-0 md:col-span-2 lg:col-span-1">
//                       <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                         Transaction ID
//                       </div>
//                       <div
//                         className="text-xs font-medium truncate"
//                         title={`#${ledger.id}`}
//                       >
//                         #{ledger.id}
//                       </div>

//                       <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                         Group
//                       </div>
//                       <div
//                         className="text-xs font-medium truncate"
//                         title={entryGroup}
//                       >
//                         {entryGroup}
//                       </div>
//                     </div>

//                     {/* Type / Source */}
//                     <div className="space-y-1.5 min-w-0 lg:col-span-2">
//                       <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                         Type
//                       </div>
//                       <span
//                         className={clsx(
//                           "inline-flex w-fit items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
//                           isCredit
//                             ? "bg-green-500/10 text-green-500"
//                             : "bg-red-500/10 text-red-500"
//                         )}
//                       >
//                         {typeUpper}
//                       </span>

//                       <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                         Source
//                       </div>
//                       <div
//                         className="text-xs font-medium truncate"
//                         title={entrySource}
//                       >
//                         {entrySource}
//                       </div>
//                     </div>

//                     {/* Amount */}
//                     <div className="space-y-1.5 min-w-0 text-left sm:text-right">
//                       <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                         Amount
//                       </div>
//                       <div
//                         className={clsx(
//                           "text-sm font-extrabold truncate",
//                           isCredit ? "text-green-500" : "text-red-500"
//                         )}
//                       >
//                         {formatCurrency(signedAmount)}
//                       </div>
//                     </div>

//                     {/* Reference / Date */}
//                     <div className="space-y-1.5 min-w-0 md:col-span-2 lg:col-span-2 text-left lg:text-right">
//                       <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                         Reference
//                       </div>
//                       <div
//                         className="font-mono text-xs truncate"
//                         title={entryRef}
//                       >
//                         {entryRef}
//                       </div>

//                       <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                         Date
//                       </div>
//                       <div className="text-xs">{entryDate}</div>
//                     </div>
//                   </div>
//                 </Link>
//               );
//             })
//           )}
//         </div>

//         {/* Pagination */}
//         {!loading && !error && entries.length > 0 && (
//           <div className="mt-auto pt-6 flex items-center justify-center gap-1">
//             {getPaginationRange(pagination.page, pagination.totalPages).map(
//               (pageItem, i) => {
//                 const isEllipsis = pageItem === "...";
//                 const isActive = pageItem === pagination.page;
//                 const isDisabled = isEllipsis || isActive;

//                 return (
//                   <button
//                     key={i}
//                     type="button"
//                     disabled={isDisabled}
//                     onClick={() =>
//                       typeof pageItem === "number" && handlePageChange(pageItem)
//                     }
//                     className={clsx(
//                       "size-7 rounded-lg text-xs font-medium transition-colors",
//                       isDisabled
//                         ? "cursor-not-allowed opacity-50"
//                         : "text-muted-foreground hover:bg-muted hover:text-foreground",
//                       isActive && "bg-muted text-foreground"
//                     )}
//                   >
//                     {pageItem}
//                   </button>
//                 );
//               }
//             )}
//           </div>
//         )}
//       </div>
//     </AppShell>
//   );
// }