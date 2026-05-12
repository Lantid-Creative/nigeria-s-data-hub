import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GitBranch, Clock, CheckCircle2, AlertCircle, Plus, Trash2, Edit, Eye } from "lucide-react";
import { useSurveys, useAllSubmissions, useSurveyStructure } from "@/lib/state-data";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/ngf/surveys")({ component: SurveysPage });

function SurveysPage() {
  const { data: surveys = [] } = useSurveys();
  const { data: subs = [] } = useAllSubmissions();
  const qc = useQueryClient();
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [reviewSub, setReviewSub] = useState<any | null>(null);

  const activeId = selectedSurvey ?? (surveys as any[])[0]?.id;
  const activeSurvey = (surveys as any[]).find((s) => s.id === activeId);

  const stats = useMemo(() => {
    const totalStates = 36;
    const submitted = (subs as any[]).filter((s) => s.status === "submitted" || s.status === "approved").length;
    const inProgress = (subs as any[]).filter((s) => s.status === "in_progress").length;
    const pending = (subs as any[]).filter((s) => s.status === "submitted").length;
    return { totalStates, total: subs.length, submitted, inProgress, pending };
  }, [subs]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Survey Engine"
        description="Design instruments, manage cycles and validate state submissions"
        action={<NewSurveyDialog onCreated={() => qc.invalidateQueries({ queryKey: ["surveys"] })} />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active surveys" value={(surveys as any[]).length} icon={GitBranch} />
        <StatCard label="Submissions" value={stats.total} icon={Clock} accent="info" />
        <StatCard label="Submitted/Approved" value={stats.submitted} icon={CheckCircle2} accent="gold" />
        <StatCard label="Awaiting review" value={stats.pending} icon={AlertCircle} accent="destructive" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(surveys as any[]).map((s) => {
          const list = (subs as any[]).filter((x) => x.survey_id === s.id);
          const rate = Math.round((list.filter((x) => x.status === "submitted" || x.status === "approved").length / 36) * 100);
          const isActive = s.id === activeId;
          return (
            <Card key={s.id} className={`shadow-soft cursor-pointer ${isActive ? "border-primary/40 ring-1 ring-primary/20" : ""}`} onClick={() => setSelectedSurvey(s.id)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{s.code}</div>
                    <div className="font-semibold">{s.title}</div>
                    {s.description && <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>}
                  </div>
                  <Badge>{rate}%</Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {s.sections} sections · {s.questions} questions
                  {s.due_date && <> · Due {s.due_date}</>}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!surveys.length && <Card className="md:col-span-2"><CardContent className="p-8 text-center text-sm text-muted-foreground">No surveys yet. Create one to begin.</CardContent></Card>}
      </div>

      {activeSurvey && <SurveyBuilder survey={activeSurvey} />}

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Recent submissions</CardTitle>
          <span className="text-xs text-muted-foreground">{stats.inProgress} in progress</span>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Survey</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Completion</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(subs as any[]).slice(0, 40).map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.states?.name ?? s.state_code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.surveys?.title ?? "—"}</td>
                  <td className="px-4 py-3">
                    {s.status === "approved" ? <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]">Approved</Badge> :
                     s.status === "submitted" ? <Badge className="bg-primary/10 text-primary">Submitted</Badge> :
                     s.status === "in_progress" ? <Badge className="bg-gold/20 text-gold-foreground">In progress</Badge> :
                     s.status === "rejected" ? <Badge className="bg-destructive/10 text-destructive">Rejected</Badge> :
                     <Badge variant="outline">Not started</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${s.completion_pct}%` }} />
                      </div>
                      <span className="text-xs">{s.completion_pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {(s.status === "submitted" || s.status === "approved" || s.status === "rejected") && (
                      <Button size="sm" variant="outline" onClick={() => setReviewSub(s)}>
                        <Eye className="mr-1 h-3 w-3" /> Review
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!subs.length && <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No submissions yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ReviewDialog sub={reviewSub} onClose={() => setReviewSub(null)} onDone={() => { qc.invalidateQueries({ queryKey: ["all-submissions"] }); setReviewSub(null); }} />
    </div>
  );
}

function NewSurveyDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", title: "", description: "", due_date: "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.code || !form.title) return toast.error("Code and title are required");
    setSaving(true);
    const { error } = await supabase.from("surveys").insert({
      code: form.code, title: form.title, description: form.description || null,
      due_date: form.due_date || null, sections: 0, questions: 0,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Survey created");
    setOpen(false);
    setForm({ code: "", title: "", description: "", due_date: "" });
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary"><Plus className="mr-2 h-4 w-4" /> New survey</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new survey</DialogTitle>
          <DialogDescription>Define the survey shell — add sections and questions afterwards.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Q2-2026-CORE" /></div>
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={saving} className="bg-primary">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SurveyBuilder({ survey }: { survey: any }) {
  const qc = useQueryClient();
  const { data: sections = [] } = useSurveyStructure(survey.id);
  const [secForm, setSecForm] = useState({ code: "", title: "", description: "" });
  const [qForm, setQForm] = useState<Record<string, any>>({});

  async function addSection() {
    if (!secForm.code || !secForm.title) return toast.error("Code and title required");
    const sort = (sections as any[]).length + 1;
    const { error } = await supabase.from("survey_sections").insert({
      survey_id: survey.id, code: secForm.code, title: secForm.title,
      description: secForm.description || null, sort_order: sort,
    });
    if (error) return toast.error(error.message);
    await supabase.from("surveys").update({ sections: sort }).eq("id", survey.id);
    setSecForm({ code: "", title: "", description: "" });
    qc.invalidateQueries({ queryKey: ["survey-structure", survey.id] });
    qc.invalidateQueries({ queryKey: ["surveys"] });
    toast.success("Section added");
  }

  async function deleteSection(id: string) {
    if (!confirm("Delete this section and all its questions?")) return;
    const { error } = await supabase.from("survey_sections").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["survey-structure", survey.id] });
    toast.success("Section deleted");
  }

  async function addQuestion(sectionId: string) {
    const f = qForm[sectionId] ?? {};
    if (!f.code || !f.label) return toast.error("Code and label required");
    const sec = (sections as any[]).find((s) => s.id === sectionId);
    const sort = (sec?.questions?.length ?? 0) + 1;
    const { error } = await supabase.from("survey_questions").insert({
      section_id: sectionId, code: f.code, label: f.label, help_text: f.help_text || null,
      question_type: f.question_type ?? "number", unit: f.unit || null, required: !!f.required, sort_order: sort,
    });
    if (error) return toast.error(error.message);

    // refresh totals
    const total = (sections as any[]).reduce((acc, s) => acc + (s.questions?.length ?? 0), 0) + 1;
    await supabase.from("surveys").update({ questions: total }).eq("id", survey.id);

    setQForm({ ...qForm, [sectionId]: {} });
    qc.invalidateQueries({ queryKey: ["survey-structure", survey.id] });
    qc.invalidateQueries({ queryKey: ["surveys"] });
    toast.success("Question added");
  }

  async function deleteQuestion(id: string) {
    const { error } = await supabase.from("survey_questions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["survey-structure", survey.id] });
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Edit className="h-4 w-4" /> Builder: {survey.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {(sections as any[]).map((sec) => {
          const f = qForm[sec.id] ?? {};
          return (
            <div key={sec.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{sec.title} <Badge variant="outline" className="ml-1 text-[10px]">{sec.code}</Badge></div>
                  {sec.description && <div className="text-xs text-muted-foreground">{sec.description}</div>}
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteSection(sec.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>

              <div className="space-y-1">
                {(sec.questions as any[]).map((q) => (
                  <div key={q.id} className="flex items-center justify-between rounded bg-muted/50 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{q.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {q.code} · {q.question_type}{q.unit ? ` · ${q.unit}` : ""}{q.required ? " · required" : ""}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteQuestion(q.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                {!sec.questions?.length && <div className="text-xs text-muted-foreground">No questions yet.</div>}
              </div>

              <div className="grid gap-2 md:grid-cols-6 border-t pt-3">
                <Input className="md:col-span-1" placeholder="code" value={f.code ?? ""} onChange={(e) => setQForm({ ...qForm, [sec.id]: { ...f, code: e.target.value } })} />
                <Input className="md:col-span-2" placeholder="label" value={f.label ?? ""} onChange={(e) => setQForm({ ...qForm, [sec.id]: { ...f, label: e.target.value } })} />
                <Select value={f.question_type ?? "number"} onValueChange={(v) => setQForm({ ...qForm, [sec.id]: { ...f, question_type: v } })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="longtext">Long text</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="unit" value={f.unit ?? ""} onChange={(e) => setQForm({ ...qForm, [sec.id]: { ...f, unit: e.target.value } })} />
                <Button size="sm" onClick={() => addQuestion(sec.id)} className="bg-primary"><Plus className="mr-1 h-3 w-3" />Add</Button>
              </div>
            </div>
          );
        })}

        <div className="rounded-lg border border-dashed p-4">
          <div className="text-sm font-medium mb-2">Add section</div>
          <div className="grid gap-2 md:grid-cols-4">
            <Input placeholder="code (e.g. EDU)" value={secForm.code} onChange={(e) => setSecForm({ ...secForm, code: e.target.value })} />
            <Input className="md:col-span-2" placeholder="title" value={secForm.title} onChange={(e) => setSecForm({ ...secForm, title: e.target.value })} />
            <Button onClick={addSection} className="bg-primary"><Plus className="mr-1 h-4 w-4" />Add section</Button>
          </div>
          <Textarea className="mt-2" rows={2} placeholder="description (optional)" value={secForm.description} onChange={(e) => setSecForm({ ...secForm, description: e.target.value })} />
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewDialog({ sub, onClose, onDone }: { sub: any | null; onClose: () => void; onDone: () => void }) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: structure = [] } = useQuery({
    queryKey: ["survey-structure", sub?.survey_id],
    enabled: !!sub?.survey_id,
    queryFn: async () => {
      const { data: sections } = await supabase.from("survey_sections").select("*").eq("survey_id", sub.survey_id).order("sort_order");
      const ids = (sections ?? []).map((s) => s.id);
      const { data: questions } = ids.length
        ? await supabase.from("survey_questions").select("*").in("section_id", ids).order("sort_order")
        : { data: [] as any[] };
      return (sections ?? []).map((s) => ({ ...s, questions: (questions ?? []).filter((q) => q.section_id === s.id) }));
    },
  });

  async function decide(status: "approved" | "rejected") {
    if (!sub) return;
    setSaving(true);
    const { error } = await supabase.from("survey_submissions").update({
      status, review_notes: notes || null, reviewed_at: new Date().toISOString(),
    }).eq("id", sub.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Submission approved" : "Submission returned to state");
    setNotes("");
    onDone();
  }

  return (
    <Dialog open={!!sub} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review submission</DialogTitle>
          <DialogDescription>
            {sub?.states?.name ?? sub?.state_code} · {sub?.surveys?.title} · {sub?.completion_pct}% complete
          </DialogDescription>
        </DialogHeader>
        {sub && (
          <div className="space-y-4">
            {(structure as any[]).map((sec) => (
              <div key={sec.id}>
                <div className="border-b pb-1 mb-2 font-medium">{sec.title}</div>
                <dl className="grid gap-2 md:grid-cols-2 text-sm">
                  {(sec.questions as any[]).map((q) => (
                    <div key={q.id} className="rounded bg-muted/40 px-3 py-2">
                      <dt className="text-xs text-muted-foreground">{q.label}{q.unit ? ` (${q.unit})` : ""}</dt>
                      <dd className="font-medium">{sub.payload?.[q.code] ?? <span className="text-muted-foreground">—</span>}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <div>
              <Label>Review notes</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes shared with the state…" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => decide("rejected")} disabled={saving}>Return to state</Button>
          <Button className="bg-primary" onClick={() => decide("approved")} disabled={saving}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
