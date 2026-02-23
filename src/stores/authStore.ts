//src/stores.authStore.ts
type AuthState = {
  accessToken: string | null;
  isGroupAdmin: boolean;
};

let state: AuthState = {
  accessToken: null,
  isGroupAdmin: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const authStore = {
  
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getAccessToken() {
    return state.accessToken;
  },

  setAccessToken(token: string | null) {
    state.accessToken = token;
    emit();
  },

  getIsGroupAdmin() {
    return state.isGroupAdmin;
  },

  setIsGroupAdmin(value: boolean) {
    state.isGroupAdmin = value;
    emit();
  },

  clear() {
    state = {
      accessToken: null,
      isGroupAdmin: false,
    };
    emit();
  },
};