import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/audit";
import { toast } from "sonner";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/ngf/risks")({ component: Risks });

function Risks() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", category: "", probability: 3, impact: 3, description: "", mitigation: "" });

  const { data: rows = [] } = useQuery({
    queryKey: ["risks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("risk_register").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    const { error } = await supabase.from("risk_register").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Risk added");
    logEvent("risk.create", "risk", null, { title: form.title });
    setForm({ title: "", category: "", probability: 3, impact: 3, description: "", mitigation: "" });
    qc.invalidateQueries({ queryKey: ["risks"] });
  };

  const remove = async (id: string) => {
    await supabase.from("risk_register").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["risks"] });
    logEvent("risk.delete", "risk", id, {});
  };

  const heatTone = (p: number, i: number) => {
    const score = p * i;
    if (score >= 16) return "bg-destructive text-white";
    if (score >= 9) return "bg-gold/70";
    return "bg-[color:var(--success)]/40";
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Risk register" description="Emerging risks tracked by probability × impact" />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Add risk</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Fiscal · Security …" /></div>
          <div><Label>Probability (1-5)</Label>
            <Select value={String(form.probability)} onValueChange={(v) => setForm({ ...form, probability: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Impact (1-5)</Label>
            <Select value={String(form.impact)} onValueChange={(v) => setForm({ ...form, impact: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Mitigation</Label><Textarea rows={2} value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })} /></div>
          <div className="md:col-span-2"><Button onClick={create} className="bg-primary">Add risk</Button></div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Active risks ({rows.length})</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {rows.map((r: any) => (
            <div key={r.id} className="flex items-start justify-between gap-3 p-4">
              <div className="flex items-start gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-md font-display text-lg ${heatTone(r.probability, r.impact)}`}>
                  {r.probability * r.impact}
                </div>
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.category} · P{r.probability} · I{r.impact}</div>
                  {r.description && <div className="mt-1 text-sm">{r.description}</div>}
                  {r.mitigation && <div className="mt-1 text-xs text-muted-foreground"><strong>Mitigation:</strong> {r.mitigation}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.status}</Badge>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {!rows.length && <div className="p-6 text-center text-sm text-muted-foreground">No risks recorded.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
