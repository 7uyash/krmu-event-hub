import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Upload, Search, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Member = {
  rollNumber: string;
  name: string;
  department: string;
  status: "active" | "pending";
};

const demoMembers: Member[] = [
  { rollNumber: "2023001", name: "Aarav Singh", department: "CSE", status: "active" },
  { rollNumber: "2023124", name: "Rohit Mehra", department: "CSE", status: "active" },
  { rollNumber: "2023251", name: "Ananya Verma", department: "CSE", status: "pending" },
];

export default function ClubMembers() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return demoMembers;
    return demoMembers.filter((m) => m.rollNumber.includes(s) || m.name.toLowerCase().includes(s) || m.department.toLowerCase().includes(s));
  }, [q]);

  return (
    <DashboardLayout role="club">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-muted-foreground">Manage your club membership list. (UI-only)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link to="/club">Back to Dashboard</Link>
            </Button>
            <Button variant="outline" disabled>
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{demoMembers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold mt-1">{demoMembers.filter((m) => m.status === "active").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold mt-1">{demoMembers.filter((m) => m.status === "pending").length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search</CardTitle>
            <CardDescription>Find members by roll number, name, or department.</CardDescription>
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
            <CardTitle className="text-base">Member list</CardTitle>
            <CardDescription>{rows.length} member(s) shown.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((m) => (
                    <TableRow key={m.rollNumber}>
                      <TableCell>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.rollNumber}</div>
                      </TableCell>
                      <TableCell>{m.department}</TableCell>
                      <TableCell>
                        <Badge variant={m.status === "active" ? "success" : "secondary"}>{m.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" disabled>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" disabled>
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No members match your search.
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

