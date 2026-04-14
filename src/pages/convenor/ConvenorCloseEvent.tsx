import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, CheckCircle, AlertTriangle, Lock, LockKeyhole } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { EventStatus } from "@/types";

type CloseState = "ready" | "closing" | "closed";

export default function ConvenorCloseEvent() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [state, setState] = useState<CloseState>("ready");
  const [targetStatus, setTargetStatus] = useState<EventStatus>("completed");
  const [event, setEvent] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!eventId) return;
      try {
        const [eventRes, regRes] = await Promise.all([
          api.events.getById(eventId),
          api.eventsAdmin.getEventRegistrations(eventId),
        ]);
        setEvent(eventRes.event);
        setTargetStatus(eventRes.event?.status === "cancelled" ? "cancelled" : "completed");
        const pending = (regRes.registrations || []).filter((r: any) => r.attendanceStatus === "pending").length;
        setPendingCount(pending);
      } catch (err: any) {
        toast.error(err.message || "Failed to load event");
      }
    };
    load();
  }, [eventId]);

  const preview = useMemo(() => {
    if (!event) {
      return {
        title: "—",
        date: "",
        time: "",
        venue: "—",
        currentStatus: "upcoming" as const,
        pendingCount,
      };
    }
    return {
      title: event.title,
      date: event.date,
      time: event.time,
      venue: event.venue,
      currentStatus: event.status,
      pendingCount,
    };
  }, [event, pendingCount]);

  return (
    <DashboardLayout role="convenor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Finalize & Close Event</h1>
          <p className="text-muted-foreground">
            Close the event after attendance is collected.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event preview
            </CardTitle>
            <CardDescription>
              Event ID: <b>{eventId || "—"}</b>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div>
                <h2 className="text-lg font-semibold">{preview.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {preview.venue} • {preview.time} • {preview.date}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{preview.currentStatus}</Badge>
                <Badge variant={preview.pendingCount > 0 ? "destructive" : "success"}>
                  {preview.pendingCount} pending
                </Badge>
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-muted/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium">What closing does</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Locks attendance edits and marks the event as completed/cancelled depending on your selection.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <LockKeyhole className="h-4 w-4" />
                Completion status
              </CardTitle>
              <CardDescription>Choose what the final status should be.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">Completed</p>
                  <p className="text-sm text-muted-foreground">Mark as completed after attendance is collected.</p>
                </div>
                <Button variant={targetStatus === "completed" ? "default" : "outline"} onClick={() => setTargetStatus("completed")}>
                  Select
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">Cancelled</p>
                  <p className="text-sm text-muted-foreground">Cancel if the event did not happen.</p>
                </div>
                <Button variant={targetStatus === "cancelled" ? "default" : "outline"} onClick={() => setTargetStatus("cancelled")}>
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm closure
              </CardTitle>
              <CardDescription>Enable the final action once you confirm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">I confirm attendance collection is complete.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </label>

              <Button
                className="w-full"
                disabled={!confirmChecked || state !== "ready"}
                onClick={async () => {
                  setState("closing");
                  try {
                    await api.eventsAdmin.updateEventStatus(eventId, {
                      status: targetStatus,
                      isOpen: false,
                    });
                    setState("closed");
                    toast.success(`Event marked as ${targetStatus}`);
                  } catch (err: any) {
                    setState("ready");
                    toast.error(err.message || "Failed to close event");
                  }
                }}
              >
                {state === "ready" && "Close event"}
                {state === "closing" && "Closing…"}
                {state === "closed" && (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Closed
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

