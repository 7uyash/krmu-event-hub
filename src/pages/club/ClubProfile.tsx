import { useMemo, useState } from "react";
import { Shield, Users, Building2, Edit3 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockClubs } from "@/data/mockData";

export default function ClubProfile() {
  const club = mockClubs[0];
  const [editable, setEditable] = useState(false);

  const stats = useMemo(() => {
    return {
      members: club.memberCount,
      admin: club.adminEmail,
      events: 6,
    };
  }, [club]);

  return (
    <DashboardLayout role="club">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Club Profile</h1>
            <p className="text-muted-foreground">About, contacts, and membership overview. (UI-only)</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setEditable((v) => !v)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {editable ? "Done" : "Edit"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Members</p>
              <p className="text-3xl font-bold mt-1">{stats.members.toLocaleString()}</p>
              <div className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <Users className="h-4 w-4" /> active roster
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Events</p>
              <p className="text-3xl font-bold mt-1">{stats.events}</p>
              <div className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <Building2 className="h-4 w-4" /> tracked events
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Club Admin</p>
              <p className="text-3xl font-bold mt-1 text-sm break-words">{stats.admin}</p>
              <div className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                <Shield className="h-4 w-4" /> assigned controller
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{club.name}</CardTitle>
            <CardDescription>Club description and settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">About</p>
                <p className="mt-2 font-medium">{club.description}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">Approved</Badge>
                <Badge variant="success">Active</Badge>
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-muted/20">
              <p className="font-medium">Editing</p>
              <p className="text-sm text-muted-foreground mt-1">
                This screen is UI-only. In the full app, you’d store changes to club profile and membership rules.
              </p>
              <div className="pt-3">
                <Button disabled={!editable}>Save club changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

