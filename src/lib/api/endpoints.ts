// src/lib/api/endpoints.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
    LOGOUT_ALL: `${API_BASE_URL}/api/v1/auth/logout-all`,
    ME: `${API_BASE_URL}/api/v1/auth/me`,
  },
  GROUPS: {
    BASE: `${API_BASE_URL}/api/v1/groups`,
    MY_GROUPS: `${API_BASE_URL}/api/v1/groups/my-groups`,
    DETAILS: (groupId: string) => `${API_BASE_URL}/api/v1/groups/${groupId}/group-summary`,
    MEMBERSHIP: (groupId: string) => `${API_BASE_URL}/api/v1/groups/${groupId}/members/me`,
    WITHDRAWALS: (groupId: string) => `${API_BASE_URL}/api/v1/groups/${groupId}/withdrawals`,
    WITHDRAWAL_DETAILS: (groupId: string, withdrawalId: string) =>
      `${API_BASE_URL}/api/v1/groups/${groupId}/withdrawal-details/${withdrawalId}`,
  },
  TRANSACTIONS: {
    WITHDRAW_EXECUTE: (id: string) => `${API_BASE_URL}/api/v1/transactions/withdraw/${id}/execute`,
    APPROVE_WITHDRAWAL: (withdrawalId: string) =>
      `${API_BASE_URL}/api/v1/withdrawals/${withdrawalId}/approve`,
    DECLINE_WITHDRAWAL: (withdrawalId: string) =>
      `${API_BASE_URL}/api/v1/withdrawals/${withdrawalId}/decline`,
    REJECT_WITHDRAWAL: (groupId: string, withdrawalId: string) =>
      `${API_BASE_URL}/api/v1/groups/${groupId}/withdrawals/${withdrawalId}/reject`,
  },
} as const;