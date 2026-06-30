import type { Session } from "./types";

const KONISHI = "t-konishi";
const WEEK1_NOTE = "Tuần 1 tháng 6 (1/6 - 7/6)";
const WEEK2_NOTE = "Tuần 2 tháng 6 (8/6 - 14/6)";
const WEEK3_NOTE = "Tuần 3 tháng 6 (15/6 - 21/6)";
const WEEK4_NOTE = "Tuần 4 tháng 6 (22/6 - 28/6)";
const WEEK5_NOTE = "Tuần 5 tháng 6 (29/6 - 5/7)";

/** Nhật ký đứng lớp cố định – Konishi, tháng 6/2026. */
export const BASE_SESSIONS: Session[] = [
  // Tuần 1 – Thứ 3, 02/06
  { id: "s-konishi-ikg9-0602", teacherId: KONISHI, date: "2026-06-02", shift: "day", startTime: "13:00", endTime: "14:00", hours: 1, subject: "IKG9", note: WEEK1_NOTE },
  { id: "s-konishi-ikg10-0602", teacherId: KONISHI, date: "2026-06-02", shift: "day", startTime: "14:00", endTime: "15:00", hours: 1, subject: "IKG10", note: WEEK1_NOTE },
  { id: "s-konishi-lod-0602", teacherId: KONISHI, date: "2026-06-02", shift: "day", startTime: "15:00", endTime: "16:00", hours: 1, subject: "LOD", note: WEEK1_NOTE },
  // Tuần 1 – Thứ 5, 04/06
  { id: "s-konishi-ikg10-0604a", teacherId: KONISHI, date: "2026-06-04", shift: "day", startTime: "08:00", endTime: "09:00", hours: 1, subject: "IKG10", note: WEEK1_NOTE },
  { id: "s-konishi-ikg10-0604b", teacherId: KONISHI, date: "2026-06-04", shift: "day", startTime: "09:00", endTime: "10:00", hours: 1, subject: "IKG10", note: WEEK1_NOTE },
  { id: "s-konishi-ikg9-0604", teacherId: KONISHI, date: "2026-06-04", shift: "day", startTime: "10:30", endTime: "11:30", hours: 1, subject: "IKG9", note: WEEK1_NOTE },
  { id: "s-konishi-ikg11-0604a", teacherId: KONISHI, date: "2026-06-04", shift: "day", startTime: "13:00", endTime: "14:00", hours: 1, subject: "IKG11", note: WEEK1_NOTE },
  { id: "s-konishi-ikg11-0604b", teacherId: KONISHI, date: "2026-06-04", shift: "day", startTime: "14:00", endTime: "15:00", hours: 1, subject: "IKG11", note: WEEK1_NOTE },
  { id: "s-konishi-lod-0604", teacherId: KONISHI, date: "2026-06-04", shift: "day", startTime: "15:00", endTime: "16:00", hours: 1, subject: "LOD", note: WEEK1_NOTE },
  // Tuần 2 – Thứ 3, 09/06
  { id: "s-konishi-lod-0609", teacherId: KONISHI, date: "2026-06-09", shift: "day", startTime: "13:00", endTime: "14:00", hours: 1, subject: "LOD", note: WEEK2_NOTE },
  { id: "s-konishi-ikg9-0609", teacherId: KONISHI, date: "2026-06-09", shift: "day", startTime: "15:00", endTime: "16:00", hours: 1, subject: "IKG9", note: WEEK2_NOTE },
  // Tuần 2 – Thứ 5, 11/06
  { id: "s-konishi-ikg9-0611", teacherId: KONISHI, date: "2026-06-11", shift: "day", startTime: "08:00", endTime: "09:00", hours: 1, subject: "IKG9", note: WEEK2_NOTE },
  { id: "s-konishi-ikg10-0611", teacherId: KONISHI, date: "2026-06-11", shift: "day", startTime: "09:00", endTime: "10:00", hours: 1, subject: "IKG10", note: WEEK2_NOTE },
  { id: "s-konishi-ikg11-0611a", teacherId: KONISHI, date: "2026-06-11", shift: "day", startTime: "10:30", endTime: "11:30", hours: 1, subject: "IKG11", note: WEEK2_NOTE },
  { id: "s-konishi-ikg-nguon-0611", teacherId: KONISHI, date: "2026-06-11", shift: "day", startTime: "13:00", endTime: "14:00", hours: 1, subject: "IKG Nguồn", note: WEEK2_NOTE },
  { id: "s-konishi-ikg11-0611b", teacherId: KONISHI, date: "2026-06-11", shift: "day", startTime: "14:00", endTime: "15:00", hours: 1, subject: "IKG11", note: WEEK2_NOTE },
  { id: "s-konishi-lod-0611", teacherId: KONISHI, date: "2026-06-11", shift: "day", startTime: "15:00", endTime: "16:00", hours: 1, subject: "LOD", note: WEEK2_NOTE },
  // Tuần 3 – Thứ 3, 16/06
  { id: "s-konishi-lod-0616", teacherId: KONISHI, date: "2026-06-16", shift: "day", startTime: "13:00", endTime: "14:00", hours: 1, subject: "LOD", note: WEEK3_NOTE },
  { id: "s-konishi-ikg9-0616", teacherId: KONISHI, date: "2026-06-16", shift: "day", startTime: "14:00", endTime: "15:00", hours: 1, subject: "IKG9", note: WEEK3_NOTE },
  { id: "s-konishi-ikg10-0616", teacherId: KONISHI, date: "2026-06-16", shift: "day", startTime: "15:00", endTime: "16:00", hours: 1, subject: "IKG10", note: WEEK3_NOTE },
  // Tuần 3 – Thứ 5, 18/06
  { id: "s-konishi-ikg9-0618", teacherId: KONISHI, date: "2026-06-18", shift: "day", startTime: "08:00", endTime: "09:00", hours: 1, subject: "IKG9", note: WEEK3_NOTE },
  { id: "s-konishi-ikg10-0618", teacherId: KONISHI, date: "2026-06-18", shift: "day", startTime: "09:00", endTime: "10:00", hours: 1, subject: "IKG10", note: WEEK3_NOTE },
  { id: "s-konishi-ikg11-0618a", teacherId: KONISHI, date: "2026-06-18", shift: "day", startTime: "10:30", endTime: "11:30", hours: 1, subject: "IKG11", note: WEEK3_NOTE },
  { id: "s-konishi-lod-0618", teacherId: KONISHI, date: "2026-06-18", shift: "day", startTime: "13:00", endTime: "14:00", hours: 1, subject: "LOD", note: WEEK3_NOTE },
  { id: "s-konishi-ikg11-0618b", teacherId: KONISHI, date: "2026-06-18", shift: "day", startTime: "14:00", endTime: "15:00", hours: 1, subject: "IKG11", note: WEEK3_NOTE },
  { id: "s-konishi-ikg-nguon-0618", teacherId: KONISHI, date: "2026-06-18", shift: "day", startTime: "15:00", endTime: "16:00", hours: 1, subject: "IKG Nguồn", note: WEEK3_NOTE },
  // Tuần 4 – Thứ 3, 23/06
  { id: "s-konishi-lod-0623", teacherId: KONISHI, date: "2026-06-23", shift: "day", startTime: "13:00", endTime: "14:00", hours: 1, subject: "LOD", note: WEEK4_NOTE },
  { id: "s-konishi-ikg9-0623", teacherId: KONISHI, date: "2026-06-23", shift: "day", startTime: "14:00", endTime: "15:00", hours: 1, subject: "IKG9", note: WEEK4_NOTE },
  { id: "s-konishi-ikg10-0623", teacherId: KONISHI, date: "2026-06-23", shift: "day", startTime: "15:00", endTime: "16:00", hours: 1, subject: "IKG10", note: WEEK4_NOTE },
  // Tuần 4 – Thứ 5, 25/06
  { id: "s-konishi-ikg9-0625a", teacherId: KONISHI, date: "2026-06-25", shift: "day", startTime: "08:00", endTime: "09:00", hours: 1, subject: "IKG9", note: WEEK4_NOTE },
  { id: "s-konishi-ikg9-0625b", teacherId: KONISHI, date: "2026-06-25", shift: "day", startTime: "09:00", endTime: "10:00", hours: 1, subject: "IKG9", note: WEEK4_NOTE },
  { id: "s-konishi-ikg11-0625", teacherId: KONISHI, date: "2026-06-25", shift: "day", startTime: "10:30", endTime: "11:30", hours: 1, subject: "IKG11", note: WEEK4_NOTE },
  { id: "s-konishi-lod-0625", teacherId: KONISHI, date: "2026-06-25", shift: "day", startTime: "13:00", endTime: "14:00", hours: 1, subject: "LOD", note: WEEK4_NOTE },
  { id: "s-konishi-ikg10-0625", teacherId: KONISHI, date: "2026-06-25", shift: "day", startTime: "14:00", endTime: "15:00", hours: 1, subject: "IKG10", note: WEEK4_NOTE },
  { id: "s-konishi-ikg12-0625", teacherId: KONISHI, date: "2026-06-25", shift: "day", startTime: "15:00", endTime: "16:00", hours: 1, subject: "IKG12", note: WEEK4_NOTE },
  // Tuần 5 – Thứ 3, 30/06
  { id: "s-konishi-lod-0630", teacherId: KONISHI, date: "2026-06-30", shift: "day", startTime: "13:00", endTime: "14:00", hours: 1, subject: "LOD", note: WEEK5_NOTE },
  { id: "s-konishi-ikg9-0630", teacherId: KONISHI, date: "2026-06-30", shift: "day", startTime: "14:00", endTime: "15:00", hours: 1, subject: "IKG9", note: WEEK5_NOTE },
  { id: "s-konishi-ikg10-0630", teacherId: KONISHI, date: "2026-06-30", shift: "day", startTime: "15:00", endTime: "16:00", hours: 1, subject: "IKG10", note: WEEK5_NOTE },
];

export function isBaseSession(id: string): boolean {
  return id.startsWith("s-konishi-");
}

export const WEEK_FILTERS = [
  { value: "all", label: "Tất cả tuần" },
  { value: "1", label: "Tuần 1 (1/6 - 7/6)" },
  { value: "2", label: "Tuần 2 (8/6 - 14/6)" },
  { value: "3", label: "Tuần 3 (15/6 - 21/6)" },
  { value: "4", label: "Tuần 4 (22/6 - 28/6)" },
  { value: "5", label: "Tuần 5 (29/6 - 5/7)" },
] as const;

export const MONTH_FILTERS = [
  { value: "all", label: "Tất cả tháng" },
  { value: "2026-06", label: "Tháng 6/2026" },
] as const;

export function sessionWeek(s: Session): string | null {
  const m = s.note?.match(/Tuần (\d+)/);
  return m?.[1] ?? null;
}

export function sessionMonth(s: Session): string {
  return s.date.slice(0, 7);
}
