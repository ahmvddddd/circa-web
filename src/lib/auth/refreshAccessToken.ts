// // src/lib/auth/refreshAccessToken.ts
// import { authStore } from "@/stores/authStore";

// export async function refreshAccessToken() {
//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
//       {
//         method: "POST",
//         credentials: "include",
//       }
//     );

//     if (!res.ok) {
//       const body = await res.json().catch(() => null);
//       console.log("refresh /auth/refresh failed:", res.status, body);
//       authStore.clear();
//       return false;
//     }

//     const data = await res.json();
//     authStore.setAccessToken(data.accessToken);
//     return true;
//   } catch {
//     authStore.clear();
//     return false;
//   }
// }


// src/lib/auth/refreshAccessToken.ts
import { authStore } from "@/stores/authStore";

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        authStore.clear();
        return false;
      }

      const data = await res.json();
      authStore.setAccessToken(data.accessToken);
      return true;
    } catch {
      authStore.clear();
      return false;
    } finally {
      // Always reset once the refresh is done
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}