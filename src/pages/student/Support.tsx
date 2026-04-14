import { useState } from "react";
import { HelpCircle, MessageSquare, LifeBuoy } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";

type Category = "attendance" | "registration" | "account" | "other";

export default function StudentSupport() {
  const [category, setCategory] = useState<Category>("attendance");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold inline-flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Support Center
          </h1>
          <p className="text-muted-foreground">Submit a ticket or browse FAQs.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Create a ticket
              </CardTitle>
              <CardDescription>We will route it to the right portal. </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Category</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["attendance", "Attendance"],
                      ["registration", "Registration"],
                      ["account", "Account"],
                      ["other", "Other"],
                    ] as const
                  ).map(([key, label]) => (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant={category === key ? "default" : "outline"}
                      onClick={() => setCategory(key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Subject</p>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Attendance not reflecting"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Message</p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue and share event name/roll number if relevant."
                  rows={5}
                />
              </div>

              <Button
                onClick={() => {
                  if (!subject.trim() || !message.trim()) {
                    toast.error("Please fill subject and message");
                    return;
                  }
                  api.support
                    .createTicket({ category, subject, message })
                    .then(() => {
                      toast.success("Ticket submitted");
                      setSubject("");
                      setMessage("");
                    })
                    .catch((err: any) => toast.error(err.message || "Failed to submit ticket"));
                }}
              >
                Submit ticket
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base inline-flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" />
                FAQs
              </CardTitle>
              <CardDescription>Quick answers to common questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <details className="group rounded-lg border p-3">
                <summary className="cursor-pointer font-medium">How do I register for events?</summary>
                <p className="text-sm text-muted-foreground mt-2">
                  Go to <b>Events</b>, open an event, and click <b>Register Now</b>.
                </p>
              </details>
              <details className="group rounded-lg border p-3">
                <summary className="cursor-pointer font-medium">Where can I see my attendance?</summary>
                <p className="text-sm text-muted-foreground mt-2">
                  Open <b>Attendance History</b> in your sidebar.
                </p>
              </details>
              <details className="group rounded-lg border p-3">
                <summary className="cursor-pointer font-medium">My attendance is still pending. What now?</summary>
                <p className="text-sm text-muted-foreground mt-2">
                  Attendance updates are marked by coordinators/convenors. If it remains pending after the event ends, submit a ticket.
                </p>
              </details>
              <div className="rounded-lg border p-3 bg-muted/20">
                <p className="text-sm font-medium">Need help urgently?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the ticket form. You can include roll number and event name.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

