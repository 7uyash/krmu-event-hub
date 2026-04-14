import { useEffect, useMemo, useState } from "react";
import { Download, Calendar, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { exportToCSV, exportToExcel } from "@/lib/export";

type ReportRow = {
  id: string;
  eventId: string;
  eventTitle: string;
  createdAt: string;
  format: "CSV" | "Excel";
  rows: number;
};

export default function CoordinatorReports() {
  const [q, setQ] = useState("");
  const [format, setFormat] = useState<"all" | ReportRow["format"]>("all");
  const [reports, setReports] = useState<ReportRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const eventsRes = await api.eventsAdmin.getCoordinatorEvents();
        const rows: ReportRow[] = (eventsRes.events || []).flatMap((e: any) => [
          {
            id: `${e._id || e.id}-csv`,
            eventId: (e._id || e.id).toString(),
            eventTitle: e.title,
            createdAt: e.createdAt || e.date,
            format: "CSV",
            rows: e.registeredCount || 0,
          },
          {
            id: `${e._id || e.id}-xlsx`,
            eventId: (e._id || e.id).toString(),
            eventTitle: e.title,
            createdAt: e.createdAt || e.date,
            format: "Excel",
            rows: e.registeredCount || 0,
          },
        ]);
        setReports(rows);
      } catch (err: any) {
        toast.error(err.message || "Failed to load reports");
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return reports.filter((r) => {
      const matchesQ = s === "" || r.eventTitle.toLowerCase().includes(s);
      const matchesFormat = format === "all" ? true : r.format === format;
      return matchesQ && matchesFormat;
    });
  }, [q, format, reports]);

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Attendance exports made by this coordinator.</p>
          </div>
          <Badge variant="secondary" className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {filtered.length} report(s)
          </Badge>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search & filter</CardTitle>
            <CardDescription>Filter by event title and export format.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…" className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={format === "all" ? "default" : "outline"} onClick={() => setFormat("all")}>
                All
              </Button>
              <Button size="sm" variant={format === "CSV" ? "default" : "outline"} onClick={() => setFormat("CSV")}>
                CSV
              </Button>
              <Button size="sm" variant={format === "Excel" ? "default" : "outline"} onClick={() => setFormat("Excel")}>
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Export history</CardTitle>
            <CardDescription>{filtered.length} row(s) shown.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.eventTitle}</div>
                      </TableCell>
                      <TableCell>
                        {new Date(r.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.format}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{r.rows.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const regRes = await api.eventsAdmin.getEventRegistrations(r.eventId);
                              const formatted = (regRes.registrations || []).map((x: any) => ({
                                rollNumber: x.userId?.rollNumber || "",
                                name: x.userId?.name || "",
                                email: x.userId?.email || "",
                                department: x.userId?.department || "",
                                registeredAt: x.registeredAt ? new Date(x.registeredAt).toLocaleString() : "",
                                attendanceStatus: x.attendanceStatus || "pending",
                                markedAt: x.markedAt ? new Date(x.markedAt).toLocaleString() : "",
                              }));
                              if (r.format === "CSV") exportToCSV(formatted, `${r.eventTitle}-attendance`);
                              else exportToExcel(formatted, `${r.eventTitle}-attendance`);
                            } catch (err: any) {
                              toast.error(err.message || "Failed to export");
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No reports found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

