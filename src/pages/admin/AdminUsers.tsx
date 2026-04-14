import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Shield, UserCog, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { toast } from "sonner";

type UserRole = "student" | "coordinator" | "convenor" | "club" | "admin";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status?: "active" | "disabled";
};

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.admin.getUsers({ q });
        const mapped = (res.users || []).map((u: any) => ({
          id: u._id?.toString() || u.id,
          name: u.name,
          email: u.email,
          department: u.department || "—",
          role: u.role,
          status: u.status,
        }));
        setUsers(mapped);
      } catch (err: any) {
        toast.error(err.message || "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [q]);

  const rows = useMemo(() => {
    return users;
  }, [users]);

  const handleRoleChange = async (id: string, currentRole: UserRole) => {
    const order: UserRole[] = ["student", "coordinator", "convenor", "club", "admin"];
    const nextRole = order[(order.indexOf(currentRole) + 1) % order.length];
    try {
      await api.admin.updateUserRole(id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: nextRole } : u)));
      toast.success(`Role updated to ${nextRole}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleStatusToggle = async (id: string, status?: "active" | "disabled") => {
    const nextStatus: "active" | "disabled" = status === "disabled" ? "active" : "disabled";
    try {
      await api.admin.updateUserStatus(id, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
      toast.success(`User ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Super Admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage user roles and access.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin">Back to Overview</Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total users</p>
                <p className="text-2xl font-bold">{isLoading ? "—" : users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCog className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Privileged roles</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "—" : users.filter((u) => u.role !== "student").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disabled</p>
                <p className="text-2xl font-bold">{isLoading ? "—" : users.filter((u) => u.status === "disabled").length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search</CardTitle>
            <CardDescription>Find users by name, email, department, or role.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">User list</CardTitle>
            <CardDescription>{isLoading ? "Loading…" : `${rows.length} user(s) shown.`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell>{u.department}</TableCell>
                      <TableCell>
                        <Badge variant={u.role as any}>{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {u.status ? (
                          <Badge variant={u.status === "active" ? "success" : "secondary"}>{u.status}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleRoleChange(u.id, u.role)}>
                            Next role
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatusToggle(u.id, u.status)}>
                            {u.status === "disabled" ? "Enable" : "Disable"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No users match your search.
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

