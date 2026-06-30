import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { teachersApi, useTeachers } from "@/lib/store";
import { formatVND } from "@/lib/format";
import type { Teacher } from "@/lib/types";

export const Route = createFileRoute("/teachers")({
  head: () => ({ meta: [{ title: "Giáo viên – Báo cáo lương dạy" }] }),
  component: TeachersPage,
});

type FormState = {
  name: string;
  rateDay: string;
  rateNight: string;
  note: string;
};

const empty: FormState = { name: "", rateDay: "", rateNight: "", note: "" };

function TeachersPage() {
  const teachers = useTeachers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(t: Teacher) {
    setEditing(t);
    setForm({
      name: t.name,
      rateDay: String(t.rateDay),
      rateNight: String(t.rateNight),
      note: t.note ?? "",
    });
    setOpen(true);
  }
  function save() {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }
    const payload = {
      name: form.name.trim(),
      rateDay: Number(form.rateDay) || 0,
      rateNight: Number(form.rateNight) || 0,
      note: form.note.trim(),
    };
    if (editing) {
      teachersApi.update(editing.id, payload);
      toast.success("Đã cập nhật giáo viên");
    } else {
      teachersApi.add(payload);
      toast.success("Đã thêm giáo viên");
    }
    setOpen(false);
  }
  function remove(t: Teacher) {
    if (!confirm(`Xoá giáo viên "${t.name}"? Các buổi dạy liên quan sẽ bị xoá.`)) return;
    teachersApi.remove(t.id);
    toast.success("Đã xoá");
  }

  return (
    <AppLayout title="Giáo viên">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách giáo viên và đơn giá theo ca dạy.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="mr-1 h-4 w-4" /> Thêm giáo viên
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Sửa giáo viên" : "Thêm giáo viên"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Họ tên</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Đơn giá ca ngày (VND/giờ)</Label>
                    <Input
                      type="number"
                      value={form.rateDay}
                      onChange={(e) => setForm({ ...form, rateDay: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Đơn giá ca đêm (VND/giờ)</Label>
                    <Input
                      type="number"
                      value={form.rateNight}
                      onChange={(e) => setForm({ ...form, rateNight: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Ghi chú</Label>
                  <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button>
                <Button onClick={save}>Lưu</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead className="text-right">Ca ngày</TableHead>
                    <TableHead className="text-right">Ca đêm</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="w-28 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        Chưa có giáo viên. Bấm "Thêm giáo viên" để bắt đầu.
                      </TableCell>
                    </TableRow>
                  )}
                  {teachers.map((t, i) => (
                    <TableRow key={t.id} className={i % 2 ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatVND(t.rateDay)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatVND(t.rateNight)}</TableCell>
                      <TableCell className="text-muted-foreground">{t.note}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(t)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}