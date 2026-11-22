// src/lib/api/auth/refresh-handler.ts
import { RefreshResult } from "@/types/auth";

type RefreshFunction = () => Promise<RefreshResult>;

let refreshImplementation: RefreshFunction | null = null;

export const refreshHandler = {
  register(fn: RefreshFunction) {
    refreshImplementation = fn;
  },
  async refresh(): Promise<RefreshResult> {
    if (!refreshImplementation) {
      throw new Error("Refresh handler not registered");
    }
    return refreshImplementation();
  },
};