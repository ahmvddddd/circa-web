// src/app/group-admin/withdrawals/approvals/page.tsx
"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";

type WithdrawalStatus = "PENDING" | "APPROVED" | "DECLINED" | "PAID";
type ActingAction = "APPROVE" | "DECLINE";

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
  requested_by?: string;
  status: WithdrawalStatus;
  created_at: string;
};

export default function WithdrawalApprovalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const [actingOn, setActingOn] = useState<AdminWithdrawal | null>(null);
  const [actingAction, setActingAction] = useState<ActingAction | null>(null);

  const [declineReason, setDeclineReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadWithdrawals() {
    setLoading(true);
    setError(null);
  
    const res = await authenticationFetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-admin/all-withdrawals?limit=50&offset=0`,
      {
        method: "GET",
      }
    );
  
    if (!res.ok) {
      setError("Failed to load withdrawals");
      setLoading(false);
      return;
    }
  
    const json = await res.json();
    setWithdrawals(
      json.data.filter((w: AdminWithdrawal) => w.status === "PENDING")
    );
    setLoading(false);
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function approveWithdrawal(id: string) {
    try {
      setSubmitting(true);
      setError(null);
  
      const res = await authenticationFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/transactions/${id}/approve`,
        {
          method: "PATCH",
        }
      );
  
      if (!res.ok) {
        throw new Error();
      }
  
      closeModal();
      await loadWithdrawals();
    } catch {
      setError("Failed to approve withdrawal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function declineWithdrawal(id: string) {
    try {
      setSubmitting(true);
      setError(null);
  
      const res = await authenticationFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/transactions/${id}/decline`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: declineReason || undefined }),
        }
      );
  
      if (!res.ok) {
        throw new Error();
      }
  
      closeModal();
      await loadWithdrawals();
    } catch {
      setError("Failed to decline withdrawal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setActingOn(null);
    setActingAction(null);
    setDeclineReason("");
    setError(null);
  }

  return (
    <AppShell
      title="Withdrawal Approvals"
      subtitle="Approve or decline pending withdrawal requests"
    >
      <section className="rounded-xl border border-border bg-muted p-4 sm:p-6">
        <div className="hidden md:grid grid-cols-7 gap-3 text-[10px] font-medium text-gray-500 mb-3">
          <span>Group</span>
          <span>Amount</span>
          <span>Beneficiary</span>
          <span>Requested by</span>
          <span>Created</span>
          <span className="col-span-2">Actions</span>
        </div>

        {loading && (
          <p className="text-xs text-gray-500">Loading withdrawals…</p>
        )}

        {/* show a simple error state if loading failed */}
        {!loading && error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center rounded-lg border border-border bg-background px-3 py-3"
            >
              <p className="text-xs font-semibold">{w.group_name}</p>

              <p className="text-xs font-medium">
                ₦{(w.amount_kobo / 100).toLocaleString()}
              </p>

              <div className="text-xs">
                <p>{w.beneficiary?.account_name ?? "—"}</p>
                <p className="text-[10px] text-gray-500">
                  {w.beneficiary?.bank_name ?? "—"}
                </p>
              </div>

              <p className="text-xs">{w.requested_by ?? "—"}</p>

              <p className="text-[10px] text-gray-500">
                {new Date(w.created_at).toLocaleString()}
              </p>

              <div className="col-span-2 flex gap-2">
                <button
                  onClick={() => {
                    setActingOn(w);
                    setActingAction("APPROVE");
                  }}
                  className="rounded-md bg-green-600 px-3 py-1 text-[10px] font-semibold text-white"
                >
                  Approve
                </button>

                <button
                  onClick={() => {
                    setActingOn(w);
                    setActingAction("DECLINE");
                  }}
                  className="rounded-md bg-red-600 px-3 py-1 text-[10px] font-semibold text-white"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}

          {!loading && withdrawals.length === 0 && !error && (
            <p className="text-xs text-gray-500">
              No pending withdrawals awaiting approval.
            </p>
          )}
        </div>
      </section>

      {/* Confirmation Modal */}
      {actingOn && actingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-muted p-4 space-y-3">
            <h3 className="text-sm font-semibold">
              {actingAction === "APPROVE"
                ? "Approve withdrawal request"
                : "Decline withdrawal request"}
            </h3>

            <p className="text-xs text-gray-600">
              {actingOn.group_name} — ₦
              {(actingOn.amount_kobo / 100).toLocaleString()}
            </p>

            {/* textarea now only shows when declining */}
            {actingAction === "DECLINE" && (
              <textarea
                placeholder="Decline reason (optional)"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full rounded-md border border-border p-2 text-xs"
              />
            )}

            {error && (
              <p className="text-[10px] text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="text-xs text-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={submitting}
                onClick={() => approveWithdrawal(actingOn.id)}
                className={`rounded-md px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 ${
                  actingAction === "APPROVE"
                    ? "bg-green-600"
                    : "bg-green-600/40"
                }`}
              >
                Approve
              </button>

              <button
                disabled={submitting}
                onClick={() => declineWithdrawal(actingOn.id)}
                className={`rounded-md px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 ${
                  actingAction === "DECLINE"
                    ? "bg-red-600"
                    : "bg-red-600/40"
                }`}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}





// "use client";

// import { useEffect, useState } from "react";
// import AppShell from "@/components/layout/AppShell";

// type WithdrawalStatus = "PENDING" | "APPROVED" | "DECLINED" | "PAID";

// type Beneficiary = {
//   account_name?: string;
//   bank_name?: string;
//   account_number?: string;
// };

// type AdminWithdrawal = {
//   id: string;
//   group_name: string;
//   amount_kobo: number;
//   beneficiary: Beneficiary;
//   requested_by?: string;
//   status: WithdrawalStatus;
//   created_at: string;
// };

// /**
//  * Temporary mock data for local simulation
//  * Remove once API is live
//  */
// const MOCK_WITHDRAWALS: AdminWithdrawal[] = [
//   {
//     id: "wd_001",
//     group_name: "Alpha Group",
//     amount_kobo: 250000,
//     beneficiary: {
//       account_name: "John Doe",
//       bank_name: "GTBank",
//       account_number: "0123456789",
//     },
//     requested_by: "Treasurer – Sarah",
//     status: "PENDING",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "wd_002",
//     group_name: "Beta Circle",
//     amount_kobo: 100000,
//     beneficiary: {
//       account_name: "Jane Smith",
//       bank_name: "Access Bank",
//     },
//     requested_by: "Owner – Michael",
//     status: "PENDING",
//     created_at: new Date().toISOString(),
//   },
// ];

// export default function WithdrawalApprovalsPage() {
//   const [withdrawals, setWithdrawals] =
//     useState<AdminWithdrawal[]>([]);
//   const [actingOn, setActingOn] =
//     useState<AdminWithdrawal | null>(null);
//   const [declineReason, setDeclineReason] = useState("");

//   useEffect(() => {
//     /**
//      * Simulate API load
//      */
//     setWithdrawals(
//       MOCK_WITHDRAWALS.filter((w) => w.status === "PENDING")
//     );
//   }, []);

//   function simulateApprove(id: string) {
//     setWithdrawals((prev) =>
//       prev.filter((w) => w.id !== id)
//     );
//     setActingOn(null);
//   }

//   function simulateDecline(id: string) {
//     console.info("Decline reason:", declineReason || "—");
//     setWithdrawals((prev) =>
//       prev.filter((w) => w.id !== id)
//     );
//     setDeclineReason("");
//     setActingOn(null);
//   }

//   return (
//     <AppShell
//       title="Withdrawal Approvals"
//       subtitle="Simulation mode — no real transactions occur"
//     >
//       <section className="rounded-xl border border-border bg-muted p-4 sm:p-6">
//         <div className="mb-3 rounded-md bg-yellow-50 p-2 text-[10px] text-yellow-700">
//           ⚠️ This page is in simulation mode. Approvals and declines are
//           local-only and reset on refresh.
//         </div>

//         <div className="hidden md:grid grid-cols-7 gap-3 text-[10px] font-medium text-gray-500 mb-3">
//           <span>Group</span>
//           <span>Amount</span>
//           <span>Beneficiary</span>
//           <span>Requested by</span>
//           <span>Created</span>
//           <span className="col-span-2">Actions</span>
//         </div>

//         <div className="space-y-3">
//           {withdrawals.map((w) => (
//             <div
//               key={w.id}
//               className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center rounded-lg border border-border bg-background px-3 py-3"
//             >
//               <p className="text-xs font-semibold">{w.group_name}</p>

//               <p className="text-xs font-medium">
//                 ₦{(w.amount_kobo / 100).toLocaleString()}
//               </p>

//               <div className="text-xs">
//                 <p>{w.beneficiary?.account_name ?? "—"}</p>
//                 <p className="text-[10px] text-gray-500">
//                   {w.beneficiary?.bank_name ?? "—"}
//                 </p>
//               </div>

//               <p className="text-xs">{w.requested_by ?? "—"}</p>

//               <p className="text-[10px] text-gray-500">
//                 {new Date(w.created_at).toLocaleString()}
//               </p>

//               <div className="col-span-2 flex gap-2">
//                 <button
//                   onClick={() => setActingOn(w)}
//                   className="rounded-md bg-green-600 px-3 py-1 text-[10px] font-semibold text-white"
//                 >
//                   Approve
//                 </button>

//                 <button
//                   onClick={() => setActingOn(w)}
//                   className="rounded-md bg-red-600 px-3 py-1 text-[10px] font-semibold text-white"
//                 >
//                   Decline
//                 </button>
//               </div>
//             </div>
//           ))}

//           {withdrawals.length === 0 && (
//             <p className="text-xs text-gray-500">
//               No pending withdrawals.
//             </p>
//           )}
//         </div>
//       </section>

//       {/* Modal */}
//       {actingOn && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="w-full max-w-sm rounded-xl bg-muted p-4 space-y-3">
//             <h3 className="text-sm font-semibold">
//               Confirm action
//             </h3>

//             <p className="text-xs text-gray-600">
//               {actingOn.group_name} — ₦
//               {(actingOn.amount_kobo / 100).toLocaleString()}
//             </p>

//             <textarea
//               placeholder="Decline reason (optional)"
//               value={declineReason}
//               onChange={(e) => setDeclineReason(e.target.value)}
//               className="w-full rounded-md border border-border p-2 text-xs"
//             />

//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setActingOn(null)}
//                 className="text-xs text-gray-500"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => simulateApprove(actingOn.id)}
//                 className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white"
//               >
//                 Approve
//               </button>

//               <button
//                 onClick={() => simulateDecline(actingOn.id)}
//                 className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white"
//               >
//                 Decline
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AppShell>
//   );
// }
