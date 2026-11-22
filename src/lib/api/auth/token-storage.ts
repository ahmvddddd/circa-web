// src/lib/api/auth/token-storage.ts

let inMemoryAccessToken: string | null = null;
let tokenGeneration: number = 0;

export const tokenStorage = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string | null, expectedGen?: number): boolean {
    if (expectedGen !== undefined && expectedGen < tokenGeneration) {
      // Stale token write attempt after session clearance, reject write
      return false;
    }
    inMemoryAccessToken = token;
    tokenGeneration++; // Increment generation when a new valid token is successfully committed
    return true;
  },

  clearToken(): void {
    inMemoryAccessToken = null;
    tokenGeneration++;
  },

  getTokenGeneration(): number {
    return tokenGeneration;
  },
};