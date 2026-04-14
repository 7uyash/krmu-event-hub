import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Upload, Search, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export";

type Member = {
  id: string;
  rollNumber: string;
  name: string;
  department: string;
  status: "active" | "pending";
};

export default function ClubMembers() {
  const [q, setQ] = useState("");
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    api.club
      .getMembers(q)
      .then((res) => setMembers(res.members || []))
      .catch((err: any) => toast.error(err.message || "Failed to load members"));
  }, [q]);

  const rows = useMemo(() => {
    return members;
  }, [members]);

  return (
    <DashboardLayout role="club">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-muted-foreground">Manage your club membership list.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link to="/club">Back to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/club/members/import">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToCSV(
                  rows.map((m) => ({
                    rollNumber: m.rollNumber,
                    name: m.name,
                    email: "",
                    department: m.department,
                    registeredAt: "",
                    attendanceStatus: m.status,
                    markedAt: "",
                  })),
                  "club-members"
                )
              }
            >
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
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold mt-1">{members.filter((m) => m.status === "active").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold mt-1">{members.filter((m) => m.status === "pending").length}</p>
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
                    <TableRow key={m.id}>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => api.club.updateMember(m.id, { status: "active" }).then(() => setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "active" } : x))))}
                            disabled={m.status === "active"}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => api.club.updateMember(m.id, { action: "remove" }).then(() => setMembers((prev) => prev.filter((x) => x.id !== m.id)))}
                          >
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

