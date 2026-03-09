

// src/app/groups/[groupId]/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import AppShell from "@/components/layout/AppShell";
// import { authenticationFetch } from "@/lib/auth/authenticationFetch";

// type GroupSummaryApi = {
//   group_id: string;
//   name: string;
//   description: string | null;
//   approvals_required: number;
//   balance_kobo: number;
//   counts: {
//     members: number;
//     deposits: number;
//     pending_withdrawals: number;
//     approved_unpaid: number;
//     paid: number;
//   };
// };

// type PageError = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "FAILED" | null;

// export default function GroupDetailsPage() {
//   const router = useRouter();
//   const params = useParams<{ groupId: string }>();
//   const groupId = params.groupId;

//   const [summary, setSummary] = useState<GroupSummaryApi | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<PageError>(null);

//   useEffect(() => {
//     let active = true;

//     async function loadSummary() {
//       if (!groupId) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const res = await authenticationFetch(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/group-summary`,
//           { method: "GET" }
//         );

//         if (!active) return;

//         if (res.status === 401) {
//           setError("UNAUTHENTICATED");
//           return;
//         }
//         if (res.status === 403) {
//           setError("FORBIDDEN");
//           return;
//         }
//         if (res.status === 404) {
//           setError("NOT_FOUND");
//           return;
//         }
//         if (!res.ok) {
//           setError("FAILED");
//           return;
//         }

//         const json: GroupSummaryApi = await res.json();
//         setSummary(json);
//       } catch {
//         if (!active) return;
//         setError("FAILED");
//       } finally {
//         if (!active) return;
//         setLoading(false);
//       }
//     }

//     loadSummary();

//     return () => {
//       active = false;
//     };
//   }, [groupId]);

//   // Redirect if not authenticated
//   useEffect(() => {
//     if (error === "UNAUTHENTICATED" && groupId) {
//       router.push(`/login?next=/groups/${groupId}`);
//     }
//   }, [error, router, groupId]);

//   // ───────── Error states ─────────
//   if (error === "FORBIDDEN") {
//     return (
//       <AppShell title="Group access">
//         <p className="text-xs text-gray-500">
//           You are not a member of this group. Speak to the owner or treasurer if you think this is a mistake.
//         </p>
//       </AppShell>
//     );
//   }

//   if (error === "NOT_FOUND") {
//     return (
//       <AppShell title="Group not found">
//         <p className="text-xs text-gray-500">
//           We could not find this group. The link may be invalid or the group may have been removed.
//         </p>
//       </AppShell>
//     );
//   }

//   if (error === "FAILED") {
//     return (
//       <AppShell title="Group details">
//         <p className="text-xs text-red-500">
//           Failed to load group details. Please try again later.
//         </p>
//       </AppShell>
//     );
//   }

//   // ───────── Loading ─────────
//   if (loading || !summary) {
//     return (
//       <AppShell title="Group details">
//         <p className="text-xs text-gray-500">Loading group…</p>
//       </AppShell>
//     );
//   }

//   const balanceNaira = (summary.balance_kobo || 0) / 100;

//   const subtitle = `${summary.counts.members} member${
//     summary.counts.members === 1 ? "" : "s"
//   } • ${summary.counts.deposits} deposit${
//     summary.counts.deposits === 1 ? "" : "s"
//   }`;

//   return (
//     <AppShell title={summary.name} subtitle={subtitle}>
//       {/* Top summary: description + approvals + balance */}
//       <section className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <div className="lg:col-span-2 rounded-xl border border-border bg-muted p-4 space-y-2">
//           <h2 className="text-sm font-semibold">About this group</h2>
//           {summary.description ? (
//             <p className="text-xs text-gray-600 dark:text-gray-400">
//               {summary.description}
//             </p>
//           ) : (
//             <p className="text-xs text-gray-500">
//               No description has been added yet.
//             </p>
//           )}
//           <p className="text-[11px] text-gray-500 mt-2">
//             <span className="font-semibold">
//               Approvals required for withdrawals:
//             </span>{" "}
//             {summary.approvals_required}
//           </p>
//         </div>

//         <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
//           <h2 className="text-sm font-semibold">Group balance</h2>
//           <p className="text-lg font-bold">
//             ₦{balanceNaira.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//           </p>
//           <p className="text-[11px] text-gray-500">
//             Based on all confirmed deposits and withdrawals.
//           </p>
//         </div>
//       </section>

//       {/* Stats row */}
//       <section className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
//         <StatCard
//           label="Members"
//           value={summary.counts.members.toString()}
//         />
//         <StatCard
//           label="Deposits"
//           value={summary.counts.deposits.toString()}
//         />
//         <StatCard
//           label="Pending withdrawals"
//           value={summary.counts.pending_withdrawals.toString()}
//         />
//         <StatCard
//           label="Approved (unpaid)"
//           value={summary.counts.approved_unpaid.toString()}
//         />
//       </section>

//       {/* Withdrawals status breakdown */}
//       <section className="mb-6 rounded-xl border border-border bg-muted p-4">
//         <h2 className="text-sm font-semibold mb-2">
//           Withdrawals summary
//         </h2>
//         <p className="text-[11px] text-gray-500 mb-3">
//           This gives you a quick sense of how much activity is waiting on approval or payment.
//         </p>
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
//           <StatusBlock
//             label="Pending approvals"
//             value={summary.counts.pending_withdrawals}
//             tone="amber"
//           />
//           <StatusBlock
//             label="Approved, not yet paid"
//             value={summary.counts.approved_unpaid}
//             tone="blue"
//           />
//           <StatusBlock
//             label="Paid withdrawals"
//             value={summary.counts.paid}
//             tone="green"
//           />
//         </div>
//       </section>

//       {/* Placeholders for future: activity + members list */}
//       <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <div className="lg:col-span-2 rounded-xl border border-border bg-muted p-4">
//           <h2 className="text-sm font-semibold mb-2">
//             Recent activity
//           </h2>
//           <p className="text-xs text-gray-500">
//             We can plug in a feed of recent deposits and withdrawals here once those endpoints are ready.
//           </p>
//         </div>

//         <div className="rounded-xl border border-border bg-muted p-4">
//           <h2 className="text-sm font-semibold mb-2">
//             Members
//           </h2>
//           <p className="text-xs text-gray-500">
//             A detailed member list and roles can be added here later using a group members endpoint.
//           </p>
//         </div>
//       </section>
//     </AppShell>
//   );
// }

// function StatCard({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="rounded-lg border border-border bg-background px-3 py-3">
//       <p className="text-[10px] text-gray-500 mb-1">{label}</p>
//       <p className="text-sm font-semibold">{value}</p>
//     </div>
//   );
// }

// function StatusBlock({
//   label,
//   value,
//   tone,
// }: {
//   label: string;
//   value: number;
//   tone: "amber" | "blue" | "green";
// }) {
//   const toneClasses =
//     tone === "amber"
//       ? "bg-amber-50 text-amber-700"
//       : tone === "blue"
//       ? "bg-blue-50 text-blue-700"
//       : "bg-green-50 text-green-700";

//   return (
//     <div className="{rounded-lg border border-border px-3 py-3 ${toneClasses}}">
//       <p className="text-[10px] font-semibold mb-1">{label}</p>
//       <p className="text-sm font-bold">{value}</p>
//     </div>
//   );
// }



// src/app/groups/[groupId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";
import Link from "next/link";

type GroupSummaryApi = {
  group_id: string;
  name: string;
  description: string | null;
  approvals_required: number;
  balance_kobo: number;
  counts: {
    members: number;
    deposits: number;
    pending_withdrawals: number;
    approved_unpaid: number;
    paid: number;
  };
};

type GroupMember = {
  user_id: string;
  name: string;
  email: string;
  role_in_group: "OWNER" | "TREASURER" | "MEMBER";
  joined_at: string;
};

type PageError =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "FAILED"
  | null;

export default function GroupDetailsPage() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;

  const [summary, setSummary] = useState<GroupSummaryApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PageError>(null);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // ───────── Load group summary ─────────
  useEffect(() => {
    let active = true;

    async function loadSummary() {
      if (!groupId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await authenticationFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/group-summary`,
          { method: "GET" }
        );

        if (!active) return;

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

        const json: GroupSummaryApi = await res.json();
        setSummary(json);
      } catch {
        if (!active) return;
        setError("FAILED");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, [groupId]);

  // ───────── Load group members ─────────
  useEffect(() => {
    let active = true;

    async function loadMembers() {
      if (!groupId) return;

      try {
        const res = await authenticationFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/members`,
          { method: "GET" }
        );

        if (!res.ok || !active) return;

        const json = await res.json();
        setMembers(json?.members ?? []);
      } finally {
        if (active) setMembersLoading(false);
      }
    }

    loadMembers();

    return () => {
      active = false;
    };
  }, [groupId]);

  // ───────── Redirect if not authenticated ─────────
  useEffect(() => {
    if (error === "UNAUTHENTICATED" && groupId) {
      router.push(`/login?next=/groups/${groupId}`);
    }
  }, [error, router, groupId]);

  // ───────── Error states ─────────
  if (error === "FORBIDDEN") {
    return (
      <AppShell title="Group access">
        <p className="text-xs text-gray-500">
          You are not a member of this group. Speak to the owner or treasurer if you think this is a mistake.
        </p>
      </AppShell>
    );
  }

  if (error === "NOT_FOUND") {
    return (
      <AppShell title="Group not found">
        <p className="text-xs text-gray-500">
          We could not find this group. The link may be invalid or the group may have been removed.
        </p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Group details">
        <p className="text-xs text-red-500">
          Failed to load group details. Please try again later.
        </p>
      </AppShell>
    );
  }

  // ───────── Loading ─────────
  if (loading || !summary) {
    return (
      <AppShell title="Group details">
        <p className="text-xs text-gray-500">Loading group…</p>
      </AppShell>
    );
  }

  const balanceNaira = (summary.balance_kobo || 0) / 100;

  const subtitle = `${summary.counts.members} member${
    summary.counts.members === 1 ? "" : "s"
  } • ${summary.counts.deposits} deposit${
    summary.counts.deposits === 1 ? "" : "s"
  }`;

  return (
    <AppShell title={summary.name} subtitle={subtitle}>
      {/* Top summary */}
      <section className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-muted p-4 space-y-2">
          <h2 className="text-sm font-semibold">About this group</h2>
          {summary.description ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {summary.description}
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              No description has been added yet.
            </p>
          )}
          <p className="text-[11px] text-gray-500 mt-2">
            <span className="font-semibold">
              Approvals required for withdrawals:
            </span>{" "}
            {summary.approvals_required}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
          <h2 className="text-sm font-semibold">Group balance</h2>
          <p className="text-lg font-bold">
            ₦{balanceNaira.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-500">
            Based on all confirmed deposits and withdrawals.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatCard label="Members" value={summary.counts.members.toString()} />
        {/* <StatCard label="Deposits" value={summary.counts.deposits.toString()} /> */}
        <Link
  href={`/groups/${groupId}/deposit`}
  className="block hover:opacity-90 transition"
>
  <StatCard label="Deposits" value={summary.counts.deposits.toString()} />
</Link>
        <StatCard
          label="Pending withdrawals"
          value={summary.counts.pending_withdrawals.toString()}
        />
        <StatCard
          label="Approved (unpaid)"
          value={summary.counts.approved_unpaid.toString()}
        />
      </section>

      {/* Withdrawals summary */}
      <section className="mb-6 rounded-xl border border-border bg-muted p-4">
        <h2 className="text-sm font-semibold mb-2">Withdrawals summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <StatusBlock
            label="Pending approvals"
            value={summary.counts.pending_withdrawals}
            tone="amber"
          />
          <StatusBlock
            label="Approved, not yet paid"
            value={summary.counts.approved_unpaid}
            tone="blue"
          />
          <StatusBlock
            label="Paid withdrawals"
            value={summary.counts.paid}
            tone="green"
          />
        </div>
      </section>

      {/* Activity + Members */}
      <div className="rounded-xl border border-border bg-muted p-4 space-y-3">
  <div className="flex items-center justify-between">
  <h3 className="text-sm font-semibold">Members</h3>

  <div className="flex items-center gap-3">
    <p className="text-[10px] text-gray-500">
      {members.length} member{members.length === 1 ? "" : "s"}
    </p>

    <button
      type="button"
      onClick={() => router.push(`/groups/${groupId}/members`)}
      className="text-[11px] font-semibold text-primary hover:underline"
    >
      View all
    </button>
  </div>
</div>

  {membersLoading && (
    <p className="text-[11px] text-gray-500">Loading members…</p>
  )}

  {!membersLoading && members.length === 0 && (
    <p className="text-[11px] text-gray-500">
      No members found yet for this group.
    </p>
  )}

  {!membersLoading && members.length > 0 && (
    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
      {members.map((m) => (
        <div
          key={m.user_id}
          className="flex items-center justify-between rounded-lg bg-background px-3 py-2"
        >
          <div>
            <p className="text-xs font-semibold">
              {m.name || m.email}
            </p>
            <p className="text-[10px] text-gray-500">
              Joined {new Date(m.joined_at).toLocaleDateString()}
            </p>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              m.role_in_group === "OWNER"
                ? "bg-emerald-500/15 text-emerald-500"
                : m.role_in_group === "TREASURER"
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {m.role_in_group}
          </span>
        </div>
      ))}
    </div>
  )}
</div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-3">
      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function StatusBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "blue" | "green";
}) {
  const toneClasses =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700"
      : "bg-green-50 text-green-700";

  return (
    <div className={`rounded-lg border border-border px-3 py-3 ${toneClasses}`}>
      <p className="text-[10px] font-semibold mb-1">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}