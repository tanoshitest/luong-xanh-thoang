import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ChevronDown, ChevronRight, FileDown, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSessions, useTeachers } from "@/lib/store";
import {
  addDays,
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

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Báo cáo lương – Báo cáo lương dạy" }] }),
  component: ReportPage,
});

function ReportPage() {
  const teachers = useTeachers();
  const sessions = useSessions();

  const [period, setPeriod] = useState<"week" | "month">("month");
  const today = new Date();

  const defaultFrom = period === "week"
    ? toISODate(startOfWeekMon(today))
    : toISODate(startOfMonth(today));
  const defaultTo = period === "week"
    ? toISODate(endOfWeekMon(today))
    : toISODate(endOfMonth(today));

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [teacherId, setTeacherId] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function applyPeriod(p: "week" | "month") {
    setPeriod(p);
    const now = new Date();
    if (p === "week") {
      setFrom(toISODate(startOfWeekMon(now)));
      setTo(toISODate(endOfWeekMon(now)));
    } else {
      setFrom(toISODate(startOfMonth(now)));
      setTo(toISODate(endOfMonth(now)));
    }
  }

  const rows = useMemo(
    () => computePayroll(teachers, sessions, from, to, teacherId),
    [teachers, sessions, from, to, teacherId],
  );

  const totals = rows.reduce(
    (acc, r) => {
      acc.dayHours += r.dayHours;
      acc.nightHours += r.nightHours;
      acc.totalHours += r.totalHours;
      acc.dayAmount += r.dayAmount;
      acc.nightAmount += r.nightAmount;
      acc.total += r.total;
      return acc;
    },
    { dayHours: 0, nightHours: 0, totalHours: 0, dayAmount: 0, nightAmount: 0, total: 0 },
  );

  // Weekly breakdown when period = month
  const weekRanges = useMemo(() => {
    if (period !== "month") return [];
    const ranges: { from: string; to: string; label: string }[] = [];
    let cursor = startOfWeekMon(new Date(from + "T00:00:00"));
    const end = new Date(to + "T00:00:00");
    while (cursor <= end) {
      const wEnd = endOfWeekMon(cursor);
      const clampFrom = toISODate(cursor) < from ? from : toISODate(cursor);
      const clampTo = toISODate(wEnd) > to ? to : toISODate(wEnd);
      ranges.push({
        from: clampFrom,
        to: clampTo,
        label: `${formatDateVN(clampFrom)} – ${formatDateVN(clampTo)}`,
      });
      cursor = addDays(wEnd, 1);
    }
    return ranges;
  }, [period, from, to]);

  function weeklyForTeacher(tid: string) {
    return weekRanges.map((wr) => {
      const r = computePayroll(teachers, sessions, wr.from, wr.to, tid)[0];
      return { range: wr, row: r };
    });
  }

  function exportExcel() {
    const data = [
      ["Báo cáo lương dạy"],
      [`Kỳ: ${formatDateVN(from)} – ${formatDateVN(to)}`],
      [],
      ["Họ tên", "Giờ ngày", "Giờ đêm", "Tổng giờ", "Tiền ca ngày", "Tiền ca đêm", "Tổng lương"],
      ...rows.map((r) => [
        r.teacher.name,
        r.dayHours,
        r.nightHours,
        r.totalHours,
        r.dayAmount,
        r.nightAmount,
        r.total,
      ]),
      [
        "TỔNG CỘNG",
        totals.dayHours,
        totals.nightHours,
        totals.totalHours,
        totals.dayAmount,
        totals.nightAmount,
        totals.total,
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");
    XLSX.writeFile(wb, `bao-cao-luong-${from}_${to}.xlsx`);
  }

  function exportPDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
    doc.setFontSize(14);
    doc.text("Bao cao luong day", 40, 40);
    doc.setFontSize(10);
    doc.text(`Ky: ${formatDateVN(from)} - ${formatDateVN(to)}`, 40, 58);
    autoTable(doc, {
      startY: 80,
      head: [["Ho ten", "Gio ngay", "Gio dem", "Tong gio", "Tien ca ngay", "Tien ca dem", "Tong luong"]],
      body: rows.map((r) => [
        r.teacher.name,
        formatNumber(r.dayHours),
        formatNumber(r.nightHours),
        formatNumber(r.totalHours),
        formatVND(r.dayAmount),
        formatVND(r.nightAmount),
        formatVND(r.total),
      ]),
      foot: [[
        "TONG CONG",
        formatNumber(totals.dayHours),
        formatNumber(totals.nightHours),
        formatNumber(totals.totalHours),
        formatVND(totals.dayAmount),
        formatVND(totals.nightAmount),
        formatVND(totals.total),
      ]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 58, 95] },
      footStyles: { fillColor: [240, 240, 245], textColor: 20, fontStyle: "bold" },
    });
    doc.save(`bao-cao-luong-${from}_${to}.pdf`);
  }

  return (
    <AppLayout title="Báo cáo lương">
      <div className="space-y-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap items-end gap-3 justify-between">
              <Tabs value={period} onValueChange={(v) => applyPeriod(v as "week" | "month")}>
                <TabsList>
                  <TabsTrigger value="week">Theo tuần</TabsTrigger>
                  <TabsTrigger value="month">Theo tháng</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportExcel}>
                  <FileSpreadsheet className="mr-1 h-4 w-4" /> Xuất Excel
                </Button>
                <Button onClick={exportPDF}>
                  <FileDown className="mr-1 h-4 w-4" /> Xuất PDF
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <Label>Từ ngày</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <Label>Đến ngày</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Giáo viên</Label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {period === "month" && <TableHead className="w-8"></TableHead>}
                    <TableHead>Họ tên</TableHead>
                    <TableHead className="text-right">Số giờ ngày</TableHead>
                    <TableHead className="text-right">Số giờ đêm</TableHead>
                    <TableHead className="text-right">Tổng giờ</TableHead>
                    <TableHead className="text-right">Tiền ca ngày</TableHead>
                    <TableHead className="text-right">Tiền ca đêm</TableHead>
                    <TableHead className="text-right">Tổng lương</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={period === "month" ? 8 : 7} className="text-center text-muted-foreground py-10">
                        Không có dữ liệu trong khoảng thời gian đã chọn.
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((r, i) => {
                    const isOpen = !!expanded[r.teacher.id];
                    return (
                      <Fragment key={r.teacher.id}>
                        <TableRow className={i % 2 ? "bg-muted/30" : ""}>
                          {period === "month" && (
                            <TableCell>
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
                          <TableCell className="font-medium">{r.teacher.name}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatNumber(r.dayHours)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatNumber(r.nightHours)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatNumber(r.totalHours)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatVND(r.dayAmount)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatVND(r.nightAmount)}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{formatVND(r.total)}</TableCell>
                        </TableRow>
                        {period === "month" && isOpen && (
                          <TableRow className="bg-muted/20">
                            <TableCell></TableCell>
                            <TableCell colSpan={7} className="p-0">
                              <div className="p-3">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Tuần</TableHead>
                                      <TableHead className="text-right">Giờ ngày</TableHead>
                                      <TableHead className="text-right">Giờ đêm</TableHead>
                                      <TableHead className="text-right">Tổng giờ</TableHead>
                                      <TableHead className="text-right">Tổng lương</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {weeklyForTeacher(r.teacher.id).map((w) => (
                                      <TableRow key={w.range.from}>
                                        <TableCell>{w.range.label}</TableCell>
                                        <TableCell className="text-right tabular-nums">{formatNumber(w.row?.dayHours ?? 0)}</TableCell>
                                        <TableCell className="text-right tabular-nums">{formatNumber(w.row?.nightHours ?? 0)}</TableCell>
                                        <TableCell className="text-right tabular-nums">{formatNumber(w.row?.totalHours ?? 0)}</TableCell>
                                        <TableCell className="text-right tabular-nums">{formatVND(w.row?.total ?? 0)}</TableCell>
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
                  {rows.length > 0 && (
                    <TableRow className="border-t-2 font-semibold bg-accent/40">
                      {period === "month" && <TableCell></TableCell>}
                      <TableCell>Tổng cộng toàn trung tâm</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(totals.dayHours)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(totals.nightHours)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(totals.totalHours)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatVND(totals.dayAmount)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatVND(totals.nightAmount)}</TableCell>
                      <TableCell className="text-right tabular-nums text-primary">{formatVND(totals.total)}</TableCell>
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