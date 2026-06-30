import type { Session, Teacher } from "./types";

export interface TeacherPayroll {
  teacher: Teacher;
  dayHours: number;
  nightHours: number;
  totalHours: number;
  dayAmount: number;
  nightAmount: number;
  total: number;
  sessionCount: number;
}

export function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

export function computePayroll(
  teachers: Teacher[],
  sessions: Session[],
  from: string,
  to: string,
  teacherId?: string,
): TeacherPayroll[] {
  const filtered = sessions.filter(
    (s) =>
      inRange(s.date, from, to) &&
      (!teacherId || teacherId === "all" || s.teacherId === teacherId),
  );
  const list = teacherId && teacherId !== "all"
    ? teachers.filter((t) => t.id === teacherId)
    : teachers;

  return list
    .map((teacher) => {
      const own = filtered.filter((s) => s.teacherId === teacher.id);
      let dayHours = 0;
      let nightHours = 0;
      let dayAmount = 0;
      let nightAmount = 0;
      for (const s of own) {
        if (s.shift === "day") {
          dayHours += s.hours;
          dayAmount += s.hours * teacher.rateDay;
        } else {
          nightHours += s.hours;
          nightAmount += s.hours * teacher.rateNight;
        }
      }
      return {
        teacher,
        dayHours,
        nightHours,
        totalHours: dayHours + nightHours,
        dayAmount,
        nightAmount,
        total: dayAmount + nightAmount,
        sessionCount: own.length,
      };
    })
    .filter((p) => p.sessionCount > 0 || (teacherId && teacherId !== "all"));
}

export function sessionAmount(s: Session, teacher: Teacher | undefined): number {
  if (!teacher) return 0;
  return s.hours * (s.shift === "day" ? teacher.rateDay : teacher.rateNight);
}