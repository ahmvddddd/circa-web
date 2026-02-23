//src/lib/auth/refreshAccessToken.ts
import { authStore } from "@/stores/authStore";
export async function refreshAccessToken() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    // if (!res.ok) {
    //   authStore.clear();
    //   return false;
    // }
    if (res.status === 401) {
      return false; // do not auto-clear
    }
    
    if (!res.ok) {
      return false;
    }

    const data = await res.json();
    authStore.setAccessToken(data.accessToken);
    return true;
  } catch {
    authStore.clear();
    return false;
  }
}