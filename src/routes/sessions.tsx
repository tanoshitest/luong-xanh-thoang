import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { sessionsApi, useSessions, useTeachers } from "@/lib/store";
import {
  diffHours,
  formatDateVN,
  formatNumber,
  formatVND,
  parseDateVN,
} from "@/lib/format";
import { sessionAmount } from "@/lib/payroll";
import type { Session, Shift } from "@/lib/types";

export const Route = createFileRoute("/sessions")({
  head: () => ({ meta: [{ title: "Nhật ký đứng lớp – Báo cáo lương dạy" }] }),
  component: SessionsPage,
});

type Form = {
  teacherId: string;
  date: string;
  shift: Shift;
  startTime: string;
  endTime: string;
  hours: string;
  subject: string;
  note: string;
};

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function SessionsPage() {
  const teachers = useTeachers();
  const sessions = useSessions();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [form, setForm] = useState<Form>({
    teacherId: "",
    date: todayISO(),
    shift: "day",
    startTime: "08:00",
    endTime: "10:00",
    hours: "2",
    subject: "",
    note: "",
  });
  const [hoursManual, setHoursManual] = useState(false);

  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");

  const fileRef = useRef<HTMLInputElement>(null);

  const teacherById = useMemo(
    () => Object.fromEntries(teachers.map((t) => [t.id, t])),
    [teachers],
  );

  const filtered = useMemo(() => {
    return sessions
      .filter((s) => filterTeacher === "all" || s.teacherId === filterTeacher)
      .filter((s) => !filterFrom || s.date >= filterFrom)
      .filter((s) => !filterTo || s.date <= filterTo)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [sessions, filterTeacher, filterFrom, filterTo]);

  function openNew() {
    setEditing(null);
    setHoursManual(false);
    setForm({
      teacherId: teachers[0]?.id ?? "",
      date: todayISO(),
      shift: "day",
      startTime: "08:00",
      endTime: "10:00",
      hours: "2",
      subject: "",
      note: "",
    });
    setOpen(true);
  }
  function openEdit(s: Session) {
    setEditing(s);
    setHoursManual(true);
    setForm({
      teacherId: s.teacherId,
      date: s.date,
      shift: s.shift,
      startTime: s.startTime,
      endTime: s.endTime,
      hours: String(s.hours),
      subject: s.subject ?? "",
      note: s.note ?? "",
    });
    setOpen(true);
  }

  function setStart(t: string) {
    setForm((f) => {
      const next = { ...f, startTime: t };
      if (!hoursManual) next.hours = String(diffHours(t, f.endTime));
      return next;
    });
  }
  function setEnd(t: string) {
    setForm((f) => {
      const next = { ...f, endTime: t };
      if (!hoursManual) next.hours = String(diffHours(f.startTime, t));
      return next;
    });
  }

  function save() {
    if (!form.teacherId) return toast.error("Chọn giáo viên");
    if (!form.date) return toast.error("Chọn ngày");
    const payload = {
      teacherId: form.teacherId,
      date: form.date,
      shift: form.shift,
      startTime: form.startTime,
      endTime: form.endTime,
      hours: Number(form.hours) || 0,
      subject: form.subject.trim(),
      note: form.note.trim(),
    };
    if (editing) {
      sessionsApi.update(editing.id, payload);
      toast.success("Đã cập nhật buổi dạy");
    } else {
      sessionsApi.add(payload);
      toast.success("Đã thêm buổi dạy");
    }
    setOpen(false);
  }

  function remove(s: Session) {
    if (!confirm("Xoá buổi dạy này?")) return;
    sessionsApi.remove(s.id);
    toast.success("Đã xoá");
  }

  async function onImport(file: File) {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const teachersByName = new Map(
        teachers.map((t) => [t.name.trim().toLowerCase(), t]),
      );
      const toAdd: Omit<Session, "id">[] = [];
      let skipped = 0;
      for (const r of rows) {
        const name = String(r["Họ tên"] ?? r["Giáo viên"] ?? r["teacher"] ?? "").trim();
        const dateRaw = String(r["Ngày"] ?? r["date"] ?? "").trim();
        const shiftRaw = String(r["Ca"] ?? r["shift"] ?? "ngày").trim().toLowerCase();
        const start = String(r["Giờ bắt đầu"] ?? r["start"] ?? "").trim();
        const end = String(r["Giờ kết thúc"] ?? r["end"] ?? "").trim();
        const hoursRaw = r["Số giờ"] ?? r["hours"] ?? "";
        const subject = String(r["Lớp/Môn"] ?? r["Môn"] ?? r["subject"] ?? "").trim();
        const note = String(r["Ghi chú"] ?? r["note"] ?? "").trim();

        const teacher = teachersByName.get(name.toLowerCase());
        const date = parseDateVN(dateRaw);
        if (!teacher || !date) {
          skipped++;
          continue;
        }
        const shift: Shift = shiftRaw.startsWith("đ") || shiftRaw === "night" ? "night" : "day";
        const hours = Number(hoursRaw) || (start && end ? diffHours(start, end) : 0);
        toAdd.push({
          teacherId: teacher.id,
          date,
          shift,
          startTime: start || "00:00",
          endTime: end || "00:00",
          hours,
          subject,
          note,
        });
      }
      if (toAdd.length) sessionsApi.addMany(toAdd);
      toast.success(`Đã nhập ${toAdd.length} buổi dạy${skipped ? `, bỏ qua ${skipped} dòng` : ""}`);
    } catch (e) {
      toast.error("Không đọc được file. Vui lòng kiểm tra định dạng.");
    }
  }

  return (
    <AppLayout title="Nhật ký đứng lớp">
      <div className="space-y-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
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
                <Label>Từ ngày</Label>
                <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
              </div>
              <div>
                <Label>Đến ngày</Label>
                <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={openNew} className="flex-1">
                  <Plus className="mr-1 h-4 w-4" /> Thêm buổi
                </Button>
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-1 h-4 w-4" /> Import
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImport(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              File import có cột: Họ tên, Ngày (dd/MM/yyyy), Ca (Ngày/Đêm), Giờ bắt đầu, Giờ kết thúc, Số giờ, Lớp/Môn, Ghi chú.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Giáo viên</TableHead>
                    <TableHead>Ca</TableHead>
                    <TableHead>Giờ</TableHead>
                    <TableHead className="text-right">Số giờ</TableHead>
                    <TableHead>Lớp/Môn</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                    <TableHead className="w-24 text-right">Thao tác</TableHead>
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
                        <TableCell className="text-right tabular-nums">{formatVND(sessionAmount(s, t))}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(s)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Sửa buổi dạy" : "Thêm buổi dạy"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Giáo viên</Label>
                <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn giáo viên" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ngày</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <Label>Ca</Label>
                  <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v as Shift })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Ngày</SelectItem>
                      <SelectItem value="night">Đêm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Bắt đầu</Label>
                  <Input type="time" value={form.startTime} onChange={(e) => setStart(e.target.value)} />
                </div>
                <div>
                  <Label>Kết thúc</Label>
                  <Input type="time" value={form.endTime} onChange={(e) => setEnd(e.target.value)} />
                </div>
                <div>
                  <Label>Số giờ</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={form.hours}
                    onChange={(e) => {
                      setHoursManual(true);
                      setForm({ ...form, hours: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Lớp/Môn</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <Label>Ghi chú</Label>
                <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button>
              <Button onClick={save}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}