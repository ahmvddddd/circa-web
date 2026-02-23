// src/lib/auth/authenticationFetch.ts

import { authStore } from "@/stores/authStore";
import { refreshAccessToken } from "@/lib/auth/refreshAccessToken";

export async function authenticationFetch(
  input: RequestInfo,
  init: RequestInit = {}
) {
  const token = authStore.getAccessToken();

  const makeRequest = async (accessToken: string | null) => {
    return fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.headers || {}),
        ...(accessToken
          ? { Authorization: "Bearer ${accessToken}" }
          : {}),
      },
    });
  };

  // First attempt
  let response = await makeRequest(token);

  // If access token expired, attempt refresh once
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      return response; // still unauthenticated
    }

    const newToken = authStore.getAccessToken();
    response = await makeRequest(newToken);
  }

  return response;
};