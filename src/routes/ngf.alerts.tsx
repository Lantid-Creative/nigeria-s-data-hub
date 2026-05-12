import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlerts, useAllSubmissions, useAllStates } from "@/lib/state-data";
import { AiInsightCard } from "@/components/platform/AiInsightCard";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/audit";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone, Trash2, Send } from "lucide-react";

export const Route = createFileRoute("/ngf/alerts")({ component: AlertsPage });

function AlertsPage() {
  const { data: alerts = [] } = useAlerts(null);
  const { data: subs = [] } = useAllSubmissions();
  const { data: states = [] } = useAllStates();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    body: "",
    level: "medium" as "high" | "medium" | "info",
    audience: "all" as "all" | "state",
    state_code: "",
  });
  const [saving, setSaving] = useState(false);

  async function publish() {
    if (!form.title.trim()) return toast.error("Title is required");
    if (form.audience === "state" && !form.state_code) return toast.error("Pick a state");
    setSaving(true);
    const { error } = await supabase.from("alerts").insert({
      title: form.title.trim(),
      body: form.body.trim() || null,
      level: form.level,
      audience: form.audience,
      state_code: form.audience === "state" ? form.state_code : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Alert published");
    setForm({ title: "", body: "", level: "medium", audience: "all", state_code: "" });
    qc.invalidateQueries({ queryKey: ["alerts"] });
  }

  async function deleteAlert(id: string) {
    if (!confirm("Delete this alert?")) return;
    const { error } = await supabase.from("alerts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["alerts"] });
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Alerts & Early Warning" description="Broadcast risk signals and operational notices to all states or specific governments" />

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Megaphone className="h-4 w-4" /> Compose alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Flooding advisory for North-East corridor" />
          </div>
          <div>
            <Label>Body</Label>
            <Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Context, recommended action, owner, SLA…" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label>Severity</Label>
              <Select value={form.level} onValueChange={(v: any) => setForm({ ...form, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v: any) => setForm({ ...form, audience: v, state_code: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="state">Specific state</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.audience === "state" && (
              <div>
                <Label>State</Label>
                <Select value={form.state_code} onValueChange={(v) => setForm({ ...form, state_code: v })}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {(states as any[]).map((s) => (
                      <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={publish} disabled={saving} className="bg-primary">
              <Send className="mr-2 h-4 w-4" /> {saving ? "Publishing…" : "Publish alert"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AiInsightCard
        mode="automation"
        title="Automation Playbook"
        description="AI-generated triggers, owners and SLAs based on current alerts and submission status."
        context={{
          alerts: (alerts as any[]).slice(0, 25).map((a) => ({ title: a.title, level: a.level, audience: a.audience, state: a.state_code, body: a.body })),
          submissionSummary: {
            total: subs.length,
            byStatus: (subs as any[]).reduce((acc: any, s: any) => { acc[s.status] = (acc[s.status] ?? 0) + 1; return acc; }, {}),
            avgCompletion: Math.round((subs as any[]).reduce((a, s: any) => a + (s.completion_pct ?? 0), 0) / Math.max(subs.length, 1)),
          },
        }}
      />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Published alerts</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {(alerts as any[]).map((a) => (
            <div key={a.id} className="flex items-start gap-4 p-4">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${a.level === "high" ? "bg-destructive" : a.level === "medium" ? "bg-gold" : "bg-[color:var(--info)]"}`} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{a.title}</div>
                {a.body && <div className="mt-0.5 text-sm text-muted-foreground">{a.body}</div>}
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">{a.audience}</Badge>
                  {a.state_code && <span>{a.state_code}</span>}
                  <span>· {new Date(a.created_at).toLocaleString()}</span>
                </div>
              </div>
              <Badge variant={a.level === "high" ? "destructive" : "outline"}>{a.level}</Badge>
              <Button variant="ghost" size="icon" onClick={() => deleteAlert(a.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {!alerts.length && <div className="p-8 text-center text-sm text-muted-foreground">No alerts yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
