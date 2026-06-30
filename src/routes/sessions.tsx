import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessions, useTeachers } from "@/lib/store";
import {
  MONTH_FILTERS,
  WEEK_FILTERS,
  sessionMonth,
  sessionWeek,
} from "@/lib/sessions-data";
import { formatDateVN, formatNumber, formatVND } from "@/lib/format";
import { sessionAmount } from "@/lib/payroll";

export const Route = createFileRoute("/sessions")({
  head: () => ({ meta: [{ title: "Nhật ký đứng lớp – Báo cáo lương dạy" }] }),
  component: SessionsPage,
});

function SessionsPage() {
  const teachers = useTeachers();
  const sessions = useSessions();

  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterWeek, setFilterWeek] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const teacherById = useMemo(
    () => Object.fromEntries(teachers.map((t) => [t.id, t])),
    [teachers],
  );

  const filtered = useMemo(() => {
    return sessions
      .filter((s) => filterTeacher === "all" || s.teacherId === filterTeacher)
      .filter((s) => filterWeek === "all" || sessionWeek(s) === filterWeek)
      .filter((s) => filterMonth === "all" || sessionMonth(s) === filterMonth)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [sessions, filterTeacher, filterWeek, filterMonth]);

  return (
    <AppLayout title="Nhật ký đứng lớp">
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <Card className="shadow-sm shrink-0">
          <CardContent className="pt-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Giáo viên</Label>
                <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tuần</Label>
                <Select value={filterWeek} onValueChange={setFilterWeek}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WEEK_FILTERS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tháng</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTH_FILTERS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
          <CardContent className="pt-6 flex-1 min-h-0 overflow-y-auto">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Giáo viên</TableHead>
                    <TableHead>Ca</TableHead>
                    <TableHead>Giờ</TableHead>
                    <TableHead className="text-right">Số giờ</TableHead>
                    <TableHead>Lớp/Môn</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                        Không có buổi dạy nào.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((s, i) => {
                    const t = teacherById[s.teacherId];
                    return (
                      <TableRow key={s.id} className={i % 2 ? "bg-muted/30" : ""}>
                        <TableCell>{formatDateVN(s.date)}</TableCell>
                        <TableCell className="font-medium">{t?.name ?? "—"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${s.shift === "day" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                            {s.shift === "day" ? "Ngày" : "Đêm"}
                          </span>
                        </TableCell>
                        <TableCell className="tabular-nums text-sm text-muted-foreground">
                          {s.startTime}–{s.endTime}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatNumber(s.hours)}</TableCell>
                        <TableCell>{s.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.note}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatVND(sessionAmount(s, t))}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
