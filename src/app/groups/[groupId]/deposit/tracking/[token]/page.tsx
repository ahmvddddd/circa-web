//src/app/groups/[groupId]/deposit/tracking/[token]/page.tsx

import AppShell from "@/components/layout/AppShell";

/* ---------------- Types ---------------- */
type PageProps = {
  params: {
    groupId: string;
    token: string;
  };
};

type DepositStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

/* ---------------- Data Fetch ---------------- */
async function getDeposit(groupId: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/deposits/${groupId}/${token}/read-token`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}


/* ---------------- Status Helpers ---------------- */
function StatusBadge({ status }: { status: DepositStatus }) {
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

function getStatusMessage(status: DepositStatus) {
  switch (status) {
    case "COMPLETED":
      return "We’ve confirmed this deposit in the group ledger.";
    case "FAILED":
      return "This deposit could not be completed.";
    case "CANCELLED":
      return "This deposit was cancelled.";
    default:
      return "We’re still waiting to match your transfer.";
  }
}

/* ---------------- Detail Row ---------------- */
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default async function DepositTrackingPage(props: PageProps) {
  const params = await props.params;
  const { groupId, token } = params;
  const deposit = await getDeposit(groupId, token);

  if (!deposit) {
    return (
      <AppShell title="Deposit Tracking" subtitle="">
        <p className="text-xs text-red-500">
          We could not find a deposit for this tracking link.
        </p>
      </AppShell>
    );
  }

  const status = deposit.status as DepositStatus;

  return (
    <AppShell
      title="Deposit Tracking"
      subtitle={`Tracking deposit for ${deposit.group_name}`}
    >
      {/* ---------------- Status Card ---------------- */}
      <section className="mb-8">
        <div className="rounded-xl border border-border bg-muted p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Deposit Status</p>
            <StatusBadge status={status} />
          </div>

          <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
            {getStatusMessage(status)}
          </p>

          <div className="mt-4 space-y-1 text-[10px] text-gray-500">
            <p>
              Created:{" "}
              {new Date(deposit.created_at).toLocaleString()}
            </p>

            {status === "COMPLETED" && (
              <p>
                Completed:{" "}
                {new Date(deposit.updated_at).toLocaleString()}
              </p>
            )}

          </div>
        </div>
      </section>

      {/* ---------------- Deposit Details ---------------- */}
      <section>
        <div className="rounded-xl border border-border bg-muted p-6">
          <h3 className="mb-4 text-sm font-semibold">
            Deposit Details
          </h3>

          <div className="space-y-3">
            <DetailRow label="Group Name" value={deposit.group_name} />
            <DetailRow label="Account Name" value={deposit.account_name} />
            <DetailRow label="Bank Name" value={deposit.bank_name} />
            <DetailRow
              label="Account Number"
              value={deposit.account_number}
            />
          </div>
        </div>
      </section>

      {/* ---------------- What Next ---------------- */}
      {status === "PENDING" && (
        <section className="mt-6">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>What next?</strong>
              <br />
              If you’ve already made the transfer, please wait a few
              moments while we confirm it automatically.
            </p>
          </div>
        </section>
      )}
    </AppShell>
  );
}
