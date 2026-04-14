import { useEffect, useMemo, useState } from "react";
import { Building2, GraduationCap, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ClubOption = {
  id: string;
  name: string;
  email: string;
  description: string;
  status?: "active" | "pending" | null;
};

export default function AcademicClubs() {
  const [schools, setSchools] = useState<string[]>([]);
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [school, setSchool] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.profile
      .getOptions()
      .then((res) => {
        setSchools(res.schools || []);
        setClubs(res.clubs || []);
        setSchool(res.selected?.school || "");
        setDepartment(res.selected?.department || "");
        setSelectedClubIds(res.selected?.clubIds || []);
      })
      .catch((err: any) => toast.error(err.message || "Failed to load options"));
  }, []);

  const selectedCount = useMemo(() => selectedClubIds.length, [selectedClubIds]);

  const toggleClub = (clubId: string) => {
    setSelectedClubIds((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await Promise.all([
        api.profile.updateAcademic({ school, department }),
        api.profile.updateClubs(selectedClubIds),
      ]);
      toast.success("Academic and club preferences updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Academic & Clubs</h1>
          <p className="text-muted-foreground">
            Choose your school/department and select clubs to join. Club requests are sent as pending for approval.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic selection
              </CardTitle>
              <CardDescription>Pick your school and department.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">School</p>
                <div className="flex flex-wrap gap-2">
                  {schools.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={school === s ? "default" : "outline"}
                      onClick={() => setSchool(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Department</p>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., CSE"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                Club selection
              </CardTitle>
              <CardDescription>Select clubs you want to join.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {clubs.map((club) => {
                const checked = selectedClubIds.includes(club.id);
                return (
                  <button
                    key={club.id}
                    type="button"
                    onClick={() => toggleClub(club.id)}
                    className={`w-full text-left rounded-lg border p-3 transition ${checked ? "border-primary bg-accent/40" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{club.name}</p>
                      {club.status && <Badge variant={club.status === "active" ? "success" : "secondary"}>{club.status}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{club.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{club.email}</p>
                  </button>
                );
              })}
              {clubs.length === 0 && (
                <p className="text-sm text-muted-foreground">No clubs available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Selected clubs: <b>{selectedCount}</b>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

