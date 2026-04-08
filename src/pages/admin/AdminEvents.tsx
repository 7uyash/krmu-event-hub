import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminEventRow = {
  id: string;
  title: string;
  category: "workshop" | "cultural" | "sports" | "academic" | "club" | "seminar";
  date: string;
  venue: string;
  organizer: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  registrations: number;
};

const demoRows: AdminEventRow[] = [
  {
    id: "evt-201",
    title: "Workshop: Data Visualization",
    category: "workshop",
    date: "2026-04-20",
    venue: "Lab 1",
    organizer: "School of Engineering",
    status: "upcoming",
    registrations: 120,
  },
  {
    id: "evt-202",
    title: "Cultural Fest Auditions",
    category: "cultural",
    date: "2026-04-14",
    venue: "Seminar Hall",
    organizer: "Cultural Committee",
    status: "ongoing",
    registrations: 310,
  },
  {
    id: "evt-175",
    title: "Seminar: Research Ethics",
    category: "seminar",
    date: "2026-03-05",
    venue: "Auditorium B",
    organizer: "Research Cell",
    status: "completed",
    registrations: 82,
  },
];

export default function AdminEvents() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AdminEventRow["status"]>("all");

  const rows = useMemo(() => {
    return demoRows.filter((r) => {
      const matchesQ =
        q.trim() === "" ||
        r.title.toLowerCase().includes(q.toLowerCase()) ||
        r.organizer.toLowerCase().includes(q.toLowerCase()) ||
        r.venue.toLowerCase().includes(q.toLowerCase());
      const matchesStatus = status === "all" || r.status === status;
      return matchesQ && matchesStatus;
    });
  }, [q, status]);

  return (
    <DashboardLayout role="admin" userName="Super Admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">All Events</h1>
            <p className="text-muted-foreground">Browse and manage events. (UI-only)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link to="/admin">Back to Overview</Link>
            </Button>
            <Button asChild>
              <Link to="/convenor/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search & filters</CardTitle>
            <CardDescription>Quickly find events by title, organizer, venue, or status.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…" className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={status === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus("all")}
              >
                <Filter className="h-4 w-4 mr-2" />
                All
              </Button>
              {(["upcoming", "ongoing", "completed", "cancelled"] as const).map((s) => (
                <Button key={s} size="sm" variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)}>
                  {s}
                </Button>
              ))}
              <Button size="sm" variant="outline" disabled>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>{rows.length} event(s) shown.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Registrations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.category}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(r.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{r.venue}</TableCell>
                      <TableCell className="max-w-[240px] truncate">{r.organizer}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "ongoing"
                              ? "success"
                              : r.status === "cancelled"
                                ? "destructive"
                                : r.status === "completed"
                                  ? "outline"
                                  : "secondary"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{r.registrations.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No events match your filters.
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

