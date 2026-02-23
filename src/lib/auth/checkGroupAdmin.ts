// //src/lib/auth/checkGroupAdmin.ts
// import { authStore } from "@/stores/authStore";

// export async function checkGroupAdmin() {
//   const token = authStore.getAccessToken();
//   if (!token) return false;

//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-admin/check-admin`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       credentials: "include",
//     }
//   );

//   if (!res.ok) {
//     authStore.setIsGroupAdmin(false);
//     return false;
//   }

//   authStore.setIsGroupAdmin(true);
//   return true;
// }

// src/lib/auth/checkGroupAdmin.ts
import { authStore } from "@/stores/authStore";
import { authenticationFetch } from "@/lib/auth/authenticationFetch";

export async function checkGroupAdmin() {
  try {
    const res = await authenticationFetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-admin/check-admin`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      authStore.setIsGroupAdmin(false);
      return false;
    }

    authStore.setIsGroupAdmin(true);
    return true;
  } catch {
    authStore.setIsGroupAdmin(false);
    return false;
  }
}