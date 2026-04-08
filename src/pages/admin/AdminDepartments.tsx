import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Download, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DepartmentRow = {
  name: string;
  events: number;
  registrations: number;
  attendanceRate: number; // 0..100
};

const demoDepartments: DepartmentRow[] = [
  { name: "CSE", events: 18, registrations: 2450, attendanceRate: 78 },
  { name: "Management", events: 12, registrations: 1610, attendanceRate: 71 },
  { name: "Law", events: 9, registrations: 940, attendanceRate: 67 },
  { name: "Sports", events: 7, registrations: 820, attendanceRate: 74 },
];

export default function AdminDepartments() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return demoDepartments;
    return demoDepartments.filter((d) => d.name.toLowerCase().includes(s));
  }, [q]);

  return (
    <DashboardLayout role="admin" userName="Super Admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Departments</h1>
            <p className="text-muted-foreground">Department performance overview. (UI-only)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link to="/admin">Back to Overview</Link>
            </Button>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search</CardTitle>
            <CardDescription>Find a department quickly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search departments…" className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top departments</CardTitle>
              <CardDescription>Quick glance by attendance rate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rows
                .slice()
                .sort((a, b) => b.attendanceRate - a.attendanceRate)
                .map((d) => (
                  <div key={d.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {d.name}
                      </span>
                      <span className="text-muted-foreground">{d.attendanceRate}%</span>
                    </div>
                    <Progress value={d.attendanceRate} className="h-2" />
                  </div>
                ))}
              {rows.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No departments found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Department table</CardTitle>
              <CardDescription>Events, registrations, and attendance rate.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Events</TableHead>
                      <TableHead className="text-right">Registrations</TableHead>
                      <TableHead className="text-right">Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((d) => (
                      <TableRow key={d.name}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell className="text-right">{d.events}</TableCell>
                        <TableCell className="text-right">{d.registrations.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{d.attendanceRate}%</TableCell>
                      </TableRow>
                    ))}
                    {rows.length === 0 && (
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
      </div>
    </DashboardLayout>
  );
}

