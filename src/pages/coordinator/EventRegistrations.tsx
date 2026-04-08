import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type AttendanceStatus = "present" | "absent" | "pending";

type RegistrationRow = {
  id: string;
  rollNumber: string;
  name: string;
  department: string;
  status: AttendanceStatus;
};

const demoRegistrations: RegistrationRow[] = [
  { id: "r-01", rollNumber: "2023001", name: "Aarav Singh", department: "CSE", status: "pending" },
  { id: "r-02", rollNumber: "2023044", name: "Meera Iyer", department: "CSE", status: "present" },
  { id: "r-03", rollNumber: "2023124", name: "Rohit Mehra", department: "Sports", status: "absent" },
  { id: "r-04", rollNumber: "2023177", name: "Ananya Verma", department: "MBA", status: "pending" },
];

export default function CoordinatorEventRegistrations() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<RegistrationRow[]>(demoRegistrations);

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.rollNumber.includes(s) || r.name.toLowerCase().includes(s) || r.department.toLowerCase().includes(s));
  }, [rows, query]);

  const counts = useMemo(() => {
    const present = rows.filter((r) => r.status === "present").length;
    const absent = rows.filter((r) => r.status === "absent").length;
    const pending = rows.filter((r) => r.status === "pending").length;
    return { present, absent, pending, total: rows.length };
  }, [rows]);

  const setStatus = (id: string, status: AttendanceStatus) => {
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success(`Updated: ${status}`);
  };

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Event Registrations</h1>
            <p className="text-muted-foreground">
              Attendance table for event <b>{eventId || "—"}</b>. (UI-only)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {counts.total} students
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-3xl font-bold mt-1">{counts.present}</p>
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> confirmed
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
                <Clock className="h-4 w-4" /> awaiting mark
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
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roll number / name…"
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attendance table</CardTitle>
            <CardDescription>{filtered.length} row(s) shown.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                          <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "present")} disabled={r.status === "present"}>
                            Present
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "absent")} disabled={r.status === "absent"}>
                            Absent
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
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

