import { useSyncExternalStore } from "react";
import { BASE_SESSIONS, isBaseSession } from "./sessions-data";
import { TEACHERS } from "./teachers-data";
import type { Session } from "./types";

const SESSIONS_KEY = "tt_sessions_v2";

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const emit = () => listeners.forEach((l) => l());

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// --- Snapshot caching to keep useSyncExternalStore stable ---
let sessionsSnap: Session[] | null = null;
listeners.add(() => {
  sessionsSnap = null;
});
function getCustomSessions(): Session[] {
  return read<Session[]>(SESSIONS_KEY, []);
}

function getSessions(): Session[] {
  if (sessionsSnap) return sessionsSnap;
  sessionsSnap = [...BASE_SESSIONS, ...getCustomSessions()];
  return sessionsSnap;
}

const EMPTY: any[] = [];

export function useTeachers() {
  return TEACHERS;
}

export function useSessions(): Session[] {
  return useSyncExternalStore(
    subscribe,
    getSessions,
    () => EMPTY as Session[],
  );
}

export const sessionsApi = {
  add(s: Omit<Session, "id">) {
    write(SESSIONS_KEY, [...getCustomSessions(), { ...s, id: uid() }]);
  },
  addMany(rows: Omit<Session, "id">[]) {
    const withIds = rows.map((r) => ({ ...r, id: uid() }));
    write(SESSIONS_KEY, [...getCustomSessions(), ...withIds]);
  },
  update(id: string, patch: Partial<Session>) {
    if (isBaseSession(id)) return;
    write(
      SESSIONS_KEY,
      getCustomSessions().map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
  },
  remove(id: string) {
    if (isBaseSession(id)) return;
    write(
      SESSIONS_KEY,
      getCustomSessions().filter((x) => x.id !== id),
    );
  },
};

export function seedIfEmpty() {
  // Buổi dạy cố định trong sessions-data.ts; không seed dữ liệu mẫu.
}