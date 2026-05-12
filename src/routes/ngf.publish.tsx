import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/audit";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/ngf/publish")({ component: Publish });

function Publish() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ artifact_type: "report", title: "", scheduled_for: "", notes: "" });

  const { data: rows = [] } = useQuery({
    queryKey: ["publish-queue"],
    queryFn: async () => {
      const { data, error } = await supabase.from("publish_queue").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    const payload: any = { ...form };
    payload.scheduled_for = form.scheduled_for || null;
    const { error } = await supabase.from("publish_queue").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Queued");
    logEvent("publish.queue", "publish", null, payload);
    setForm({ artifact_type: "report", title: "", scheduled_for: "", notes: "" });
    qc.invalidateQueries({ queryKey: ["publish-queue"] });
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("publish_queue").update({ status }).eq("id", id);
    logEvent("publish.status", "publish", id, { status });
    qc.invalidateQueries({ queryKey: ["publish-queue"] });
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Publish queue" description="Stage artifacts (reports, alerts, scenarios) for approval and release" />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Add to queue</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div><Label>Artifact type</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.artifact_type} onChange={(e) => setForm({ ...form, artifact_type: e.target.value })}>
              {["report","alert","scenario","dataset"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Scheduled for</Label><Input type="datetime-local" value={form.scheduled_for} onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })} /></div>
          <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="md:col-span-2"><Button onClick={create} className="bg-primary">Queue</Button></div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Queue ({rows.length})</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {rows.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.artifact_type} · {r.scheduled_for ? new Date(r.scheduled_for).toLocaleString() : "no schedule"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "approved")}><CheckCircle2 className="mr-1 h-3 w-3" />Approve</Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "rejected")}><XCircle className="mr-1 h-3 w-3" />Reject</Button>
              </div>
            </div>
          ))}
          {!rows.length && <div className="p-6 text-center text-sm text-muted-foreground">Queue empty.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
