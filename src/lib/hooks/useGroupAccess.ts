// src/lib/hooks/useGroupAccess.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "@/lib/api/error-handler";
import { GroupRole, groupsService } from "../services/groupService";

export type GroupAccessStatus = "idle" | "loading" | "success" | "not_member" | "error";

export interface GroupAccessResult {
  role: GroupRole | null;
  status: GroupAccessStatus;
  isLoading: boolean;
  error: Error | ApiError | null;

  isOwner: boolean;
  isTreasurer: boolean;
  isMember: boolean;
  isNotMember: boolean;

  canViewResources: boolean;
  canCreateWithdrawal: boolean;
  canReviewWithdrawal: boolean;
  canExecuteWithdrawal: boolean;

  refetch: () => Promise<void>;
}

export function useGroupAccess(groupId?: string | null): GroupAccessResult {
  const [role, setRole] = useState<GroupRole | null>(null);
  const [status, setStatus] = useState<GroupAccessStatus>("idle");
  const [error, setError] = useState<Error | ApiError | null>(null);

  const requestSeqRef = useRef<number>(0);

  const fetchAccess = useCallback(async () => {
    const currentSeq = ++requestSeqRef.current;

    if (!groupId) {
      setRole(null);
      setStatus("idle");
      setError(null);
      return;
    }

    setRole(null);
    setStatus("loading");
    setError(null);

    try {
      const membership = await groupsService.getGroupMembership(groupId);

      if (currentSeq !== requestSeqRef.current) return;

      setRole(membership.role);
      setStatus("success");
      setError(null);
    } catch (err: unknown) {
      if (currentSeq !== requestSeqRef.current) return;

      setRole(null);
      if (err instanceof ApiError && err.status === 403) {
        setStatus("not_member");
        setError(null);
      } else {
        setStatus("error");
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }, [groupId]);

  useEffect(() => {
    fetchAccess();

    return () => {
      requestSeqRef.current++;
    };
  }, [fetchAccess]);

  const isOwner = status === "success" && role === "OWNER";
  const isTreasurer = status === "success" && role === "TREASURER";
  const isMember = status === "success" && (role === "MEMBER" || isOwner || isTreasurer);
  const isNotMember = status === "not_member";

  const canViewResources = isMember;
  const canCreateWithdrawal = isOwner || isTreasurer;
  const canReviewWithdrawal = isOwner || isTreasurer;
  const canExecuteWithdrawal = isOwner || isTreasurer;

  return {
    role: status === "success" ? role : null,
    status,
    isLoading: status === "loading",
    error,

    isOwner,
    isTreasurer,
    isMember,
    isNotMember,

    canViewResources,
    canCreateWithdrawal,
    canReviewWithdrawal,
    canExecuteWithdrawal,

    refetch: fetchAccess,
  };
}