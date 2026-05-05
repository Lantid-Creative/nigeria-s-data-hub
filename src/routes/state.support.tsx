import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/state/support")({ component: Support });

function Support() {
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="space-y-6">
      <SectionHeader title="Support" description="Get help from the NGF Futures Lab team" />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { i: Mail, l: "Email", v: "lab@ngf.org.ng" },
          { i: Phone, l: "Hotline", v: "+234 (0)9 461 0000" },
          { i: MessageSquare, l: "Office hours", v: "Mon–Fri, 09:00–17:00 WAT" },
        ].map((x) => (
          <Card key={x.l} className="shadow-soft">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <x.i className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{x.l}</div>
                <div className="font-medium">{x.v}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Open a ticket</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Subject</Label><Input placeholder="Brief description" /></div>
            <div><Label>Category</Label><Input placeholder="Survey · Data · Account · Other" /></div>
          </div>
          <div><Label>Message</Label><Textarea rows={5} placeholder="Describe what you need help with…" /></div>
          <Button
            className="bg-primary"
            disabled={submitting}
            onClick={() => {
              setSubmitting(true);
              setTimeout(() => { setSubmitting(false); toast.success("Ticket submitted. We'll get back to you within 1 business day."); }, 600);
            }}
          >
            Submit ticket
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
