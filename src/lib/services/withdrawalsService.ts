// src/services/withdrawalsService.ts
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Withdrawal } from "@/lib/withdrawals";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface WithdrawalsResponse {
  withdrawals: Withdrawal[];
  pagination: PaginationMeta;
}

export const withdrawalsService = {
  async getGroupWithdrawals(
    groupId: string,
    page: number = 1,
    pageSize: number = 20,
    status?: string | null
  ): Promise<WithdrawalsResponse> {
    let url = `${ENDPOINTS.GROUPS.WITHDRAWALS(groupId)}?page=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }

    const response = await apiClient(url, { method: "GET" });
    const json = await response.json();

    return {
      withdrawals: json?.data?.withdrawals ?? [],
      pagination: json?.data?.pagination ?? {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
      },
    };
  },

  async getGroupWithdrawalDetails(
    groupId: string,
    withdrawalId: string
  ): Promise<Withdrawal | null> {
    const response = await apiClient(
      ENDPOINTS.GROUPS.WITHDRAWAL_DETAILS(groupId, withdrawalId),
      { method: "GET" }
    );
    const json = await response.json();
    return json?.data?.withdrawal ?? json?.data ?? null;
  },

  async approveWithdrawal(withdrawalId: string): Promise<void> {
    await apiClient(
      ENDPOINTS.TRANSACTIONS.APPROVE_WITHDRAWAL(withdrawalId),
      { method: "PATCH" }
    );
  },

  async declineWithdrawal(withdrawalId: string): Promise<void> {
    await apiClient(
      ENDPOINTS.TRANSACTIONS.DECLINE_WITHDRAWAL(withdrawalId),
      { method: "PATCH" }
    );
  },

  async rejectWithdrawal(groupId: string, withdrawalId: string): Promise<void> {
    await apiClient(
      ENDPOINTS.TRANSACTIONS.REJECT_WITHDRAWAL(groupId, withdrawalId),
      { method: "POST" }
    );
  },
};