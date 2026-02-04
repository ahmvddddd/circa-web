// src/app/group-admin/withdrawals/page.tsx
import AppShell from "@/components/layout/AppShell";

type WithdrawalStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

type AdminWithdrawal = {
  id: string;
  public_read_token: string;
  group_name: string;
  account_name: string;
  bank_name: string;
  status: WithdrawalStatus;
  created_at: string;
};

type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "FAILED" | null;

async function getAdminWithdrawals(): Promise<AdminWithdrawal[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-admin/all-withdrawals`,
    {
      cache: "no-store",
      credentials: "include",
    }
  );

  if (res.status === 401) {
    throw new Error("UNAUTHENTICATED");
  }

  if (res.status === 403) {
    throw new Error("FORBIDDEN");
  }

  if (!res.ok) {
    throw new Error("FAILED");
  }

  const json = await res.json();
  return json.data;
}

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold";

  switch (status) {
    case "COMPLETED":
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          Completed
        </span>
      );
    case "FAILED":
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          Failed
        </span>
      );
    case "CANCELLED":
      return (
        <span className={`${base} bg-gray-200 text-gray-700`}>
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>
          Pending
        </span>
      );
  }
}

export default async function GroupAdminWithdrawalsPage() {
  let withdrawals: AdminWithdrawal[] = [];
  let error: PageError = null;

  try {
    withdrawals = await getAdminWithdrawals();
  } catch (e) {
    error = (e as Error).message as PageError;
  }

  if (error === "UNAUTHENTICATED") {
    return (
      <AppShell title="Group Withdrawals" subtitle="">
        <p className="text-xs text-gray-500">
          Please sign in to view group withdrawals.
        </p>
      </AppShell>
    );
  }

  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Group Withdrawals" subtitle="">
        <p className="text-xs text-gray-500">
          You need OWNER or TREASURER access in at least one group to view this
          page.
        </p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Group Withdrawals" subtitle="">
        <p className="text-xs text-gray-500">
          Failed to load withdrawals. Please try again later.
        </p>
      </AppShell>
    );
  }

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
          <span>Created</span>
          <span>Token</span>
        </div>

        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center rounded-lg border border-border bg-background px-3 py-3"
            >
              <p className="text-xs font-semibold">{w.group_name}</p>

              <p className="text-[11px] md:text-xs">{w.account_name}</p>
              <p className="text-[11px] md:text-xs">{w.bank_name}</p>

              <div className="md:justify-self-start">
                <StatusBadge status={w.status} />
              </div>

              <p className="text-[10px] md:text-xs text-gray-500">
                {new Date(w.created_at).toLocaleString()}
              </p>

              <p className="text-[10px] font-mono truncate">
                {w.public_read_token}
              </p>
            </div>
          ))}

          {withdrawals.length === 0 && (
            <p className="text-xs text-gray-500">
              No withdrawals found yet for your groups.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
