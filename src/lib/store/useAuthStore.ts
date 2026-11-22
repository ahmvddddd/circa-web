// src/lib/store/useAuthStore.ts
import { create } from "zustand";
import { User } from "@/types/auth";
import { sessionEvents } from "@/lib/api/auth/session-events";

// 1. Add 'export' here
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  initializationError: Error | null;
  operationGen: number;

  startOperation: () => number;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  setInitializationError: (error: Error | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  initializationError: null,
  operationGen: 0,

  startOperation: () => {
    const nextGen = get().operationGen + 1;
    set({ operationGen: nextGen, initializationError: null });
    return nextGen;
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      initializationError: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: (isInitialized) => set({ isInitialized }),

  setInitializationError: (initializationError) => set({ initializationError }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      initializationError: null,
    }),
}));

sessionEvents.onSessionExpired(() => {
  useAuthStore.getState().clearAuth();
});