// src/lib/withdrawals.ts

export type BeneficiaryObject = {
  name?: string;
  bank_name?: string;
  account_number?: string;
  [key: string]: any;
};

export type ApprovalStatus = "approved" | "rejected" | "pending";

export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "declined"
  | "paid"
  | string;

export type ApprovalHistory = {
  name: string;
  status: ApprovalStatus;
  date?: string;
};

export type WithdrawalApprovals = {
  current: number;
  total: number;
  history?: ApprovalHistory[];
};

export type Withdrawal = {
  id: string | number;
  group_id?: string;
  groupId?: string;
  group_name?: string;
  groupName?: string;
  amount_kobo?: number;
  amount?: number;
  beneficiary: string | BeneficiaryObject;
  reason?: string;
  title?: string;
  requested_by?: string;
  requestedBy?: string;
  requester_name?: string;
  requester_email?: string;
  created_at?: string;
  requestedAt?: string;
  expires_at?: string;
  status: WithdrawalStatus;
  approvals?: WithdrawalApprovals;
  [key: string]: any;
};

export const withdrawals: Withdrawal[] = [
  {
    id: "1",
    group_name: "Community Savings",
    amount: 25000,
    beneficiary: "Alice Johnson",
    status: "pending",
    requested_by: "Bob Smith",
    created_at: "2026-06-01",
  },
  {
    id: "2",
    group_name: "Investment Club",
    amount: 150000,
    beneficiary: "Acme Corp",
    status: "approved",
    requested_by: "Charlie Brown",
    created_at: "2026-06-03",
  },
];