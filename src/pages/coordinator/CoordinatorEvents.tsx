import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Filter, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CoordinatorEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  registeredCount: number;
};

const demoEvents: CoordinatorEvent[] = [
  {
    id: "evt-101",
    title: "Industry Talk: Product Thinking",
    date: "2026-04-18",
    time: "11:00",
    venue: "Auditorium A",
    status: "upcoming",
    registeredCount: 184,
  },
  {
    id: "evt-102",
    title: "Sports Meet: Track Trials",
    date: "2026-04-12",
    time: "08:30",
    venue: "Sports Complex",
    status: "upcoming",
    registeredCount: 96,
  },
  {
    id: "evt-099",
    title: "Workshop: Git & Open Source",
    date: "2026-03-22",
    time: "14:00",
    venue: "Lab 2",
    status: "completed",
    registeredCount: 62,
  },
];

export default function CoordinatorEvents() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CoordinatorEvent["status"]>("all");

  const filtered = useMemo(() => {
    return demoEvents.filter((e) => {
      const matchesQuery =
        query.trim() === "" ||
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.venue.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || e.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">My Events</h1>
            <p className="text-muted-foreground">
              Choose an event to mark attendance. (UI-only for now)
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/coordinator">Back to Dashboard</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Find an event</CardTitle>
            <CardDescription>Search and filter your assigned events.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or venue…"
                className="pl-10"
              />
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
                <Button
                  key={s}
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map((event) => {
            const badgeVariant =
              event.status === "upcoming"
                ? "secondary"
                : event.status === "ongoing"
                  ? "success"
                  : event.status === "cancelled"
                    ? "destructive"
                    : "outline";

            return (
              <Card key={event.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={badgeVariant as any}>{event.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {event.registeredCount} registered
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg leading-tight truncate">{event.title}</h3>
                      <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>{event.time}</span>
                        <span>•</span>
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col gap-2">
                      <Button size="sm" asChild>
                        <Link to={`/coordinator/scan?eventId=${event.id}`}>
                          Mark Attendance <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/coordinator/manual?eventId=${event.id}`}>Manual Entry</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="font-medium">No events found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search or status filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

