// src/lib/api/auth/session-events.ts
type SessionExpiredCallback = () => void;
const listeners: Set<SessionExpiredCallback> = new Set();

export const sessionEvents = {
  onSessionExpired(callback: SessionExpiredCallback) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },
  notifySessionExpired() {
    listeners.forEach((callback) => callback());
  },
};