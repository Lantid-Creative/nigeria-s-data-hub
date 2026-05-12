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
import { FlaskConical, Plus, Pencil, Trash2 } from "lucide-react";
import { useResearchProjects } from "@/lib/state-data";
import { AiInsightCard } from "@/components/platform/AiInsightCard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/ngf/research")({ component: Research });

const STATUSES = ["Planned", "In Progress", "Field Work", "Analysis", "Published"];

function Research() {
  const { data: rows = [] } = useResearchProjects();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", lead_name: "", status: "Planned", progress: 0, summary: "" });

  const reset = () => { setForm({ title: "", lead_name: "", status: "Planned", progress: 0, summary: "" }); setEditing(null); };

  const save = async () => {
    if (!form.title.trim() || !form.lead_name.trim()) return toast.error("Title and Lead required");
    const payload = { ...form, progress: Number(form.progress) || 0 };
    const { error } = editing
      ? await supabase.from("research_projects").update(payload).eq("id", editing.id)
      : await supabase.from("research_projects").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Project updated" : "Project added");
    qc.invalidateQueries({ queryKey: ["research"] });
    setOpen(false); reset();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("research_projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["research"] });
  };

  const startEdit = (r: any) => {
    setEditing(r);
    setForm({ title: r.title ?? "", lead_name: r.lead_name ?? "", status: r.status ?? "Planned", progress: r.progress ?? 0, summary: r.summary ?? "" });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader title="Research Lab" description="Active research projects and field studies" />
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Project" : "Add Research Project"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Lead</Label><Input value={form.lead_name} onChange={(e) => setForm({ ...form, lead_name: e.target.value })} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Progress (%)</Label><Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} /></div>
              <div><Label>Summary</Label><Textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>{editing ? "Save" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <AiInsightCard
        mode="research"
        title="Portfolio Synthesis"
        description="AI assessment of research health, blockers and proposed next field studies."
        context={{
          projects: (rows as any[]).map((r) => ({ title: r.title, status: r.status, progress: r.progress, lead: r.lead_name, summary: r.summary })),
        }}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {(rows as any[]).map((r) => (
          <Card key={r.id} className="shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  <div className="font-semibold">{r.title}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline">{r.status}</Badge>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Lead: {r.lead_name}</div>
              {r.summary && <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{r.progress}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${r.progress}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <Card className="md:col-span-2"><CardContent className="p-8 text-center text-sm text-muted-foreground">No research projects yet.</CardContent></Card>}
      </div>
    </div>
  );
}
