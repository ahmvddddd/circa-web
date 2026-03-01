// // src/lib/auth/authenticationFetch.ts

// import { authStore } from "@/stores/authStore";
// import { refreshAccessToken } from "@/lib/auth/refreshAccessToken";

// export async function authenticationFetch(
//   input: RequestInfo,
//   init: RequestInit = {}
// ) {
//   const token = authStore.getAccessToken();

//   const makeRequest = async (accessToken: string | null) => {
//     return fetch(input, {
//       ...init,
//       credentials: "include",
//       headers: {
//         ...(init.headers || {}),
//         ...(accessToken
//           ? { Authorization: `Bearer ${accessToken}` }
//           : {}),
//       },
//     });
//   };

//   let response = await makeRequest(token);

//   if (
//   response.status === 401 &&
//   !input.toString().includes("/auth/refresh")
// ) {
//     const refreshed = await refreshAccessToken();

//     if (!refreshed) {
//       return response;
//     }

//     const newToken = authStore.getAccessToken();
//     response = await makeRequest(newToken);
//   }

//   return response;
// };



//src/lib/auth/authenticationFetch.ts

import { authStore } from "@/stores/authStore";
import { refreshAccessToken } from "@/lib/auth/refreshAccessToken";

export async function authenticationFetch(
  input: RequestInfo,
  init: RequestInit = {}
) {
  const tryRequest = async (token: string | null) => {
    return fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  let accessToken = authStore.getAccessToken();

  // 1️⃣ If no token in memory, try silent refresh FIRST
  if (!accessToken) {
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      const err: any = new Error("UNAUTHENTICATED");
      err.status = 401;
      throw err;
    }

    accessToken = authStore.getAccessToken();
  }

  // 2️⃣ First attempt with current token
  let res = await tryRequest(accessToken);

  if (res.status !== 401) {
    return res;
  }

  // 3️⃣ Token rejected → try one more refresh, then retry once
  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    const err: any = new Error("UNAUTHENTICATED");
    err.status = 401;
    throw err;
  }

  const newToken = authStore.getAccessToken();
  return tryRequest(newToken);
}