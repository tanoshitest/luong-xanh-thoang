import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, Wallet, BookOpen } from "lucide-react";
import { useSessions, useTeachers } from "@/lib/store";
import { formatNumber, formatVND } from "@/lib/format";
import {
  REPORT_MONTHS,
  REPORT_WEEKS,
  getMonthPeriod,
  getWeekPeriod,
} from "@/lib/periods";
import { computePayroll } from "@/lib/payroll";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tổng quan – Báo cáo lương dạy" },
      { name: "description", content: "Tổng quan giờ dạy và lương phải trả theo tuần/tháng." },
    ],
  }),
  component: Index,
});

function Index() {
  const teachers = useTeachers();
  const sessions = useSessions();
  const [period, setPeriod] = useState<"week" | "month">("month");
  const [filterWeek, setFilterWeek] = useState("5");
  const [filterMonth, setFilterMonth] = useState("6");

  const { from, to, label } = useMemo(() => {
    if (period === "week") {
      const w = getWeekPeriod(filterWeek);
      return { from: w.from, to: w.to, label: w.label };
    }
    const m = getMonthPeriod(filterMonth);
    return { from: m.from, to: m.to, label: m.label };
  }, [period, filterWeek, filterMonth]);

  const payroll = useMemo(
    () => computePayroll(teachers, sessions, from, to),
    [teachers, sessions, from, to],
  );

  const totalHours = payroll.reduce((a, b) => a + b.totalHours, 0);
  const totalAmount = payroll.reduce((a, b) => a + b.total, 0);
  const totalSessions = payroll.reduce((a, b) => a + b.sessionCount, 0);

  const stats = [
    { label: "Giáo viên", value: String(teachers.length), icon: Users },
    { label: "Tổng giờ dạy kỳ này", value: formatNumber(totalHours), icon: Clock },
    { label: "Tổng lương phải trả", value: formatVND(totalAmount), icon: Wallet },
    { label: "Số buổi dạy", value: String(totalSessions), icon: BookOpen },
  ];

  return (
    <AppLayout title="Tổng quan">
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <Card className="shadow-sm shrink-0">
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Kỳ báo cáo</p>
                  <p className="text-sm font-semibold">{label}</p>
                </div>
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
              </div>
              <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs px-3">Theo tuần</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-3">Theo tháng</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-2">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5"
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[11px] leading-tight text-muted-foreground truncate">{s.label}</p>
                    <p className="text-sm font-semibold tabular-nums leading-tight">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm shrink-0">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold">Tóm tắt lương từng giáo viên</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-8 py-1">Họ tên</TableHead>
                    <TableHead className="h-8 py-1 text-right">Giờ ca ngày</TableHead>
                    <TableHead className="h-8 py-1 text-right">Giờ ca đêm</TableHead>
                    <TableHead className="h-8 py-1 text-right">Lương ca ngày</TableHead>
                    <TableHead className="h-8 py-1 text-right">Lương ca đêm</TableHead>
                    <TableHead className="h-8 py-1 text-right">Tổng lương</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.map((p, i) => (
                    <TableRow key={p.teacher.id} className={`${i % 2 ? "bg-muted/30" : ""} hover:bg-muted/50`}>
                      <TableCell className="py-1.5 font-medium">{p.teacher.name}</TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">{formatNumber(p.dayHours)}</TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">{formatNumber(p.nightHours)}</TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">{formatVND(p.dayAmount)}</TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums">{formatVND(p.nightAmount)}</TableCell>
                      <TableCell className="py-1.5 text-right tabular-nums font-semibold">{formatVND(p.total)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-semibold bg-accent/40 hover:bg-accent/40">
                    <TableCell className="py-1.5">Tổng cộng</TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums">
                      {formatNumber(payroll.reduce((a, b) => a + b.dayHours, 0))}
                    </TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums">
                      {formatNumber(payroll.reduce((a, b) => a + b.nightHours, 0))}
                    </TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums">
                      {formatVND(payroll.reduce((a, b) => a + b.dayAmount, 0))}
                    </TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums">
                      {formatVND(payroll.reduce((a, b) => a + b.nightAmount, 0))}
                    </TableCell>
                    <TableCell className="py-1.5 text-right tabular-nums text-primary">{formatVND(totalAmount)}</TableCell>
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
