// src/types/groups.ts
export type GroupRole = "OWNER" | "TREASURER" | "MEMBER";

export interface ApiGroup {
  group_id: string;
  group_name: string;
  role_in_group: GroupRole;
  joined_at: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  my_role?: GroupRole;
  joined_at?: string;
}

export type PageError = "UNAUTHENTICATED" | "UNAUTHORIZED" | "FAILED" | null;