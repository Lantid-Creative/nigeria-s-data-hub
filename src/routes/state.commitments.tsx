import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStateCode } from "@/lib/state-data";
import { logEvent } from "@/lib/audit";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Target } from "lucide-react";

export const Route = createFileRoute("/state/commitments")({ component: Commitments });

const STATUSES = [
  { v: "on_track", l: "On track", icon: CheckCircle2, tone: "bg-[color:var(--success)]/15 text-[color:var(--success)]" },
  { v: "at_risk", l: "At risk", icon: AlertTriangle, tone: "bg-gold/20 text-gold-foreground" },
  { v: "missed", l: "Missed", icon: XCircle, tone: "bg-destructive/10 text-destructive" },
  { v: "done", l: "Delivered", icon: Target, tone: "bg-primary/10 text-primary" },
];

function Commitments() {
  const code = useStateCode();
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", target_date: "", dimension_code: "ECON" });

  const { data: rows = [] } = useQuery({
    queryKey: ["commitments", code],
    queryFn: async () => {
      const { data, error } = await supabase.from("commitments").select("*").eq("state_code", code).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    const { error } = await supabase.from("commitments").insert({ ...form, state_code: code });
    if (error) return toast.error(error.message);
    toast.success("Commitment added");
    setForm({ title: "", description: "", target_date: "", dimension_code: "ECON" });
    logEvent("commitment.create", "commitment", null, { state: code, title: form.title });
    qc.invalidateQueries({ queryKey: ["commitments", code] });
  };

  const updateStatus = async (id: string, status: string, progress?: number) => {
    const patch: any = { status };
    if (progress !== undefined) patch.progress = progress;
    const { error } = await supabase.from("commitments").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["commitments", code] });
    logEvent("commitment.update", "commitment", id, { status });
  };

  const counts = STATUSES.map(s => ({ ...s, n: rows.filter((r: any) => r.status === s.v).length }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Commitments tracker" description="Pledges your state has made — track progress and status." />

      <div className="grid gap-3 md:grid-cols-4">
        {counts.map(s => (
          <Card key={s.v} className="shadow-soft">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`grid h-10 w-10 place-items-center rounded-md ${s.tone}`}><s.icon className="h-5 w-5" /></div>
              <div><div className="text-xs text-muted-foreground">{s.l}</div><div className="font-display text-2xl">{s.n}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Add commitment</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Target date</Label><Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Dimension</Label>
            <Select value={form.dimension_code} onValueChange={(v) => setForm({ ...form, dimension_code: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["ECON","FISC","HUMAN","CLIM","GOV","SEC","SOC"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end"><Button onClick={create} className="bg-primary">Add</Button></div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">All commitments</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {rows.map((r: any) => {
            const s = STATUSES.find(x => x.v === r.status) ?? STATUSES[0];
            return (
              <div key={r.id} className="p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.dimension_code} · target {r.target_date ?? "—"}</div>
                    {r.description && <div className="mt-1 text-sm text-muted-foreground">{r.description}</div>}
                  </div>
                  <Badge className={s.tone}>{s.l}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={r.progress ?? 0} className="h-1.5 flex-1" />
                  <span className="text-xs tabular-nums">{r.progress ?? 0}%</span>
                  <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(x => <SelectItem key={x.v} value={x.v}>{x.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
          {!rows.length && <div className="p-6 text-center text-sm text-muted-foreground">No commitments yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
