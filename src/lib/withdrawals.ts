// src/lib/withdrawals.ts

export type BeneficiaryObject = {
  name?: string;
  bank_name?: string;
  account_number?: string;
  [key: string]: unknown;
};

export type ApprovalStatus = "APPROVED" | "REJECTED" | "PENDING" | string;

export type WithdrawalStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "PAID"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | string;

export type ApprovalHistoryItem = {
  approval_id?: string;
  approver_user_id?: string;
  approver_name?: string;
  approver_email?: string;
  name?: string;
  status?: ApprovalStatus;
  approved_at?: string;
  date?: string;
};

export type UserPermissions = {
  role: "OWNER" | "TREASURER" | "MEMBER";
  can_approve: boolean;
  has_already_approved: boolean;
  is_admin: boolean;
};

export type WithdrawalApprovals = {
  current: number;
  total: number;
  history?: ApprovalHistoryItem[];
};

export type Withdrawal = {
  id: string | number;
  group_id?: string;
  groupId?: string;
  group_name?: string;
  groupName?: string;
  amount_kobo?: number;
  amount?: number | string;
  beneficiary?: string | BeneficiaryObject;
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
  user_permissions?: UserPermissions;
  approvals?: WithdrawalApprovals;
};