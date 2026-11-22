// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface LoginUser {
  id: string;
  email: string;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: LoginUser;
}

export type RefreshResult = "REFRESHED" | "SESSION_EXPIRED" | "TEMPORARILY_UNAVAILABLE" | "SUPERSEDED";