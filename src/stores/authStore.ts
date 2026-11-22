// // src/store/useAuthStore.ts
// import { create } from "zustand";
// import { User } from "@/types/auth";
// import { sessionEvents } from "@/lib/api/auth/session-events";

// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   isInitialized: boolean;

//   setUser: (user: User | null) => void;
//   setLoading: (isLoading: boolean) => void;
//   setInitialized: (isInitialized: boolean) => void;
//   clearAuth: () => void;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   isAuthenticated: false,
//   isLoading: true,
//   isInitialized: false,

//   setUser: (user) =>
//     set({
//       user,
//       isAuthenticated: !!user,
//       isLoading: false,
//     }),

//   setLoading: (isLoading) => set({ isLoading }),

//   setInitialized: (isInitialized) => set({ isInitialized }),

//   clearAuth: () =>
//     set({
//       user: null,
//       isAuthenticated: false,
//       isLoading: false,
//     }),
// }));

// // Automatically clear auth state when session expiration is signaled from apiClient/authService
// sessionEvents.onSessionExpired(() => {
//   useAuthStore.getState().clearAuth();
// });

// src/stores/authStore.ts

type AuthState = {
  accessToken: string | null;
  isGroupAdmin: boolean;
  authReady: boolean; // 👈 NEW
};

let state: AuthState = {
  accessToken: null,
  isGroupAdmin: false,
  authReady: false, // 👈 NEW
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const authStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {listeners.delete(listener)};
  },

  // ---- access token ----
  getAccessToken() {
    return state.accessToken;
  },

  setAccessToken(token: string | null) {
    state.accessToken = token;
    emit();
  },

  // ---- group admin ----
  getIsGroupAdmin() {
    return state.isGroupAdmin;
  },

  setIsGroupAdmin(value: boolean) {
    state.isGroupAdmin = value;
    emit();
  },

  // ---- auth ready ----
  getAuthReady() {
    return state.authReady;
  },

  setAuthReady(value: boolean) {
    state.authReady = value;
    emit();
  },

  // ---- reset ----
  clear() {
    state = {
      accessToken: null,
      isGroupAdmin: false,
      authReady: false, // 👈 IMPORTANT: reset this too
    };
    emit();
  },
};