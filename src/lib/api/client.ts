// src/lib/api/client.ts

import { tokenStorage } from "@/lib/api/auth/token-storage";
import { parseApiError } from "@/lib/api/error-handler";
import { RefreshResult } from "@/types/auth";
import { refreshHandler } from "@/lib/api/auth/refresh-handler";

export class SupersededError extends Error {
  public readonly isSuperseded = true;
  constructor(message = "Request superseded by a newer session operation.") {
    super(message);
    this.name = "SupersededError";
  }
}

interface CustomRequestInit extends RequestInit {
  _isRetry?: boolean;
}

let inFlightRefreshPromise: Promise<RefreshResult> | null = null;

async function executeRefresh(): Promise<RefreshResult> {
  if (!inFlightRefreshPromise) {
    inFlightRefreshPromise = refreshHandler.refresh().finally(() => {
      inFlightRefreshPromise = null;
    });
  }
  return inFlightRefreshPromise;
}

export async function apiClient(
  input: RequestInfo | URL,
  init: CustomRequestInit = {}
): Promise<Response> {
  const { _isRetry = false, ...fetchInit } = init;

  const headers = new Headers(fetchInit.headers || {});

  const token = tokenStorage.getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestOptions: RequestInit = {
    ...fetchInit,
    headers,
    credentials: "include",
  };

  const response = await fetch(input, requestOptions);

  if (response.status === 401 && !_isRetry) {
    const refreshResult = await executeRefresh();

    if (refreshResult === "REFRESHED") {
      const newToken = tokenStorage.getAccessToken();
      const newHeaders = new Headers(fetchInit.headers || {});
      if (newToken) {
        newHeaders.set("Authorization", `Bearer ${newToken}`);
      }

      return apiClient(input, {
        ...fetchInit,
        headers: newHeaders,
        _isRetry: true,
      });
    }

    if (refreshResult === "TEMPORARILY_UNAVAILABLE") {
      throw new Error("Authentication service temporarily unavailable. Please try again.");
    }

    if (refreshResult === "SUPERSEDED") {
      // Throw a specialized superseded error so calling code / global catch blocks 
      // know this error belongs to an obsolete session and must NOT trigger a logout.
      throw new SupersededError();
    }
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response;
}