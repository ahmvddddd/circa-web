// // src/hooks/useAuth.ts
// import { useCallback } from "react";
// import { useAuthStore } from "@/store/useAuthStore";
// import { authService } from "@/lib/services/authService";
// import { tokenStorage } from "@/lib/api/auth/token-storage";
// import { LoginCredentials, RegisterCredentials } from "@/types/auth";
// import { ApiError } from "@/lib/api/error-handler";

// let inFlightInitPromise: Promise<void> | null = null;

// export function useAuth() {
//   const user = useAuthStore((state) => state.user);
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const isLoading = useAuthStore((state) => state.isLoading);
//   const isInitialized = useAuthStore((state) => state.isInitialized);
//   const initializationError = useAuthStore((state) => state.initializationError);

//   const startOperation = useAuthStore((state) => state.startOperation);
//   const setUser = useAuthStore((state) => state.setUser);
//   const setLoading = useAuthStore((state) => state.setLoading);
//   const setInitialized = useAuthStore((state) => state.setInitialized);
//   const setInitializationError = useAuthStore((state) => state.setInitializationError);
//   const clearAuth = useAuthStore((state) => state.clearAuth);

//   const login = useCallback(
//     async (credentials: LoginCredentials) => {
//       const startGen = startOperation();
//       setLoading(true);
//       try {
//         const res = await authService.login(credentials);
//         const profile = await authService.getCurrentUser();

//         if (useAuthStore.getState().operationGen === startGen) {
//           setUser(profile);
//           setInitialized(true);
//         }
//         return res;
//       } catch (error) {
//         if (useAuthStore.getState().operationGen === startGen) {
//           clearAuth();
//         }
//         throw error;
//       } finally {
//         if (useAuthStore.getState().operationGen === startGen) {
//           setLoading(false);
//         }
//       }
//     },
//     [startOperation, setUser, setLoading, clearAuth, setInitialized]
//   );

//   const register = useCallback(
//     async (credentials: RegisterCredentials) => {
//       const startGen = startOperation();
//       setLoading(true);
//       try {
//         const res = await authService.register(credentials);
//         return res;
//       } finally {
//         if (useAuthStore.getState().operationGen === startGen) {
//           setLoading(false);
//         }
//       }
//     },
//     [startOperation, setLoading]
//   );

//   const logout = useCallback(async () => {
//     // Invalidate pending operations immediately upon calling logout
//     const startGen = startOperation();
//     clearAuth();
//     setLoading(true);
//     setInitialized(true);
//     try {
//       await authService.logout();
//     } catch {
//       // Ignore network errors on logout since local state is already cleared
//     } finally {
//       if (useAuthStore.getState().operationGen === startGen) {
//         setLoading(false);
//       }
//     }
//   }, [startOperation, clearAuth, setLoading, setInitialized]);

//   const initializeAuth = useCallback(async () => {
//     if (isInitialized) return;
//     if (inFlightInitPromise) return inFlightInitPromise;

//     const startGen = startOperation();

//     inFlightInitPromise = (async () => {
//       setLoading(true);
//       setInitializationError(null);
//       try {
//         const userProfile = await authService.getCurrentUser();
//         if (useAuthStore.getState().operationGen === startGen) {
//           setUser(userProfile);
//           setInitialized(true);
//         }
//       } catch (err: unknown) {
//         if (useAuthStore.getState().operationGen === startGen) {
//           if (err instanceof ApiError && err.status === 401) {
//             tokenStorage.clearToken();
//             clearAuth();
//             setInitialized(true);
//           } else {
//             // Temporary service/network failure: populate error state and stop loading
//             setInitializationError(err instanceof Error ? err : new Error(String(err)));
//           }
//         }
//       } finally {
//         if (useAuthStore.getState().operationGen === startGen) {
//           setLoading(false);
//         }
//         inFlightInitPromise = null;
//       }
//     })();

//     return inFlightInitPromise;
//   }, [isInitialized, startOperation, setUser, clearAuth, setLoading, setInitialized, setInitializationError]);

//   return {
//     user,
//     isAuthenticated,
//     isLoading,
//     isInitialized,
//     initializationError,
//     login,
//     register,
//     logout,
//     initializeAuth,
//   };
// }


// src/hooks/useAuth.ts
import { useCallback } from "react";
import { authService } from "@/lib/services/authService";
import { tokenStorage } from "@/lib/api/auth/token-storage";
import { LoginCredentials, RegisterCredentials } from "@/types/auth";
import { ApiError } from "@/lib/api/error-handler";
import { useAuthStore, AuthState } from "../store/useAuthStore";

let inFlightInitPromise: Promise<void> | null = null;

export function useAuth() {
  const user = useAuthStore((state: AuthState) => state.user);
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
  const isLoading = useAuthStore((state: AuthState) => state.isLoading);
  const isInitialized = useAuthStore((state: AuthState) => state.isInitialized);
  const initializationError = useAuthStore((state: AuthState) => state.initializationError);

  const startOperation = useAuthStore((state: AuthState) => state.startOperation);
  const setUser = useAuthStore((state: AuthState) => state.setUser);
  const setLoading = useAuthStore((state: AuthState) => state.setLoading);
  const setInitialized = useAuthStore((state: AuthState) => state.setInitialized);
  const setInitializationError = useAuthStore((state: AuthState) => state.setInitializationError);
  const clearAuth = useAuthStore((state: AuthState) => state.clearAuth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const startGen = startOperation();
      setLoading(true);
      try {
        const res = await authService.login(credentials);
        const profile = await authService.getCurrentUser();

        if (useAuthStore.getState().operationGen === startGen) {
          setUser(profile);
          setInitialized(true);
        }
        return res;
      } catch (error) {
        if (useAuthStore.getState().operationGen === startGen) {
          clearAuth();
        }
        throw error;
      } finally {
        if (useAuthStore.getState().operationGen === startGen) {
          setLoading(false);
        }
      }
    },
    [startOperation, setUser, setLoading, clearAuth, setInitialized]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const startGen = startOperation();
      setLoading(true);
      try {
        const res = await authService.register(credentials);
        return res;
      } finally {
        if (useAuthStore.getState().operationGen === startGen) {
          setLoading(false);
        }
      }
    },
    [startOperation, setLoading]
  );

  const logout = useCallback(async () => {
    // Invalidate pending operations immediately upon calling logout
    const startGen = startOperation();
    clearAuth();
    setLoading(true);
    setInitialized(true);
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout since local state is already cleared
    } finally {
      if (useAuthStore.getState().operationGen === startGen) {
        setLoading(false);
      }
    }
  }, [startOperation, clearAuth, setLoading, setInitialized]);

  const initializeAuth = useCallback(async () => {
    if (isInitialized) return;
    if (inFlightInitPromise) return inFlightInitPromise;

    const startGen = startOperation();

    inFlightInitPromise = (async () => {
      setLoading(true);
      setInitializationError(null);
      try {
        const userProfile = await authService.getCurrentUser();
        if (useAuthStore.getState().operationGen === startGen) {
          setUser(userProfile);
          setInitialized(true);
        }
      } catch (err: unknown) {
        if (useAuthStore.getState().operationGen === startGen) {
          if (err instanceof ApiError && err.status === 401) {
            tokenStorage.clearToken();
            clearAuth();
            setInitialized(true);
          } else {
            // Temporary service/network failure: populate error state and stop loading
            setInitializationError(err instanceof Error ? err : new Error(String(err)));
          }
        }
      } finally {
        if (useAuthStore.getState().operationGen === startGen) {
          setLoading(false);
        }
        inFlightInitPromise = null;
      }
    })();

    return inFlightInitPromise;
  }, [isInitialized, startOperation, setUser, clearAuth, setLoading, setInitialized, setInitializationError]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    initializationError,
    login,
    register,
    logout,
    initializeAuth,
  };
}