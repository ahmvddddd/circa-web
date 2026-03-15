// src/app/groups/[groupId]/deposits/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

/* ---------------- Types ---------------- */
type GroupDepositAccount = {
  group_id: string;
  group_name: string;
  account_number: string;
  bank_name: string;
  provider_reference: string;
  created_at: string;
};

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
  const groupId = params.groupId as string;

  const [groupAccount, setGroupAccount] =
    useState<GroupDepositAccount | null>(null);

  const [loadingAccount, setLoadingAccount] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  /* ---------------- Fetch Group Deposit Account ---------------- */
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}/deposit-account`
        );

        let data: any = null;

        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          setAccountError(
            data?.message || data?.error || "Failed to load deposit account"
          );
          return;
        }

        setGroupAccount(data);
      } catch (err) {
        console.error(err);
        setAccountError("Unable to fetch deposit account");
      } finally {
        setLoadingAccount(false);
      }
    };

    fetchAccount();
  }, [groupId]);

  const accountNumber = groupAccount?.account_number ?? "Not available yet";
  const bankName = groupAccount?.bank_name ?? "—";
  const accountName = groupAccount?.group_name
    ? `Circa - ${groupAccount.group_name}`
    : "—";

  /* ---------------- Copy Tracking Token ---------------- */
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

  /* ---------------- Generate Tracking Token ---------------- */
  const handleStartTracking = async () => {
    if (!groupAccount) return;

    setLoading(true);
    setTokenError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/deposits/${groupId}/init`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account_number: groupAccount.account_number,
            account_name: accountName,
            bank_name: bankName,
          }),
        }
      );

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.public_read_token) {
        console.error("Deposit init error:", data);
        setTokenError("Failed to generate tracking token. Please try again.");
        return;
      }

      setTrackingToken(data.public_read_token);
    } catch (err) {
      console.error(err);
      setTokenError("Failed to generate tracking token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Loading State ---------------- */
  if (loadingAccount) {
    return (
      <AppShell title="Loading..." subtitle="">
        <p className="text-xs text-gray-500">Fetching deposit details...</p>
      </AppShell>
    );
  }

  /* ---------------- Error State ---------------- */
  if (accountError) {
    return (
      <AppShell title="Deposit Account Unavailable" subtitle="">
        <p className="text-red-500 text-xs">{accountError}</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Deposit to ${groupAccount?.group_name}`}
      subtitle="Fund the group via bank transfer"
    >
      {/* ---------------- Group Name ---------------- */}
      <section className="mb-8">
        <div className="rounded-xl border border-border bg-muted p-6">
          <p className="text-[10px] text-gray-500">Group Name</p>
          <p className="text-xl">{groupAccount?.group_name}</p>
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
          {tokenError && (
            <p className="mb-4 text-xs text-red-500 text-center">
              {tokenError}
            </p>
          )}

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