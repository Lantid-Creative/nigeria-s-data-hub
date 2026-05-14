import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/audit";
import { toast } from "sonner";
import { useState } from "react";
import { DollarSign, Trash2 } from "lucide-react";

export const Route = createFileRoute("/ngf/grants")({ component: Grants });

const STAGES = [
  { key: "prospect", label: "Prospect", tone: "bg-muted" },
  { key: "negotiation", label: "Negotiation", tone: "bg-[color:var(--info)]/10" },
  { key: "active", label: "Active", tone: "bg-emerald-500/10" },
  { key: "completed", label: "Completed", tone: "bg-primary/10" },
  { key: "closed", label: "Closed", tone: "bg-foreground/5" },
];

function Grants() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ donor: "", program: "", amount_usd: "", start_date: "", end_date: "", state_code: "", status: "prospect" });

  const { data: rows = [] } = useQuery({
    queryKey: ["grants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("grants_registry").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = async () => {
    if (!form.donor.trim() || !form.program.trim()) return toast.error("Donor and program required");
    const payload: any = { ...form };
    payload.amount_usd = form.amount_usd ? Number(form.amount_usd) : null;
    payload.start_date = form.start_date || null;
    payload.end_date = form.end_date || null;
    payload.state_code = form.state_code || null;
    const { error } = await supabase.from("grants_registry").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Grant added");
    logEvent("grant.create", "grant", null, payload);
    setForm({ donor: "", program: "", amount_usd: "", start_date: "", end_date: "", state_code: "", status: "prospect" });
    qc.invalidateQueries({ queryKey: ["grants"] });
  };

  const remove = async (id: string) => {
    await supabase.from("grants_registry").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["grants"] });
  };

  const move = async (id: string, status: string) => {
    const { error } = await supabase.from("grants_registry").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    logEvent("grant.move", "grant", id, { status });
    qc.invalidateQueries({ queryKey: ["grants"] });
  };

  const total = rows.reduce((a: number, r: any) => a + Number(r.amount_usd ?? 0), 0);
  const active = rows.filter((r: any) => r.status === "active").length;

  return (
    <div className="space-y-6">
      <SectionHeader title="Grants & partners" description="Donor pipeline, drag forward as deals progress" />

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Total committed (USD)" value={`$${(total / 1e6).toFixed(1)}M`} icon={DollarSign} accent="primary" />
        <StatCard label="Active grants" value={active} icon={DollarSign} accent="gold" />
        <StatCard label="Pipeline entries" value={rows.length} icon={DollarSign} accent="info" />
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Add grant</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div><Label>Donor</Label><Input value={form.donor} onChange={(e) => setForm({ ...form, donor: e.target.value })} /></div>
          <div><Label>Program</Label><Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} /></div>
          <div><Label>Amount (USD)</Label><Input type="number" value={form.amount_usd} onChange={(e) => setForm({ ...form, amount_usd: e.target.value })} /></div>
          <div><Label>Start</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
          <div><Label>End</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
          <div><Label>State (optional)</Label><Input value={form.state_code} onChange={(e) => setForm({ ...form, state_code: e.target.value.toUpperCase() })} placeholder="KD" /></div>
          <div><Label>Stage</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3"><Button onClick={create} className="bg-primary">Add to pipeline</Button></div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        {STAGES.map((s) => {
          const items = rows.filter((r: any) => (r.status ?? "prospect") === s.key);
          const sum = items.reduce((a: number, r: any) => a + Number(r.amount_usd ?? 0), 0);
          return (
            <div key={s.key} className={`rounded-lg border ${s.tone} p-3`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display text-sm font-semibold">{s.label}</div>
                <Badge variant="outline" className="text-[10px]">{items.length} · ${(sum/1e6).toFixed(1)}M</Badge>
              </div>
              <div className="space-y-2">
                {items.map((r: any) => (
                  <div key={r.id} className="rounded-md border bg-card p-3 shadow-sm">
                    <div className="text-sm font-medium leading-tight">{r.donor}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{r.program}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{r.amount_usd ? `$${Number(r.amount_usd).toLocaleString()}` : "—"}</span>
                      {r.state_code && <Badge variant="secondary" className="text-[10px]">{r.state_code}</Badge>}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Select value={r.status ?? "prospect"} onValueChange={(v) => move(r.id, v)}>
                        <SelectTrigger className="h-7 w-full text-[11px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{STAGES.map((x) => <SelectItem key={x.key} value={x.key}>{x.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
                {!items.length && <div className="rounded-md border border-dashed p-3 text-center text-[11px] text-muted-foreground">Empty</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
