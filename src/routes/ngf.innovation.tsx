import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { useInnovationPilots, useAllStates } from "@/lib/state-data";
import { AiInsightCard } from "@/components/platform/AiInsightCard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/ngf/innovation")({ component: Innovation });

const STAGES = ["Concept", "Pilot", "Scaling", "Completed"];

function Innovation() {
  const { data: rows = [] } = useInnovationPilots();
  const { data: states = [] } = useAllStates();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", state_code: "", stage: "Pilot", summary: "", impact: "" });

  const reset = () => { setForm({ title: "", state_code: "", stage: "Pilot", summary: "", impact: "" }); setEditing(null); };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    const payload = { ...form, state_code: form.state_code || null };
    const { error } = editing
      ? await supabase.from("innovation_pilots").update(payload).eq("id", editing.id)
      : await supabase.from("innovation_pilots").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Pilot updated" : "Pilot added");
    qc.invalidateQueries({ queryKey: ["pilots"] });
    setOpen(false); reset();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this pilot?")) return;
    const { error } = await supabase.from("innovation_pilots").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["pilots"] });
  };

  const startEdit = (p: any) => {
    setEditing(p);
    setForm({ title: p.title ?? "", state_code: p.state_code ?? "", stage: p.stage ?? "Pilot", summary: p.summary ?? "", impact: p.impact ?? "" });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader title="Innovation Pilots" description="Sub-national experiments and living labs" />
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Pilot</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Pilot" : "Add Innovation Pilot"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>State</Label>
                  <Select value={form.state_code} onValueChange={(v) => setForm({ ...form, state_code: v })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {(states as any[]).map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stage</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Summary</Label><Textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
              <div><Label>Impact</Label><Input value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} placeholder="e.g. 12k farmers reached" /></div>
            </div>
            <DialogFooter><Button onClick={save}>{editing ? "Save" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <AiInsightCard
        mode="research"
        title="Innovation Portfolio Insight"
        description="AI synthesis of pilot diversity, stage distribution and scale-up candidates."
        context={{ pilots: (rows as any[]).map((p) => ({ title: p.title, stage: p.stage, state: p.states?.name ?? p.state_code, impact: p.impact, summary: p.summary })) }}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(rows as any[]).map((p) => (
          <Card key={p.id} className="shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <Lightbulb className="h-5 w-5 text-gold" />
                <div className="flex items-center gap-1">
                  <Badge variant="outline">{p.stage}</Badge>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
              <div className="mt-3 font-semibold">{p.title}</div>
              {p.summary && <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.states?.name ?? p.state_code ?? "—"}</span>
                {p.impact && <span>· {p.impact}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <Card className="md:col-span-3"><CardContent className="p-8 text-center text-sm text-muted-foreground">No pilots yet.</CardContent></Card>}
      </div>
    </div>
  );
}
