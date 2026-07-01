/** Kỳ báo cáo – tuần/tháng năm 2026 (trùng lịch trung tâm). */
export const REPORT_YEAR = 2026;

export const REPORT_WEEKS = [
  { value: "1", label: "Tuần 1 (1/6 - 7/6)", from: "2026-06-01", to: "2026-06-07" },
  { value: "2", label: "Tuần 2 (8/6 - 14/6)", from: "2026-06-08", to: "2026-06-14" },
  { value: "3", label: "Tuần 3 (15/6 - 21/6)", from: "2026-06-15", to: "2026-06-21" },
  { value: "4", label: "Tuần 4 (22/6 - 28/6)", from: "2026-06-22", to: "2026-06-28" },
  { value: "5", label: "Tuần 5 (29/6 - 5/7)", from: "2026-06-29", to: "2026-07-05" },
] as const;

export const REPORT_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  const mm = String(month).padStart(2, "0");
  const lastDay = new Date(REPORT_YEAR, month, 0).getDate();
  const dd = String(lastDay).padStart(2, "0");
  return {
    value: String(month),
    label: `Tháng ${month}`,
    from: `${REPORT_YEAR}-${mm}-01`,
    // Kỳ lương "Tháng 6" của trung tâm = tuần 1–5 (1/6 → 5/7), không cắt ở 30/6.
    // Nếu không, các buổi 1–5/7 thuộc tuần 5 sẽ bị bỏ khỏi báo cáo tháng.
    to: month === 6 ? REPORT_WEEKS[REPORT_WEEKS.length - 1].to : `${REPORT_YEAR}-${mm}-${dd}`,
  };
});

export function getWeekPeriod(week: string) {
  return REPORT_WEEKS.find((w) => w.value === week) ?? REPORT_WEEKS[4];
}

export function getMonthPeriod(month: string) {
  return REPORT_MONTHS.find((m) => m.value === month) ?? REPORT_MONTHS[5];
}

/** Các tuần trong tháng 6 (dùng cho bảng chi tiết theo tháng). */
export function weeksInMonth(month: string) {
  if (month !== "6") return [];
  return REPORT_WEEKS.map((w) => ({
    from: w.from,
    to: w.to,
    label: w.label,
  }));
}
