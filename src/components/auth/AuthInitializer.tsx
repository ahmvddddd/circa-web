// src/components/auth/AuthInitializer.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}