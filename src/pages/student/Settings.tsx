import { useState } from "react";
import { SlidersHorizontal, ShieldCheck, Bell, Lock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function StudentSettings() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [attendanceUpdates, setAttendanceUpdates] = useState(true);
  const [shareProfile, setShareProfile] = useState(false);
  const [sessionLock, setSessionLock] = useState(true);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your preferences. (UI-only)</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Notifications preferences
              </CardTitle>
              <CardDescription>Control what you get and how often.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">Email digest</p>
                  <p className="text-sm text-muted-foreground">Weekly summary of your events.</p>
                </div>
                <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">Event reminders</p>
                  <p className="text-sm text-muted-foreground">Upcoming event notifications.</p>
                </div>
                <Switch checked={eventReminders} onCheckedChange={setEventReminders} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">Attendance updates</p>
                  <p className="text-sm text-muted-foreground">When your attendance is updated.</p>
                </div>
                <Switch checked={attendanceUpdates} onCheckedChange={setAttendanceUpdates} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Privacy & security
              </CardTitle>
              <CardDescription>Visibility and session protection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium inline-flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Profile sharing
                  </p>
                  <p className="text-sm text-muted-foreground">Allow others to view your basic info.</p>
                </div>
                <Switch checked={shareProfile} onCheckedChange={setShareProfile} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium inline-flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Session auto-lock
                  </p>
                  <p className="text-sm text-muted-foreground">Lock session after inactivity.</p>
                </div>
                <Switch checked={sessionLock} onCheckedChange={setSessionLock} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              setEmailDigest(true);
              setEventReminders(true);
              setAttendanceUpdates(true);
              setShareProfile(false);
              setSessionLock(true);
              toast.success("Settings reset to defaults");
            }}
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              toast.success("Settings saved (UI-only)");
            }}
          >
            Save changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

