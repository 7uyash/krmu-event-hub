import { useEffect, useState } from "react";
import { Settings, ShieldCheck, Globe, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function SystemSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [lockRegistrations, setLockRegistrations] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [defaultAttendancePolicy, setDefaultAttendancePolicy] = useState<"strict" | "normal">("normal");

  useEffect(() => {
    api.admin
      .getSystemSettings()
      .then((res) => {
        const s = res.settings || {};
        setMaintenanceMode(!!s.maintenanceMode);
        setLockRegistrations(!!s.lockRegistrations);
        setRequire2FA(!!s.require2FA);
        setDefaultAttendancePolicy(s.defaultAttendancePolicy === "strict" ? "strict" : "normal");
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold inline-flex items-center gap-2">
            <Settings className="h-6 w-6" />
            System Settings
          </h1>
          <p className="text-muted-foreground">Operational configuration for the platform.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Platform status
              </CardTitle>
              <CardDescription>When enabled, restricts actions across the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Maintenance mode</p>
                  <p className="text-sm text-muted-foreground">Block non-admin actions.</p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Lock event registrations</p>
                  <p className="text-sm text-muted-foreground">Prevent new registrations for open events.</p>
                </div>
                <Switch checked={lockRegistrations} onCheckedChange={setLockRegistrations} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Security controls
              </CardTitle>
              <CardDescription>Recommended security toggles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Require 2FA</p>
                  <p className="text-sm text-muted-foreground">Adds an extra verification step.</p>
                </div>
                <Switch checked={require2FA} onCheckedChange={setRequire2FA} />
              </div>

              <div className="rounded-lg border p-4 bg-muted/20">
                <p className="font-medium">Default attendance policy</p>
                <p className="text-sm text-muted-foreground mt-1">Controls how strict coordinators must be when updating attendance.</p>
                <div className="flex gap-2 flex-wrap mt-3">
                  <Button size="sm" variant={defaultAttendancePolicy === "strict" ? "default" : "outline"} onClick={() => setDefaultAttendancePolicy("strict")}>
                    Strict
                  </Button>
                  <Button size="sm" variant={defaultAttendancePolicy === "normal" ? "default" : "outline"} onClick={() => setDefaultAttendancePolicy("normal")}>
                    Normal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Actions
            </CardTitle>
            <CardDescription>Apply settings or reset to safe defaults.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3 flex-col sm:flex-row">
            <Button
              onClick={() =>
                api.admin
                  .updateSystemSettings({
                    maintenanceMode,
                    lockRegistrations,
                    require2FA,
                    defaultAttendancePolicy,
                  })
                  .then(() => toast.success("Settings saved"))
                  .catch((err: any) => toast.error(err.message || "Failed to save settings"))
              }
            >
              Save changes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMaintenanceMode(false);
                setLockRegistrations(false);
                setRequire2FA(false);
                setDefaultAttendancePolicy("normal");
                toast.success("Reset completed");
              }}
            >
              Reset
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

