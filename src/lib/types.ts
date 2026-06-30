export type Shift = "day" | "night";

export interface Teacher {
  id: string;
  name: string;
  rateDay: number;
  rateNight: number;
  note?: string;
}

export interface Session {
  id: string;
  teacherId: string;
  date: string; // ISO yyyy-MM-dd
  shift: Shift;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hours: number;
  subject?: string;
  note?: string;
}