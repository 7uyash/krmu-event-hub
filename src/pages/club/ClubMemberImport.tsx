import { useMemo, useState } from "react";
import { Upload, Download, FileSpreadsheet, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ClubMemberImport() {
  const [rollsText, setRollsText] = useState("");
  const parsed = useMemo(() => {
    return rollsText
      .split(/[,\n\r]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rollsText]);

  return (
    <DashboardLayout role="club">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Import Members</h1>
          <p className="text-muted-foreground">Upload or paste roll numbers to update club membership. (UI-only)</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <Upload className="h-4 w-4" />
                CSV upload
              </CardTitle>
              <CardDescription>In the full app, the backend will parse the file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-dashed p-6 text-center bg-muted/20">
                <p className="font-medium">Drop your CSV here</p>
                <p className="text-sm text-muted-foreground mt-1">Expected column: `rollNumber`</p>
              </div>
              <Button disabled className="w-full">
                Upload CSV (disabled)
              </Button>
              <Button
                variant="outline"
                disabled
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download template (disabled)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Paste roll numbers
              </CardTitle>
              <CardDescription>Paste one per line or comma-separated.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={rollsText}
                onChange={(e) => setRollsText(e.target.value)}
                placeholder="e.g., 2023001&#10;2023002&#10;2023003"
                rows={10}
              />
              <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
                <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Parsed: <b>{parsed.length}</b> roll(s)
                </p>
                <Button
                  disabled={parsed.length === 0}
                  onClick={() => {
                    toast.success("Members imported (UI-only)");
                    setRollsText("");
                  }}
                >
                  Import (UI-only)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

