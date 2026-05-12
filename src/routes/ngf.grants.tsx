import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
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
import { DollarSign, Trash2 } from "lucide-react";

export const Route = createFileRoute("/ngf/grants")({ component: Grants });

function Grants() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ donor: "", program: "", amount_usd: "", start_date: "", end_date: "", state_code: "" });

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
    setForm({ donor: "", program: "", amount_usd: "", start_date: "", end_date: "", state_code: "" });
    qc.invalidateQueries({ queryKey: ["grants"] });
  };

  const remove = async (id: string) => {
    await supabase.from("grants_registry").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["grants"] });
  };

  const total = rows.reduce((a: number, r: any) => a + Number(r.amount_usd ?? 0), 0);
  const active = rows.filter((r: any) => r.status === "active").length;

  return (
    <div className="space-y-6">
      <SectionHeader title="Grants & partners" description="Donor commitments and active programs" />

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Total committed (USD)" value={`$${(total / 1e6).toFixed(1)}M`} icon={DollarSign} accent="primary" />
        <StatCard label="Active grants" value={active} icon={DollarSign} accent="gold" />
        <StatCard label="Total entries" value={rows.length} icon={DollarSign} accent="info" />
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
          <div className="md:col-span-3"><Button onClick={create} className="bg-primary">Add</Button></div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Registry</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {rows.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="font-medium">{r.donor} — {r.program}</div>
                <div className="text-xs text-muted-foreground">
                  {r.amount_usd ? `$${Number(r.amount_usd).toLocaleString()}` : "—"} · {r.start_date ?? "—"} → {r.end_date ?? "—"} {r.state_code && `· ${r.state_code}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.status}</Badge>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {!rows.length && <div className="p-6 text-center text-sm text-muted-foreground">No grants recorded.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
