// // src/app/group-admin/deposits/page.tsx
// import AppShell from "@/components/layout/AppShell";

// type DepositStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

// type AdminDeposit = {
//   id: string;
//   public_read_token: string;
//   group_name: string;
//   account_name: string;
//   bank_name: string;
//   status: DepositStatus;
//   created_at: string;
// };

// async function getAdminDeposits() {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-admin/all-deposits`,
//     { cache: "no-store", credentials: "include" }
//   );

//   if (res.status === 401) {
//     throw new Error("UNAUTHENTICATED");
//   }
//   if (res.status === 403) {
//     throw new Error("FORBIDDEN");
//   }

//   if (!res.ok) {
//     throw new Error("FAILED");
//   }

//   const json = await res.json();
//   return json.data;
// }

// function StatusBadge({ status }: { status: DepositStatus }) {
//   const base =
//     "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold";

//   if (status === "COMPLETED") {
//     return <span className={`${base} bg-green-100 text-green-700`}>Completed</span>;
//   }
//   if (status === "FAILED") {
//     return <span className={`${base} bg-red-100 text-red-700`}>Failed</span>;
//   }
//   if (status === "CANCELLED") {
//     return <span className={`${base} bg-gray-200 text-gray-700`}>Cancelled</span>;
//   }
//   return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
// }

// export default async function GroupAdminDepositsPage() {
//   const deposits = await getAdminDeposits();

//   return (
//     <AppShell
//       title="Group Deposits"
//       subtitle="View deposits for groups you own or manage"
//     >
//       <section className="rounded-xl border border-border bg-muted p-4 sm:p-6">
//         <div className="hidden md:grid grid-cols-6 gap-3 text-[10px] font-medium text-gray-500 mb-3">
//           <span>Group</span>
//           <span>Account name</span>
//           <span>Bank</span>
//           <span>Status</span>
//           <span>Created</span>
//           <span>Token</span>
//         </div>

//         <div className="space-y-3">
//           {deposits.map((d) => (
//             <div
//               key={d.id}
//               className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center rounded-lg border border-border bg-background px-3 py-3"
//             >
//               <div>
//                 <p className="text-xs font-semibold">{d.group_name}</p>
//               </div>

//               <p className="text-[11px] md:text-xs">{d.account_name}</p>
//               <p className="text-[11px] md:text-xs">{d.bank_name}</p>

//               <div className="md:justify-self-start">
//                 <StatusBadge status={d.status} />
//               </div>

//               <p className="text-[10px] md:text-xs text-gray-500">
//                 {new Date(d.created_at).toLocaleString()}
//               </p>

//               <p className="text-[10px] font-mono truncate">
//                 {d.public_read_token}
//               </p>
//             </div>
//           ))}

//           {deposits.length === 0 && (
//             <p className="text-xs text-gray-500">
//               No deposits found yet for your groups.
//             </p>
//           )}
//         </div>
//       </section>
//     </AppShell>
//   );
// }



// src/app/group-admin/deposits/page.tsx
import AppShell from "@/components/layout/AppShell";

type DepositStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

type AdminDeposit = {
  id: string;
  public_read_token: string;
  group_name: string;
  account_name: string;
  bank_name: string;
  status: DepositStatus;
  created_at: string;
};

type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "FAILED" | null;

async function getAdminDeposits(): Promise<AdminDeposit[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-admin/all-deposits`,
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

export default async function GroupAdminDepositsPage() {
  let deposits: AdminDeposit[] = [];
  let error: PageError = null;

  try {
    deposits = await getAdminDeposits();
  } catch (e) {
    error = (e as Error).message as PageError;
  }

  if (error === "UNAUTHENTICATED") {
    return (
      <AppShell title="Group Deposits" subtitle="">
        <p className="text-xs text-gray-500">
          Please sign in to view group deposits.
        </p>
      </AppShell>
    );
  }

  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Group Deposits" subtitle="">
        <p className="text-xs text-gray-500">
          You need OWNER or TREASURER access in at least one group to view this
          page.
        </p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Group Deposits" subtitle="">
        <p className="text-xs text-gray-500">
          Failed to load deposits. Please try again later.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Group Deposits"
      subtitle="View deposits for groups you own or manage"
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
          {deposits.map((d) => (
            <div
              key={d.id}
              className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center rounded-lg border border-border bg-background px-3 py-3"
            >
              <p className="text-xs font-semibold">{d.group_name}</p>

              <p className="text-[11px] md:text-xs">{d.account_name}</p>
              <p className="text-[11px] md:text-xs">{d.bank_name}</p>

              <div className="md:justify-self-start">
                <StatusBadge status={d.status} />
              </div>

              <p className="text-[10px] md:text-xs text-gray-500">
                {new Date(d.created_at).toLocaleString()}
              </p>

              <p className="text-[10px] font-mono truncate">
                {d.public_read_token}
              </p>
            </div>
          ))}

          {deposits.length === 0 && (
            <p className="text-xs text-gray-500">
              No deposits found yet for your groups.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
