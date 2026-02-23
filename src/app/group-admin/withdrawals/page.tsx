// src/app/group-admin/withdrawals/page.tsx
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";

type WithdrawalStatus = "PENDING" | "APPROVED" | "DECLINED" | "PAID";

type Beneficiary = {
  account_name?: string;
  bank_name?: string;
  account_number?: string;
};

type AdminWithdrawal = {
  id: string;
  group_name: string;
  amount_kobo: number;
  beneficiary: Beneficiary;
  status: WithdrawalStatus;
  created_at: string;
};

type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "FAILED" | null;

type Pagination = {
  limit: number;
  offset: number;
  count: number;
};

async function getAdminWithdrawals(
  limit: number,
  offset: number
): Promise<{ data: AdminWithdrawal[]; pagination: Pagination }> {
  const res = await authenticationFetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-admin/all-withdrawals?limit=${limit}&offset=${offset}`,
    {
      method: "GET", // ✅ capitalise
    }
  );

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (res.status === 403) throw new Error("FORBIDDEN");
  if (!res.ok) throw new Error("FAILED");

  return res.json();
}

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold";

  switch (status) {
    case "PAID":
      return <span className={`${base} bg-green-100 text-green-700`}>Paid</span>;
    case "DECLINED":
      return <span className={`${base} bg-red-100 text-red-700`}>Declined</span>;
    case "APPROVED":
      return (
        <span className={`${base} bg-blue-100 text-blue-700`}>Approved</span>
      );
    default:
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>
      );
  }
}

export default async function GroupAdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let withdrawals: AdminWithdrawal[] = [];
  let pagination: Pagination | null = null;
  let error: PageError = null;

  try {
    const res = await getAdminWithdrawals(limit, offset);
    withdrawals = res.data;
    pagination = res.pagination;
  } catch (e) {
    error = (e as Error).message as PageError;
  }

  if (error === "UNAUTHENTICATED") {
    return (
      <AppShell title="Group Withdrawals">
        <p className="text-xs text-gray-500">
          Please sign in to view group withdrawals.
        </p>
      </AppShell>
    );
  }

  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Group Withdrawals">
        <p className="text-xs text-gray-500">
          You need OWNER or TREASURER access in at least one group to view this
          page.
        </p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Group Withdrawals">
        <p className="text-xs text-gray-500">
          Failed to load withdrawals. Please try again later.
        </p>
      </AppShell>
    );
  }

  const hasNext = pagination && pagination.count === limit;
  const hasPrev = page > 1;

  return (
    <AppShell
      title="Group Withdrawals"
      subtitle="View withdrawals for groups you own or manage"
    >
      <section className="rounded-xl border border-border bg-muted p-4 sm:p-6">
        <div className="hidden md:grid grid-cols-6 gap-3 text-[10px] font-medium text-gray-500 mb-3">
          <span>Group</span>
          <span>Account name</span>
          <span>Bank</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Created</span>
        </div>

        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center rounded-lg border border-border bg-background px-3 py-3"
            >
              <p className="text-xs font-semibold">{w.group_name}</p>

              <p className="text-xs">{w.beneficiary?.account_name ?? "—"}</p>
              <p className="text-xs">{w.beneficiary?.bank_name ?? "—"}</p>

              <StatusBadge status={w.status} />

              <p className="text-xs font-medium">
                ₦{(w.amount_kobo / 100).toLocaleString()}
              </p>

              <p className="text-[10px] text-gray-500">
                {new Date(w.created_at).toLocaleString()}
              </p>
            </div>
          ))}

          {withdrawals.length === 0 && (
            <p className="text-xs text-gray-500">
              No withdrawals found yet for your groups.
            </p>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`/group-admin/withdrawals?page=${page - 1}`}
            className={`text-xs ${
              !hasPrev ? "pointer-events-none text-gray-400" : "text-primary"
            }`}
          >
            ← Previous
          </Link>

          <span className="text-xs text-gray-500">Page {page}</span>

          <Link
            href={`/group-admin/withdrawals?page=${page + 1}`}
            className={`text-xs ${
              !hasNext ? "pointer-events-none text-gray-400" : "text-primary"
            }`}
          >
            Next →
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
