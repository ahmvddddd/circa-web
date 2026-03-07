// // src/app/groups/[groupId]/deposits/page.tsx

// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import AppShell from "@/components/layout/AppShell";
// import { groups } from "@/lib/groups";
// import { groupAccounts } from "@/lib/groupAccounts";
// import { Copy, Check } from "lucide-react";
// import Link from "next/link";

// /* ---------------- Info Row ---------------- */
// const InfoRow = ({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(value);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1500);
//     } catch {
//       setCopied(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
//       <div>
//         <p className="text-[10px] font-medium text-gray-500">{label}</p>
//         <p className="text-xs font-semibold text-gray-900 dark:text-white">
//           {value}
//         </p>
//       </div>

//       <button
//         type="button"
//         onClick={handleCopy}
//         className="text-gray-400 hover:text-gray-600 transition"
//         title="Copy"
//       >
//         {copied ? <Check size={14} /> : <Copy size={14} />}
//       </button>
//     </div>
//   );
// };

// /* ---------------- Page ---------------- */
// export default function GroupDepositPage() {
//   const params = useParams();
//   const router = useRouter();
//   const groupId = params.groupId as string;

//   const group = groups.find((g) => g.id === groupId);
//   const groupAccount = groupAccounts.find(
//     (account) => account.groupId === groupId
//   );

//   const [loading, setLoading] = useState(false);
//   const [trackingToken, setTrackingToken] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);

//   if (!group) {
//     return (
//       <AppShell title="Group Not Found" subtitle="">
//         <p className="text-red-500 text-xs">No group found for ID: {groupId}</p>
//       </AppShell>
//     );
//   }

//   const accountNumber = groupAccount?.accountNumber ?? "Not available yet";
//   const bankName = groupAccount?.bankName ?? "—";
//   const accountName = groupAccount?.accountName ?? `Circa - ${group.title}`;

//   const handleCopyToken = async () => {
//     if (!trackingToken) return;
//     try {
//       await navigator.clipboard.writeText(trackingToken);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1500);
//     } catch {
//       setCopied(false);
//     }
//   };

//   const handleStartTracking = async () => {
//     if (!groupAccount) return;

//     setLoading(true);
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/deposits/${groupId}/init`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             account_number: groupAccount.accountNumber,
//             account_name: groupAccount.accountName,
//             bank_name: groupAccount.bankName,
//           }),
//         }
//       );

//       const data = await res.json();

//       if (!res.ok || !data.public_read_token) {
//         console.error("Deposit init error:", data);
//         return;
//       }

//       setTrackingToken(data.public_read_token);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AppShell
//       title={`Deposit to ${group.title}`}
//       subtitle="Fund the group via bank transfer"
//     >
//       {/* ---------------- Group Name ---------------- */}
//       <section className="mb-8">
//         <div className="rounded-xl border border-border bg-muted p-6">
//           <p className="text-[10px] text-gray-500">Group Name</p>
//           <p className="text-xl">{group.title}</p>
//         </div>
//       </section>

//       {/* ---------------- Bank Transfer Details ---------------- */}
//       <section className="rounded-xl border border-border bg-muted p-6 w-full">
//         <h3 className="text-sm font-semibold mb-4">
//           Bank Transfer Details
//         </h3>

//         <div className="space-y-3">
//           <InfoRow label="Bank Name" value={bankName} />
//           <InfoRow label="Account Number" value={accountNumber} />
//           <InfoRow label="Account Name" value={accountName} />
//         </div>

//         <div className="mt-4 text-[10px] text-gray-500 space-y-1">
//           <p>• Transfer from any Nigerian bank or fintech app</p>
//           <p>• Use your group name as narration</p>
//           <p>• Funds reflect instantly after successful transfer</p>
//         </div>
//       </section>

//       {/* ---------------- Tracking Token Panel ---------------- */}
//       {trackingToken && (
//         <section className="mt-8">
//           <div className="rounded-xl border border-border bg-background p-6">
//             <p className="text-xs font-semibold mb-2">
//               Your tracking token
//             </p>

//             <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
//               <p className="text-xs font-mono truncate">
//                 {trackingToken}
//               </p>

//               <button
//                 type="button"
//                 onClick={handleCopyToken}
//                 className="text-gray-400 hover:text-gray-600 transition"
//               >
//                 {copied ? <Check size={14} /> : <Copy size={14} />}
//               </button>
//             </div>

//             <p className="mt-3 text-[10px] text-gray-500">
//               Keep this safe. You’ll need it to track your deposit later.
//             </p>

//             <div className="mt-4">
//               <Link
//                 href={`/deposit/tracking?token=${trackingToken}`}
//                 className="text-xs font-medium text-primary hover:underline"
//               >
//                 Open in Deposit Tracking
//               </Link>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* ---------------- CTA ---------------- */}
//       {!trackingToken && (
//         <div className="mt-10 flex justify-center">
//           <button
//             type="button"
//             onClick={handleStartTracking}
//             disabled={loading || !groupAccount}
//             className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-6 py-2 text-xs font-bold text-white hover:bg-primary/90 transition disabled:opacity-60"
//           >
//             {loading
//               ? "Generating tracking token..."
//               : "Generate Tracking Token"}
//           </button>
//         </div>
//       )}
//     </AppShell>
//   );
// }



// src/app/groups/[groupId]/deposits/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

/* ---------------- Info Row ---------------- */
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-[10px] font-medium text-gray-500">{label}</p>
        <p className="text-xs font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="text-gray-400 hover:text-gray-600 transition"
        title="Copy"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
};

/* ---------------- Page ---------------- */
export default function GroupDepositPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<any>(null);
  const [groupAccount, setGroupAccount] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Load APIs ---------------- */
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [groupRes, accountRes] = await Promise.all([
          authenticationFetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/group-summary`,
            { method: "GET" }
          ),
          authenticationFetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/deposit-account`,
            { method: "GET" }
          ),
        ]);

        if (!active) return;

        if (groupRes.status === 401 || accountRes.status === 401) {
          setError("UNAUTHENTICATED");
          return;
        }

        if (groupRes.status === 404) {
          setError("GROUP_NOT_FOUND");
          return;
        }

        if (groupRes.ok) {
          const groupJson = await groupRes.json();
          setGroup(groupJson);
        }

        if (accountRes.ok) {
          const accountJson = await accountRes.json();
          setGroupAccount(accountJson);
        }
      } catch (err) {
        console.error("Failed to load deposit page data", err);
        setError("FAILED");
      } finally {
        if (active) setPageLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [groupId]);

  /* ---------------- Redirect if unauthenticated ---------------- */
  useEffect(() => {
    if (error === "UNAUTHENTICATED" && groupId) {
      router.push(`/login?next=/groups/${groupId}/deposits`);
    }
  }, [error, router, groupId]);

  if (pageLoading) {
    return (
      <AppShell title="Deposit" subtitle="">
        <p className="text-xs text-gray-500">Loading group…</p>
      </AppShell>
    );
  }

  if (error === "GROUP_NOT_FOUND" || !group) {
    return (
      <AppShell title="Group Not Found" subtitle="">
        <p className="text-red-500 text-xs">No group found for ID: {groupId}</p>
      </AppShell>
    );
  }

  if (error === "FAILED") {
    return (
      <AppShell title="Deposit" subtitle="">
        <p className="text-xs text-red-500">
          Failed to load deposit data. Please try again later.
        </p>
      </AppShell>
    );
  }

  const accountNumber =
    groupAccount?.account_number ?? "Not available yet";

  const bankName = groupAccount?.bank_name ?? "—";

  const accountName = groupAccount?.account_name ?? `Circa - ${group.name}`;

  const handleCopyToken = async () => {
    if (!trackingToken) return;
    try {
      await navigator.clipboard.writeText(trackingToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleStartTracking = async () => {
    if (!groupAccount) return;

    setLoading(true);
    try {
      const res = await authenticationFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/deposits/${groupId}/init`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account_number: accountNumber,
            account_name: accountName,
            bank_name: bankName,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.public_read_token) {
        console.error("Deposit init error:", data);
        return;
      }

      setTrackingToken(data.public_read_token);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title={`Deposit to ${group.name}`}
      subtitle="Fund the group via bank transfer"
    >
      {/* ---------------- Group Name ---------------- */}
      <section className="mb-8">
        <div className="rounded-xl border border-border bg-muted p-6">
          <p className="text-[10px] text-gray-500">Group Name</p>
          <p className="text-xl">{group.name}</p>
        </div>
      </section>

      {/* ---------------- Bank Transfer Details ---------------- */}
      <section className="rounded-xl border border-border bg-muted p-6 w-full">
        <h3 className="text-sm font-semibold mb-4">
          Bank Transfer Details
        </h3>

        <div className="space-y-3">
          <InfoRow label="Bank Name" value={bankName} />
          <InfoRow label="Account Number" value={accountNumber} />
          <InfoRow label="Account Name" value={accountName} />
        </div>

        <div className="mt-4 text-[10px] text-gray-500 space-y-1">
          <p>• Transfer from any Nigerian bank or fintech app</p>
          <p>• Use your group name as narration</p>
          <p>• Funds reflect instantly after successful transfer</p>
        </div>
      </section>

      {/* ---------------- Tracking Token Panel ---------------- */}
      {trackingToken && (
        <section className="mt-8">
          <div className="rounded-xl border border-border bg-background p-6">
            <p className="text-xs font-semibold mb-2">
              Your tracking token
            </p>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <p className="text-xs font-mono truncate">
                {trackingToken}
              </p>

              <button
                type="button"
                onClick={handleCopyToken}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <p className="mt-3 text-[10px] text-gray-500">
              Keep this safe. You’ll need it to track your deposit later.
            </p>

            <div className="mt-4">
              <Link
                href={`/deposit/tracking?token=${trackingToken}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                Open in Deposit Tracking
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- CTA ---------------- */}
      {!trackingToken && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleStartTracking}
            disabled={loading || !groupAccount}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-6 py-2 text-xs font-bold text-white hover:bg-primary/90 transition disabled:opacity-60"
          >
            {loading
              ? "Generating tracking token..."
              : "Generate Tracking Token"}
          </button>
        </div>
      )}
    </AppShell>
  );
}