// src/app/deposit/tracking/page.tsx

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

/* ---------------- Types ---------------- */
type DepositStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

type Deposit = {
  status: DepositStatus;
  created_at: string;
  updated_at?: string;
  group_name: string;
  account_name: string;
  bank_name: string;
  account_number: string;
};

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
export default function GlobalDepositTrackingPage() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") ?? "";
  const [token, setToken] = useState(initialToken);
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function resetTracking() {
    setDeposit(null);
    setToken("");
    setError(null);
  }

  async function handleTrack() {
    if (!token) return;

    setLoading(true);
    setError(null);
    setDeposit(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/deposits/by-token/${token}`,
        { cache: "no-store" }
      );

      let data: any = null;

      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("Failed to parse response JSON:", jsonError);
      }

      if (!res.ok) {
        console.error("Deposit tracking backend error:", data);
        setError("Invalid or expired tracking token");
        return;
      }

      setDeposit(data);
    } catch (networkError) {
      console.error("Deposit tracking network error:", networkError);
      setError("Invalid or expired tracking token");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Deposit Tracking"
      subtitle="Track a deposit using a public read token"
    >
      {/* ---------------- Input / Error ---------------- */}
      {!deposit && (
        <section className="mb-8">
          <div className="rounded-xl border border-border bg-muted p-6">
            <label className="mb-8 block text-xs font-medium">
              Public Read Token
            </label>

            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter tracking token"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            {error && (
              <>
                <p className="mt-2 text-[10px] text-red-500">
                  Invalid or expired tracking token
                </p>

                <button
                  onClick={resetTracking}
                  className="mt-2 text-[10px] font-medium text-primary hover:underline"
                >
                  Track another deposit
                </button>
              </>
            )}

            <button
              onClick={handleTrack}
              disabled={loading}
              className="mx-auto mt-6 block w-40 rounded-lg bg-primary px-6 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Tracking..." : "Track Deposit"}
            </button>
          </div>
        </section>
      )}

      {/* ---------------- Tracking UI ---------------- */}
      {deposit && (
        <>
          {/* Status Card */}
          <section className="mb-8">
            <div className="rounded-xl border border-border bg-muted p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Deposit Status</p>
                <StatusBadge status={deposit.status} />
              </div>

              <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                {getStatusMessage(deposit.status)}
              </p>

              <div className="mt-4 space-y-1 text-[10px] text-gray-500">
                <p>
                  Created:{" "}
                  {new Date(deposit.created_at).toLocaleString()}
                </p>

                {deposit.status === "COMPLETED" &&
                  deposit.updated_at && (
                    <p>
                      Completed:{" "}
                      {new Date(deposit.updated_at).toLocaleString()}
                    </p>
                  )}
              </div>
            </div>
          </section>

          {/* Deposit Details */}
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

              <button
                onClick={resetTracking}
                className="mt-6 text-xs font-medium text-primary hover:underline"
              >
                Track another deposit
              </button>
            </div>
          </section>

          {/* What Next */}
          {deposit.status === "PENDING" && (
            <section className="mt-6">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>What next?</strong>
                  <br />
                  If you’ve already made the transfer, please wait a
                  few moments while we confirm it automatically.
                </p>
              </div>
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}


//2️⃣ Deposit Tracking Page – src/app/deposit/tracking/page.tsx
///////////////////////////////////////////////////////

// Put the code below in its own file:
// src/app/deposit/tracking/page.tsx

// "use client";

// import Link from "next/link";
// import { useState } from "react";
// import AppShell from "@/components/layout/AppShell";

// type DepositStatus = "PENDING" | "COMPLETED" | "FAILED" | "UNKNOWN";

// type DepositDetails = {
//   group_name: string;
//   account_name: string;
//   bank_name: string;
//   amount_kobo: number;
//   status: DepositStatus;
//   created_at: string;
//   reference: string;
// };

// function StatusBadge({ status }: { status: DepositStatus }) {
//   const base =
//     "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold";

//   if (status === "COMPLETED") {
//     return (
//       <span className={`${base} bg-green-100 text-green-700`}>
//         Completed
//       </span>
//     );
//   }

//   if (status === "FAILED") {
//     return (
//       <span className={`${base} bg-red-100 text-red-700`}>
//         Failed
//       </span>
//     );
//   }

//   if (status === "PENDING") {
//     return (
//       <span className={`${base} bg-yellow-100 text-yellow-700`}>
//         Pending
//       </span>
//     );
//   }

//   return (
//     <span className={`${base} bg-gray-200 text-gray-700`}>
//       Not found
//     </span>
//   );
// }

//  export default function DepositTrackingPage() {
//   const [reference, setReference] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [details, setDetails] = useState<DepositDetails | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [hasSearched, setHasSearched] = useState(false);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!reference.trim() || loading) return;

//     setLoading(true);
//     setError(null);
//     setDetails(null);
//     setHasSearched(true);

//     try {
//       // 🔁 TODO: replace this URL with your real public tracking endpoint
//       // For example:
//       //   GET /api/v1/deposits/track?reference=...  (no auth)
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/deposits/track?reference=${encodeURIComponent(
//           reference.trim()
//         )}`,
//         {
//           method: "GET",
//           credentials: "omit", // public endpoint, no auth cookies required
//         }
//       );

//       if (res.status === 404) {
//         setDetails(null);
//         return;
//       }

//       if (!res.ok) {
//         setError("Unable to check this reference at the moment.");
//         return;
//       }

//       const json = await res.json();

//       // 🔁 TODO: adapt mapping depending on how your API returns data
//       const mapped: DepositDetails = {
//         group_name: json.group_name,
//         account_name: json.account_name,
//         bank_name: json.bank_name,
//         amount_kobo: json.amount_kobo,
//         status: (json.status as DepositStatus) ?? "UNKNOWN",
//         created_at: json.created_at,
//         reference: json.reference ?? reference.trim(),
//       };

//       setDetails(mapped);
//     } catch {
//       setError("Network error while checking your deposit.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <AppShell
//       title="Track your deposit"
//       subtitle="Check the status of a payment using your reference or token"
//     >
//       <section className="max-w-xl space-y-6">
//         {/* Intro copy */}
//         <div className="space-y-2">
//           <p className="text-sm text-gray-600">
//             Enter the payment reference or token your organiser shared with you.
//             We will only use it to look up your deposit status, not to access
//             your bank account.
//           </p>
//           <p className="text-[11px] text-gray-500">
//             If you are an organiser or treasurer and want to see full group
//             details, please{" "}
//             <Link href="/login" className="text-primary font-semibold">
//               sign in
//             </Link>
//             .
//           </p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-muted p-4">
//           <div className="space-y-2">
//             <label className="text-sm font-medium">
//               Deposit reference or token
//             </label>
//             <input
//               type="text"
//               required
//               value={reference}
//               onChange={(e) => setReference(e.target.value)}
//               placeholder="e.g. CIRC-ABCD1234"
//               className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//             <p className="text-[11px] text-gray-500">
//               You will usually find this on the payment instructions or in your
//               organiser’s message.
//             </p>
//           </div>

//           {error && (
//             <p className="text-[11px] text-red-600">
//               {error}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={loading || !reference.trim()}
//             className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
//           >
//             {loading ? "Checking…" : "Check deposit status"}
//           </button>
//         </form>

//         {/* Result */}
//         <div className="space-y-3">
//           {details && (
//             <div className="rounded-xl border border-border bg-background p-4 space-y-3">
//               <div className="flex items-center justify-between gap-2">
//                 <div>
//                   <p className="text-xs font-semibold">
//                     {details.group_name}
//                   </p>
//                   <p className="text-[11px] text-gray-500">
//                     Reference: {details.reference}
//                   </p>
//                 </div>
//                 <StatusBadge status={details.status} />
//               </div>

//               <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
//                 <div>
//                   <dt className="text-gray-500">Amount</dt>
//                   <dd className="font-medium">
//                     ₦{(details.amount_kobo / 100).toLocaleString()}
//                   </dd>
//                 </div>
//                 <div>
//                   <dt className="text-gray-500">Created</dt>
//                   <dd className="font-medium">
//                     {new Date(details.created_at).toLocaleString()}
//                   </dd>
//                 </div>
//                 <div>
//                   <dt className="text-gray-500">Account name</dt>
//                   <dd className="font-medium">
//                     {details.account_name || "—"}
//                   </dd>
//                 </div>
//                 <div>
//                   <dt className="text-gray-500">Bank</dt>
//                   <dd className="font-medium">
//                     {details.bank_name || "—"}
//                   </dd>
//                 </div>
//               </dl>

//               <p className="text-[11px] text-gray-500">
//                 If this status does not match what you expected, please contact
//                 your organiser directly so they can review the group records.
//               </p>
//             </div>
//           )}

//           {hasSearched && !details && !error && (
//             <p className="text-[11px] text-gray-500">
//               We could not find a deposit with that reference. Please check the
//               spelling, or ask your organiser to confirm the correct token.
//             </p>
//           )}
//         </div>
//       </section>
//     </AppShell>
//   );
// }