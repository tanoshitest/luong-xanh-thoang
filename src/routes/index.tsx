import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, Wallet, BookOpen } from "lucide-react";
import { useSessions, useTeachers } from "@/lib/store";
import {
  endOfMonth,
  endOfWeekMon,
  formatDateVN,
  formatNumber,
  formatVND,
  startOfMonth,
  startOfWeekMon,
  toISODate,
} from "@/lib/format";
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

  const { from, to, label } = useMemo(() => {
    const now = new Date();
    if (period === "week") {
      const s = startOfWeekMon(now);
      const e = endOfWeekMon(now);
      return {
        from: toISODate(s),
        to: toISODate(e),
        label: `Tuần ${formatDateVN(toISODate(s))} – ${formatDateVN(toISODate(e))}`,
      };
    }
    const s = startOfMonth(now);
    const e = endOfMonth(now);
    return {
      from: toISODate(s),
      to: toISODate(e),
      label: `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`,
    };
  }, [period]);

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
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Kỳ báo cáo</p>
            <p className="text-lg font-semibold">{label}</p>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
            <TabsList>
              <TabsTrigger value="week">Theo tuần</TabsTrigger>
              <TabsTrigger value="month">Theo tháng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      {s.value}
                    </p>
                  </div>
                  <div className="rounded-lg bg-accent p-2 text-accent-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tóm tắt lương từng giáo viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead className="text-right">Số buổi</TableHead>
                    <TableHead className="text-right">Tổng giờ</TableHead>
                    <TableHead className="text-right">Tổng lương</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Chưa có dữ liệu trong kỳ.
                      </TableCell>
                    </TableRow>
                  )}
                  {payroll.map((p, i) => (
                    <TableRow key={p.teacher.id} className={i % 2 ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium">{p.teacher.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.sessionCount}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(p.totalHours)}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{formatVND(p.total)}</TableCell>
                    </TableRow>
                  ))}
                  {payroll.length > 0 && (
                    <TableRow className="border-t-2 font-semibold">
                      <TableCell>Tổng cộng</TableCell>
                      <TableCell className="text-right tabular-nums">{totalSessions}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(totalHours)}</TableCell>
                      <TableCell className="text-right tabular-nums text-primary">{formatVND(totalAmount)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
