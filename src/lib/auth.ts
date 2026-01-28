//src/lib/auth.ts
import { redirect } from "next/navigation";

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
    
  return {
    id: "Liam Johnson",
    email: "user@example.com",
    emailVerified: false,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  return user;
}
