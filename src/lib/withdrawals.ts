// src/lib/withdrawals.ts

export type BeneficiaryObject = {
  name?: string;
  bank_name?: string;
  account_number?: string;
  [key: string]: unknown;
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
  [key: string]: unknown;
};