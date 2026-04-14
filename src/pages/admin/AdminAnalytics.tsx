import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Download, Filter, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { toast } from "sonner";

type RangeKey = "7d" | "30d" | "90d" | "ytd";

const ranges: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "ytd", label: "Year to date" },
];

export default function AdminAnalytics() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    api.admin
      .getEvents()
      .then((res) => setEvents(res.events || []))
      .catch((err: any) => toast.error(err.message || "Failed to load analytics"));
  }, []);

  const cutoffDays = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
      const d = new Date(e.date);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= cutoffDays;
    });
  }, [events, cutoffDays]);

  const kpis = useMemo(() => {
    const registrations = filteredEvents.reduce((acc, e) => acc + (e.registeredCount || 0), 0);
    const attendance = filteredEvents.reduce((acc, e) => acc + (e.attendedCount || 0), 0);
    return {
      events: filteredEvents.length,
      registrations,
      attendanceRate: registrations ? Math.round((attendance / registrations) * 100) : 0,
    };
  }, [filteredEvents]);

  const categorySplit = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEvents.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    const total = filteredEvents.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      pct: Math.round((count / total) * 100),
    }));
  }, [filteredEvents]);

  return (
    <DashboardLayout role="admin" userName="Super Admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">University-wide metrics and trends.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link to="/admin">Back to Overview</Link>
            </Button>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export report
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Time range</CardTitle>
            <CardDescription>Change the window to see metrics shift.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {ranges.map((r) => (
              <Button
                key={r.key}
                size="sm"
                variant={range === r.key ? "default" : "outline"}
                onClick={() => setRange(r.key)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {r.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Events</p>
              <p className="text-3xl font-bold mt-1">{kpis.events}</p>
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" /> in selected range
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Registrations</p>
              <p className="text-3xl font-bold mt-1">{kpis.registrations.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> overall demand
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Attendance rate</p>
              <p className="text-3xl font-bold mt-1">{kpis.attendanceRate}%</p>
              <Progress value={kpis.attendanceRate} className="h-2 mt-3" />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category distribution</CardTitle>
              <CardDescription>Share of events by category (approx).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorySplit.map((c) => (
                <div key={c.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <Badge variant="secondary">{c.pct}%</Badge>
                  </div>
                  <Progress value={c.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operational notes</CardTitle>
              <CardDescription>What admins typically need on this page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="list-disc pl-5 space-y-2">
                <li>Peak registration days and top-performing departments.</li>
                <li>Drop-off analysis: registrations vs attendance.</li>
                <li>Event lifecycle tracking (upcoming → ongoing → completed).</li>
                <li>Exports for compliance and reporting.</li>
              </ul>
              <div className="pt-2">
                <Button variant="outline" disabled className="w-full">
                  Configure analytics widgets (coming soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

