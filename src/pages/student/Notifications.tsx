import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle, CircleDashed, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";

type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function StudentNotifications() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    api.profile
      .getNotifications()
      .then((res) => setItems(res.notifications || []))
      .catch((err: any) => toast.error(err.message || "Failed to load notifications"));
  }, []);

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    return items.filter((n) => {
      const matchesFilter = filter === "all" ? true : !n.read;
      const matchesQuery =
        s === "" ||
        n.title.toLowerCase().includes(s) ||
        n.message.toLowerCase().includes(s);
      return matchesFilter && matchesQuery;
    });
  }, [items, query, filter]);

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Updates about events and your attendance.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="inline-flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {unreadCount} unread
            </Badge>
            <Button
              variant="outline"
              onClick={() => {
                setItems((prev) => prev.map((x) => ({ ...x, read: true })));
                toast.success("All notifications marked as read");
              }}
              disabled={unreadCount === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search & filter</CardTitle>
            <CardDescription>Find notifications by keyword or show only unread.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notifications…"
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                <CircleDashed className="h-4 w-4 mr-2" />
                Unread
              </Button>
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {filtered.map((n) => (
            <Card key={n.id} variant="default">
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold truncate">{n.title}</p>
                    {!n.read && <Badge variant="secondary">Unread</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="shrink-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={n.read}
                    onClick={() => {
                      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                      toast.success("Marked as read");
                    }}
                  >
                    Mark read
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-10 text-center">
                <p className="font-medium">No notifications</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search or filter.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

