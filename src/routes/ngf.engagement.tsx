import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAllStates } from "@/lib/state-data";
import { logEvent } from "@/lib/audit";
import { toast } from "sonner";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/ngf/engagement")({ component: Engagement });

function Engagement() {
  const qc = useQueryClient();
  const { data: states = [] } = useAllStates();
  const [form, setForm] = useState({ state_code: "KD", event_type: "meeting", event_date: "", summary: "", responsiveness: 3 });

  const { data: rows = [] } = useQuery({
    queryKey: ["engagement"],
    queryFn: async () => {
      const { data, error } = await supabase.from("governor_engagement").select("*").order("event_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = async () => {
    const { error } = await supabase.from("governor_engagement").insert({ ...form, event_date: form.event_date || new Date().toISOString().slice(0, 10) });
    if (error) return toast.error(error.message);
    toast.success("Logged");
    logEvent("engagement.create", "engagement", null, form);
    setForm({ state_code: form.state_code, event_type: "meeting", event_date: "", summary: "", responsiveness: 3 });
    qc.invalidateQueries({ queryKey: ["engagement"] });
  };

  const scoreboard = useMemo(() => {
    const map = new Map<string, { events: number; avg_resp: number; sum: number }>();
    for (const r of rows as any[]) {
      const g = map.get(r.state_code) ?? { events: 0, avg_resp: 0, sum: 0 };
      g.events += 1; g.sum += Number(r.responsiveness ?? 0);
      g.avg_resp = +(g.sum / g.events).toFixed(1);
      map.set(r.state_code, g);
    }
    return Array.from(map.entries()).map(([code, v]) => ({ code, name: states.find((s: any) => s.code === code)?.name ?? code, ...v }))
      .sort((a, b) => b.events - a.events);
  }, [rows, states]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Governor engagement" description="Track meetings, calls, and commitments per state" />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Log engagement</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div><Label>State</Label>
            <Select value={form.state_code} onValueChange={(v) => setForm({ ...form, state_code: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{states.map((s: any) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Type</Label>
            <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["meeting","call","letter","commitment","visit"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Date</Label><Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
          <div><Label>Responsiveness (1-5)</Label>
            <Select value={String(form.responsiveness)} onValueChange={(v) => setForm({ ...form, responsiveness: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2"><Label>Summary</Label><Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
          <div className="md:col-span-2"><Button onClick={create} className="bg-primary">Log</Button></div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Engagement scorecard</CardTitle></CardHeader>
          <CardContent className="divide-y p-0">
            {scoreboard.map((s) => (
              <div key={s.code} className="flex items-center justify-between p-4">
                <div className="font-medium">{s.name}</div>
                <div className="flex items-center gap-6 text-sm">
                  <span><span className="text-muted-foreground">Events</span> <span className="ml-1 font-display text-base">{s.events}</span></span>
                  <span><span className="text-muted-foreground">Avg resp</span> <span className="ml-1 font-display text-base">{s.avg_resp}</span></span>
                </div>
              </div>
            ))}
            {!scoreboard.length && <div className="p-6 text-center text-sm text-muted-foreground">Nothing logged yet.</div>}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Timeline</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="relative max-h-[420px] overflow-y-auto pl-6 pr-4 py-4">
              <div className="absolute bottom-4 left-3 top-4 w-px bg-border" />
              {(rows as any[]).slice(0, 80).map((r) => {
                const tone = r.responsiveness >= 4 ? "bg-emerald-500" : r.responsiveness <= 2 ? "bg-destructive" : "bg-gold";
                return (
                  <div key={r.id} className="relative mb-4 last:mb-0">
                    <span className={`absolute -left-[14px] top-1.5 h-2.5 w-2.5 rounded-full ${tone} ring-2 ring-background`} />
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-display text-sm">{(states as any[]).find((x: any) => x.code === r.state_code)?.name ?? r.state_code}</span>
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{r.event_type}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{r.event_date}</span>
                    </div>
                    {r.summary && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.summary}</div>}
                  </div>
                );
              })}
              {!rows.length && <div className="p-6 text-center text-sm text-muted-foreground">No events yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
