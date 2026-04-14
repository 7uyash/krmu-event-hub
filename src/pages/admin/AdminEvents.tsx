import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { Event } from "@/types";
import { toast } from "sonner";

export default function AdminEvents() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Event["status"]>("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isOpen, setIsOpen] = useState<"all" | "true" | "false">("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.admin.getEvents({
          q,
          status: status === "all" ? undefined : status,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          isOpen: isOpen === "all" ? undefined : isOpen,
        });
        const mapped = (res.events || []).map((e: any) => ({
          ...e,
          id: e._id?.toString() || e.id,
        }));
        setEvents(mapped);
      } catch (err: any) {
        toast.error(err.message || "Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [q, status, fromDate, toDate, isOpen]);

  const rows = useMemo(() => {
    return events;
  }, [events]);

  return (
    <DashboardLayout role="admin" userName="Super Admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">All Events</h1>
            <p className="text-muted-foreground">Browse and manage events.</p>
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
              <Button size="sm" variant="outline" onClick={() => setShowAdvanced((v) => !v)}>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {showAdvanced ? "Hide Advanced" : "Advanced"}
              </Button>
            </div>
          </CardContent>
          {showAdvanced && (
            <CardContent className="pt-0 grid md:grid-cols-3 gap-3">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" variant={isOpen === "all" ? "default" : "outline"} onClick={() => setIsOpen("all")}>
                  Any
                </Button>
                <Button size="sm" variant={isOpen === "true" ? "default" : "outline"} onClick={() => setIsOpen("true")}>
                  Open
                </Button>
                <Button size="sm" variant={isOpen === "false" ? "default" : "outline"} onClick={() => setIsOpen("false")}>
                  Closed
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>{isLoading ? "Loading…" : `${rows.length} event(s) shown.`}</CardDescription>
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
                  {rows.map((r: any) => (
                    <TableRow key={r._id || r.id}>
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
                      <TableCell className="max-w-[240px] truncate">{r.organizer || r.organizerDepartment || "—"}</TableCell>
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
                      <TableCell className="text-right">{(r.registeredCount || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && rows.length === 0 && (
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

