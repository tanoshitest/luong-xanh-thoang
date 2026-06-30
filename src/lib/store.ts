import { useSyncExternalStore } from "react";
import type { Teacher, Session } from "./types";

const TEACHERS_KEY = "tt_teachers_v1";
const SESSIONS_KEY = "tt_sessions_v1";

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
let teachersSnap: Teacher[] | null = null;
let sessionsSnap: Session[] | null = null;
listeners.add(() => {
  teachersSnap = null;
  sessionsSnap = null;
});

function getTeachers(): Teacher[] {
  if (teachersSnap) return teachersSnap;
  teachersSnap = read<Teacher[]>(TEACHERS_KEY, []);
  return teachersSnap;
}
function getSessions(): Session[] {
  if (sessionsSnap) return sessionsSnap;
  sessionsSnap = read<Session[]>(SESSIONS_KEY, []);
  return sessionsSnap;
}

const EMPTY: any[] = [];

export function useTeachers(): Teacher[] {
  return useSyncExternalStore(
    subscribe,
    getTeachers,
    () => EMPTY as Teacher[],
  );
}

export function useSessions(): Session[] {
  return useSyncExternalStore(
    subscribe,
    getSessions,
    () => EMPTY as Session[],
  );
}

export const teachersApi = {
  add(t: Omit<Teacher, "id">) {
    const list = getTeachers();
    write(TEACHERS_KEY, [...list, { ...t, id: uid() }]);
  },
  update(id: string, patch: Partial<Teacher>) {
    const list = getTeachers().map((x) => (x.id === id ? { ...x, ...patch } : x));
    write(TEACHERS_KEY, list);
  },
  remove(id: string) {
    write(
      TEACHERS_KEY,
      getTeachers().filter((x) => x.id !== id),
    );
    // Also remove sessions of that teacher
    write(
      SESSIONS_KEY,
      getSessions().filter((s) => s.teacherId !== id),
    );
  },
};

export const sessionsApi = {
  add(s: Omit<Session, "id">) {
    write(SESSIONS_KEY, [...getSessions(), { ...s, id: uid() }]);
  },
  addMany(rows: Omit<Session, "id">[]) {
    const withIds = rows.map((r) => ({ ...r, id: uid() }));
    write(SESSIONS_KEY, [...getSessions(), ...withIds]);
  },
  update(id: string, patch: Partial<Session>) {
    write(
      SESSIONS_KEY,
      getSessions().map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
  },
  remove(id: string) {
    write(
      SESSIONS_KEY,
      getSessions().filter((x) => x.id !== id),
    );
  },
};

// Seed once on first load to make the UI inviting
export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(TEACHERS_KEY)) return;
  const t1: Teacher = { id: uid(), name: "Nguyễn Thị Lan", rateDay: 150000, rateNight: 180000, note: "Toán" };
  const t2: Teacher = { id: uid(), name: "Trần Văn Minh", rateDay: 160000, rateNight: 200000, note: "Tiếng Anh" };
  const t3: Teacher = { id: uid(), name: "Phạm Thu Hà", rateDay: 140000, rateNight: 170000, note: "Văn" };
  window.localStorage.setItem(TEACHERS_KEY, JSON.stringify([t1, t2, t3]));

  const today = new Date();
  const iso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };
  const dayOffset = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return iso(d);
  };
  const seed: Session[] = [
    { id: uid(), teacherId: t1.id, date: dayOffset(1), shift: "day", startTime: "08:00", endTime: "11:00", hours: 3, subject: "Toán 9" },
    { id: uid(), teacherId: t1.id, date: dayOffset(3), shift: "night", startTime: "18:00", endTime: "20:00", hours: 2, subject: "Toán 10" },
    { id: uid(), teacherId: t2.id, date: dayOffset(2), shift: "day", startTime: "09:00", endTime: "11:30", hours: 2.5, subject: "IELTS" },
    { id: uid(), teacherId: t2.id, date: dayOffset(0), shift: "night", startTime: "19:00", endTime: "21:00", hours: 2, subject: "IELTS" },
    { id: uid(), teacherId: t3.id, date: dayOffset(4), shift: "day", startTime: "14:00", endTime: "16:00", hours: 2, subject: "Văn 12" },
    { id: uid(), teacherId: t3.id, date: dayOffset(5), shift: "night", startTime: "19:30", endTime: "21:30", hours: 2, subject: "Văn 11" },
  ];
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(seed));
}