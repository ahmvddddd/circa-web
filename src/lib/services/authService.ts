// src/lib/services/authService.ts
import { ENDPOINTS } from "@/lib/api/endpoints";
import { tokenStorage } from "@/lib/api/auth/token-storage";
import { parseApiError } from "@/lib/api/error-handler";
import { apiClient } from "@/lib/api/client";
import { LoginCredentials, RegisterCredentials, AuthResponse, User, RefreshResult } from "@/types/auth";
import { sessionEvents } from "@/lib/api/auth/session-events";
import { refreshHandler } from "@/lib/api/auth/refresh-handler";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const genBefore = tokenStorage.getTokenGeneration();
    const res = await fetch(ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      throw await parseApiError(res);
    }

    const data: AuthResponse = await res.json();
    if (!data?.accessToken) {
      throw new Error("Invalid login response: missing access token");
    }

    const committed = tokenStorage.setAccessToken(data.accessToken, genBefore);
    if (!committed) {
      throw new Error("Stale login response discarded.");
    }
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<{ message: string; user: User }> {
    const res = await fetch(ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      throw await parseApiError(res);
    }

    return res.json();
  },

  async refreshAccessToken(): Promise<RefreshResult> {
    const genBefore = tokenStorage.getTokenGeneration();
    try {
      const res = await fetch(ENDPOINTS.AUTH.REFRESH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (tokenStorage.getTokenGeneration() !== genBefore) {
        return "SUPERSEDED";
      }

      if (res.status === 401) {
        tokenStorage.clearToken();
        sessionEvents.notifySessionExpired();
        return "SESSION_EXPIRED";
      }

      if (!res.ok) {
        return "TEMPORARILY_UNAVAILABLE";
      }

      const data: { accessToken: string } = await res.json();
      if (data?.accessToken) {
        const committed = tokenStorage.setAccessToken(data.accessToken, genBefore);
        if (!committed) {
          return "SUPERSEDED";
        }
        return "REFRESHED";
      }

      return "TEMPORARILY_UNAVAILABLE";
    } catch {
      return "TEMPORARILY_UNAVAILABLE";
    }
  },

  async getCurrentUser(): Promise<User> {
    const res = await apiClient(ENDPOINTS.AUTH.ME, {
      method: "GET",
    });
    const data = await res.json();
    return data.user || data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      tokenStorage.clearToken();
    }
  },
};

// Register refresh implementation to eliminate circular dependency with apiClient
refreshHandler.register(() => authService.refreshAccessToken());