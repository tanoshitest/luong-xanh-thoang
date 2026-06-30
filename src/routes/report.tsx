import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSessions, useTeachers } from "@/lib/store";
import { formatNumber, formatVND } from "@/lib/format";
import {
  REPORT_MONTHS,
  REPORT_WEEKS,
  getMonthPeriod,
  getWeekPeriod,
  weeksInMonth,
} from "@/lib/periods";
import { computePayroll } from "@/lib/payroll";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Báo cáo lương – Báo cáo lương dạy" }] }),
  component: ReportPage,
});

function ReportPage() {
  const teachers = useTeachers();
  const sessions = useSessions();

  const [period, setPeriod] = useState<"week" | "month">("week");
  const [filterWeek, setFilterWeek] = useState("5");
  const [filterMonth, setFilterMonth] = useState("6");
  const [teacherId, setTeacherId] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { from, to } = useMemo(() => {
    if (period === "week") {
      const w = getWeekPeriod(filterWeek);
      return { from: w.from, to: w.to };
    }
    const m = getMonthPeriod(filterMonth);
    return { from: m.from, to: m.to };
  }, [period, filterWeek, filterMonth]);

  const rows = useMemo(
    () => computePayroll(teachers, sessions, from, to, teacherId),
    [teachers, sessions, from, to, teacherId],
  );

  const totals = rows.reduce(
    (acc, r) => {
      acc.dayHours += r.dayHours;
      acc.nightHours += r.nightHours;
      acc.dayAmount += r.dayAmount;
      acc.nightAmount += r.nightAmount;
      acc.total += r.total;
      return acc;
    },
    { dayHours: 0, nightHours: 0, dayAmount: 0, nightAmount: 0, total: 0 },
  );

  const weekRanges = useMemo(
    () => (period === "month" ? weeksInMonth(filterMonth) : []),
    [period, filterMonth],
  );

  const showWeekly = period === "month" && filterMonth === "6";

  function weeklyForTeacher(tid: string) {
    return weekRanges.map((wr) => {
      const r = computePayroll(teachers, sessions, wr.from, wr.to, tid)[0];
      return { range: wr, row: r };
    });
  }

  return (
    <AppLayout title="Báo cáo lương">
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <Card className="shadow-sm shrink-0">
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs px-3">Theo tuần</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-3">Theo tháng</TabsTrigger>
                </TabsList>
              </Tabs>
              {period === "week" ? (
                <div className="w-44">
                  <Select value={filterWeek} onValueChange={setFilterWeek}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REPORT_WEEKS.map((w) => (
                        <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="w-36">
                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REPORT_MONTHS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="min-w-[10rem] flex-1 max-w-xs">
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả giáo viên</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm shrink-0">
          <CardContent className="px-4 py-3">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {showWeekly && <TableHead className="w-8 h-8 py-1"></TableHead>}
                    <TableHead className="h-8 py-1">Họ tên</TableHead>
                    <TableHead className="h-8 py-1 text-right">Giờ ca ngày</TableHead>
                    <TableHead className="h-8 py-1 text-right">Giờ ca đêm</TableHead>
                    <TableHead className="h-8 py-1 text-right">Lương ca ngày</TableHead>
                    <TableHead className="h-8 py-1 text-right">Lương ca đêm</TableHead>
                    <TableHead className="h-8 py-1 text-right">Tổng lương</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => {
                    const isOpen = !!expanded[r.teacher.id];
                    return (
                      <Fragment key={r.teacher.id}>
                        <TableRow className={`${i % 2 ? "bg-muted/30" : ""} hover:bg-muted/50`}>
                          {showWeekly && (
                            <TableCell className="py-1.5">
                              <button
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  setExpanded((x) => ({ ...x, [r.teacher.id]: !isOpen }))
                                }
                                aria-label="Bung chi tiết theo tuần"
                              >
                                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </button>
                            </TableCell>
                          )}
                          <TableCell className="py-1.5 font-medium">{r.teacher.name}</TableCell>
                          <TableCell className="py-1.5 text-right tabular-nums">{formatNumber(r.dayHours)}</TableCell>
                          <TableCell className="py-1.5 text-right tabular-nums">{formatNumber(r.nightHours)}</TableCell>
                          <TableCell className="py-1.5 text-right tabular-nums">{formatVND(r.dayAmount)}</TableCell>
                          <TableCell className="py-1.5 text-right tabular-nums">{formatVND(r.nightAmount)}</TableCell>
                          <TableCell className="py-1.5 text-right tabular-nums font-semibold">{formatVND(r.total)}</TableCell>
                        </TableRow>
                        {showWeekly && isOpen && (
                          <TableRow className="bg-muted/20 hover:bg-muted/20">
                            <TableCell className="py-1"></TableCell>
                            <TableCell colSpan={6} className="p-0">
                              <div className="px-3 py-2">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                      <TableHead className="h-7 py-1">Tuần</TableHead>
                                      <TableHead className="h-7 py-1 text-right">Giờ ca ngày</TableHead>
                                      <TableHead className="h-7 py-1 text-right">Giờ ca đêm</TableHead>
                                      <TableHead className="h-7 py-1 text-right">Lương ca ngày</TableHead>
                                      <TableHead className="h-7 py-1 text-right">Lương ca đêm</TableHead>
                                      <TableHead className="h-7 py-1 text-right">Tổng lương</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {weeklyForTeacher(r.teacher.id).map((w) => (
                                      <TableRow key={w.range.from}>
                                        <TableCell className="py-1">{w.range.label}</TableCell>
                                        <TableCell className="py-1 text-right tabular-nums">{formatNumber(w.row?.dayHours ?? 0)}</TableCell>
                                        <TableCell className="py-1 text-right tabular-nums">{formatNumber(w.row?.nightHours ?? 0)}</TableCell>
                                        <TableCell className="py-1 text-right tabular-nums">{formatVND(w.row?.dayAmount ?? 0)}</TableCell>
                                        <TableCell className="py-1 text-right tabular-nums">{formatVND(w.row?.nightAmount ?? 0)}</TableCell>
                                        <TableCell className="py-1 text-right tabular-nums">{formatVND(w.row?.total ?? 0)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                  <TableRow className="border-t-2 font-semibold bg-accent/40 hover:bg-accent/40">
                    {showWeekly && <TableCell className="py-1.5"></TableCell>}
                    <TableCell className="py-1.5">Tổng cộng toàn trung tâm</TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums">{formatNumber(totals.dayHours)}</TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums">{formatNumber(totals.nightHours)}</TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums">{formatVND(totals.dayAmount)}</TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums">{formatVND(totals.nightAmount)}</TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums text-primary">{formatVND(totals.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
