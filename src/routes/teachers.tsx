import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeachers } from "@/lib/store";
import { formatVND } from "@/lib/format";

export const Route = createFileRoute("/teachers")({
  head: () => ({ meta: [{ title: "Giáo viên – Báo cáo lương dạy" }] }),
  component: TeachersPage,
});

function formatRate(value: number) {
  return value > 0 ? formatVND(value) : "—";
}

function TeachersPage() {
  const teachers = useTeachers();

  return (
    <AppLayout title="Giáo viên">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Danh sách giáo viên và đơn giá theo ca dạy (VND/giờ).
        </p>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Giáo viên</TableHead>
                    <TableHead className="text-right">Lương ban ngày (/giờ)</TableHead>
                    <TableHead className="text-right">Lương ban đêm (lớp tối)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((t, i) => (
                    <TableRow key={t.id} className={i % 2 ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatRate(t.rateDay)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatRate(t.rateNight)}</TableCell>
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
