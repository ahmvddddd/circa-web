// src/services/groupsService.ts
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type GroupRole = "OWNER" | "TREASURER" | "MEMBER";

export interface Group {
  id: string;
  name: string;
  description?: string;
  approvals_required?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GroupMembership {
  groupId: string;
  userId: string;
  role: GroupRole;
  status: string;
  joinedAt?: string;
}

export const groupsService = {
  async getUserGroups(): Promise<Group[]> {
    const response = await apiClient(ENDPOINTS.GROUPS.MY_GROUPS, { method: "GET" });
    const data = await response.json();
    return data.groups || data;
  },

  async getGroupDetails(groupId: string): Promise<Group> {
    const response = await apiClient(ENDPOINTS.GROUPS.DETAILS(groupId), { method: "GET" });
    const data = await response.json();
    return data.group || data;
  },

  async getGroupMembership(groupId: string): Promise<GroupMembership> {
    const response = await apiClient(ENDPOINTS.GROUPS.MEMBERSHIP(groupId), {
      method: "GET",
    });
    const data = await response.json();
    return data.membership || data;
  },
};