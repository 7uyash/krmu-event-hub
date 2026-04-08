import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Download, Plus, Search, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ClubEventRow = {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: "draft" | "upcoming" | "ongoing" | "completed" | "cancelled";
  registrations: number;
};

const demoClubEvents: ClubEventRow[] = [
  {
    id: "cl-01",
    title: "Coding Club: Git Sprint",
    date: "2026-04-16",
    venue: "Lab 6",
    status: "upcoming",
    registrations: 78,
  },
  {
    id: "cl-02",
    title: "Hack Night",
    date: "2026-04-02",
    venue: "Innovation Hub",
    status: "completed",
    registrations: 64,
  },
];

export default function ClubEvents() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return demoClubEvents;
    return demoClubEvents.filter((e) => e.title.toLowerCase().includes(s) || e.venue.toLowerCase().includes(s));
  }, [q]);

  return (
    <DashboardLayout role="club">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Club Events</h1>
            <p className="text-muted-foreground">Create and track club-only events. (UI-only)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link to="/club">Back to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/club/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
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
            <CardDescription>Find events by title or venue.</CardDescription>
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
            <CardTitle className="text-base">Events</CardTitle>
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Registrations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="font-medium">{e.title}</div>
                        <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          {e.registrations} registered
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(e.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{e.venue}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === "ongoing" ? "success" : e.status === "cancelled" ? "destructive" : "secondary"}>
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{e.registrations}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" disabled>
                            Manage
                          </Button>
                          <Button size="sm" variant="outline" disabled>
                            Close
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No events found.
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

