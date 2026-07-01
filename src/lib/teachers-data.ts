import type { Teacher } from "./types";

/** Danh sách giáo viên và đơn giá cố định (VND/giờ). */
export const TEACHERS: Teacher[] = [
  { id: "t-huong", name: "Hường", rateDay: 128_571, rateNight: 150_000 },
  { id: "t-khoi", name: "Khôi", rateDay: 142_857, rateNight: 0 },
  { id: "t-lan-nhu", name: "Lan Như", rateDay: 266_667, rateNight: 0 },
  { id: "t-hanh", name: "Hạnh", rateDay: 150_000, rateNight: 150_000 },
  { id: "t-man", name: "Mẫn", rateDay: 66_667, rateNight: 110_000 },
  { id: "t-quynh", name: "Quỳnh", rateDay: 66_667, rateNight: 110_000 },
  { id: "t-chau", name: "Châu", rateDay: 66_667, rateNight: 110_000 },
  { id: "t-trong", name: "Trọng", rateDay: 66_667, rateNight: 110_000 },
  { id: "t-hien", name: "Hiền", rateDay: 56_667, rateNight: 110_000 },
  { id: "t-oanh", name: "Oanh", rateDay: 166_667, rateNight: 120_000 },
  { id: "t-konishi", name: "Konishi", rateDay: 250_000, rateNight: 0 },
];

export function getTeacherById(id: string): Teacher | undefined {
  return TEACHERS.find((t) => t.id === id);
}
