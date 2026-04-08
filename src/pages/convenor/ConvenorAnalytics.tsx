import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Filter, TrendingUp, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type RangeKey = "7d" | "30d" | "90d";

const ranges: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
];

const demo: Record<RangeKey, { events: number; registrations: number; attendanceRate: number }> = {
  "7d": { events: 2, registrations: 260, attendanceRate: 64 },
  "30d": { events: 7, registrations: 980, attendanceRate: 71 },
  "90d": { events: 18, registrations: 2510, attendanceRate: 69 },
};

const topEvents = [
  { title: "Workshop: React Basics", registrations: 90, attendanceRate: 62 },
  { title: "Seminar: Career Paths", registrations: 210, attendanceRate: 0 },
  { title: "Guest Lecture: AI Ethics", registrations: 140, attendanceRate: 84 },
];

export default function ConvenorAnalytics() {
  const [range, setRange] = useState<RangeKey>("30d");
  const k = useMemo(() => demo[range], [range]);

  return (
    <DashboardLayout role="convenor">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Your event performance. (UI-only)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link to="/convenor">Back to Dashboard</Link>
            </Button>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Time range</CardTitle>
            <CardDescription>Switch to compare performance over time.</CardDescription>
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
              <p className="text-3xl font-bold mt-1">{k.events}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Registrations</p>
              <p className="text-3xl font-bold mt-1">{k.registrations.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <Users className="h-4 w-4" /> total demand
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Attendance rate</p>
              <p className="text-3xl font-bold mt-1">{k.attendanceRate}%</p>
              <Progress value={k.attendanceRate} className="h-2 mt-3" />
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> engagement quality
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top events</CardTitle>
            <CardDescription>High-level ranking (placeholder).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topEvents.map((e) => (
              <div key={e.title} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.registrations} registrations</p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <Badge variant="secondary">{e.attendanceRate}%</Badge>
                  <div className="w-28">
                    <Progress value={e.attendanceRate} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

