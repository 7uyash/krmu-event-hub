import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { toast } from "sonner";

type AttendanceStatus = "present" | "absent" | "pending";

type Row = {
  id: string;
  rollNumber: string;
  name: string;
  department: string;
  status: AttendanceStatus;
};

export default function ConvenorEventRegistrations() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!eventId) return;
      try {
        setIsLoading(true);
        const res = await api.eventsAdmin.getEventRegistrations(eventId);
        const mapped: Row[] = (res.registrations || []).map((r: any) => ({
          id: r._id || r.id,
          rollNumber: r.userId?.rollNumber || "—",
          name: r.userId?.name || "Unknown",
          department: r.userId?.department || "—",
          status: r.attendanceStatus || "pending",
        }));
        setRows(mapped);
      } catch (err: any) {
        toast.error(err.message || "Failed to load registrations");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [eventId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.rollNumber.includes(s) || r.name.toLowerCase().includes(s) || r.department.toLowerCase().includes(s));
  }, [rows, q]);

  const counts = useMemo(() => {
    return {
      present: rows.filter((r) => r.status === "present").length,
      absent: rows.filter((r) => r.status === "absent").length,
      pending: rows.filter((r) => r.status === "pending").length,
      total: rows.length,
    };
  }, [rows]);

  const mark = (id: string, status: AttendanceStatus) => {
    const row = rows.find((x) => x.id === id);
    if (!row || !eventId) return;
    api.eventsAdmin
      .markAttendance(eventId, { rollNumber: row.rollNumber, status })
      .then(() => setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x))))
      .catch((err: any) => toast.error(err.message || "Failed to update attendance"));
  };

  return (
    <DashboardLayout role="convenor">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Registrations</h1>
            <p className="text-muted-foreground">
              Attendance breakdown for event <b>{eventId || "—"}</b>.
            </p>
          </div>
          <Badge variant="secondary" className="inline-flex items-center gap-2">
            <Users className="h-4 w-4" />
            {counts.total} students
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-3xl font-bold mt-1">{counts.present}</p>
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> marked
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-3xl font-bold mt-1">{counts.absent}</p>
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <XCircle className="h-4 w-4" /> missed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold mt-1">{counts.pending}</p>
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <Clock className="h-4 w-4" /> awaiting
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search</CardTitle>
            <CardDescription>Filter by roll number, name, or department.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Student table</CardTitle>
            <CardDescription>{isLoading ? "Loading…" : `${filtered.length} row(s) shown.`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.rollNumber}</div>
                      </TableCell>
                      <TableCell>{r.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "present"
                              ? "success"
                              : r.status === "absent"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => mark(r.id, "present")} disabled={r.status === "present"}>
                            Present
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => mark(r.id, "absent")} disabled={r.status === "absent"}>
                            Absent
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No results.
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

