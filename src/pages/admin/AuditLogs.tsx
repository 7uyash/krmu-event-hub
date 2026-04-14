import { useEffect, useMemo, useState } from "react";
import { Search, Shield, Clock3, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ActionType = "LOGIN" | "EVENT_CREATE" | "ATTENDANCE_MARK" | "ROLE_CHANGE" | "EXPORT" | "SUPPORT_TICKET" | "USER_REGISTER";

type LogRow = {
  id: string;
  at: string;
  actor: string;
  action: ActionType;
  detail: string;
};

const demoLogs: LogRow[] = [
  { id: "l-01", at: "2026-04-14T09:10:00", actor: "neha.convenor@krmu.edu.in", action: "EVENT_CREATE", detail: "Created event: Seminar Research Ethics" },
  { id: "l-02", at: "2026-04-14T11:45:00", actor: "ml.coord@krmu.edu.in", action: "ATTENDANCE_MARK", detail: "Marked present for 2023044" },
  { id: "l-03", at: "2026-04-13T17:20:00", actor: "system", action: "EXPORT", detail: "Exported CSV attendance report" },
  { id: "l-04", at: "2026-04-12T08:01:00", actor: "priya.coordinator@krmu.edu.in", action: "ROLE_CHANGE", detail: "Updated access for a user" },
];

const actionBadgeVariant = (action: ActionType) => {
  if (action === "ATTENDANCE_MARK") return "success";
  if (action === "ROLE_CHANGE") return "destructive";
  return "secondary";
};

export default function AuditLogs() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | ActionType>("all");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.admin.getAuditLogs();
        const mapped = (res.logs || []).map((l: any) => ({
          id: l._id?.toString() || l.id,
          at: l.at || l.createdAt,
          actor: l.actor || l.userEmail || "system",
          action: l.action,
          detail: l.detail || l.message || "",
        }));
        setLogs(mapped);
      } catch (err: any) {
        toast.error(err.message || "Failed to load audit logs");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return logs.filter((l) => {
      const matchesQ = s === "" || l.actor.toLowerCase().includes(s) || l.detail.toLowerCase().includes(s) || l.action.toLowerCase().includes(s);
      const matchesType = type === "all" ? true : l.action === type;
      return matchesQ && matchesType;
    });
  }, [q, type, logs]);

  const total = logs.length;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold inline-flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Audit Logs
            </h1>
            <p className="text-muted-foreground">Track administrative and attendance actions.</p>
          </div>
          <Badge variant="secondary" className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {isLoading ? "Loading…" : `${total} total`}
          </Badge>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search & filter</CardTitle>
            <CardDescription>Find by actor, action, or detail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search logs…" className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={type === "all" ? "default" : "outline"} onClick={() => setType("all")}>
                All
              </Button>
              {(["LOGIN", "EVENT_CREATE", "ATTENDANCE_MARK", "ROLE_CHANGE", "EXPORT", "SUPPORT_TICKET", "USER_REGISTER"] as ActionType[]).map((t) => (
                <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>
                  <Filter className="h-4 w-4 mr-2" />
                  {t}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>{filtered.length} row(s) shown.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Detail</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="max-w-[220px] truncate">{l.actor}</TableCell>
                      <TableCell>
                        <Badge variant={actionBadgeVariant(l.action) as any}>{l.action}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[420px] truncate">{l.detail}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {new Date(l.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        {isLoading ? "Loading…" : "No matching logs."}
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

