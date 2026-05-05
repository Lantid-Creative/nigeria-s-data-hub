import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSurveys, useStateSubmissions, useStateCode } from "@/lib/state-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Clock, Save, Send } from "lucide-react";

export const Route = createFileRoute("/state/surveys")({ component: Surveys });

function Surveys() {
  const code = useStateCode();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: surveys = [] } = useSurveys();
  const { data: subs = [] } = useStateSubmissions(code);
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const activeSurvey = surveys.find((s: any) => s.id === active) ?? surveys[0];
  const activeSub = subs.find((s: any) => s.survey_id === activeSurvey?.id);

  async function saveDraft(submit = false) {
    if (!activeSurvey || !user) return;
    setSaving(true);
    const completion = submit ? 100 : Math.min(95, Object.keys(draft).length * 12);
    const payload = {
      state_code: code,
      survey_id: activeSurvey.id,
      payload: draft,
      completion_pct: completion,
      status: submit ? "submitted" : completion > 0 ? "in_progress" : "not_started",
      submitted_by: user.id,
      submitted_at: submit ? new Date().toISOString() : null,
    };
    const { error } = activeSub
      ? await supabase.from("survey_submissions").update(payload).eq("id", activeSub.id)
      : await supabase.from("survey_submissions").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(submit ? "Submitted for validation" : "Draft saved");
    qc.invalidateQueries({ queryKey: ["submissions", code] });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Survey Engine"
        description="Submit periodic indicators directly to the NGF Futures Lab"
        action={
          <div className="flex gap-2">
            <Button variant="outline" disabled={saving} onClick={() => saveDraft(false)}>
              <Save className="mr-2 h-4 w-4" />Save draft
            </Button>
            <Button className="bg-primary" disabled={saving} onClick={() => saveDraft(true)}>
              <Send className="mr-2 h-4 w-4" />Submit for validation
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({surveys.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({subs.filter((s: any) => s.status === "submitted").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {surveys.map((s: any) => {
            const sub = subs.find((x: any) => x.survey_id === s.id);
            const pct = sub?.completion_pct ?? 0;
            const isActive = (active ?? surveys[0]?.id) === s.id;
            return (
              <Card key={s.id} className={`shadow-soft ${isActive ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
                <CardContent className="flex flex-wrap items-center gap-4 p-5">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s.title}</span>
                      <Badge variant="outline" className="text-[10px]">{s.code}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.sections} sections · {s.questions} questions · Due {s.due_date}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={pct} className="h-1.5 max-w-xs" />
                      <span className="text-xs text-muted-foreground">{pct}% complete</span>
                    </div>
                  </div>
                  <Button variant={isActive ? "default" : "outline"} className={isActive ? "bg-primary" : ""} onClick={() => setActive(s.id)}>
                    {isActive ? "Continue" : "Open"} <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="submitted" className="mt-6 space-y-2">
          {subs.filter((s: any) => s.status === "submitted").map((s: any) => (
            <Card key={s.id} className="shadow-soft">
              <CardContent className="flex items-center justify-between p-4 text-sm">
                <div>
                  <div className="font-medium">{s.surveys?.title}</div>
                  <div className="text-xs text-muted-foreground">Submitted {new Date(s.submitted_at).toLocaleDateString()}</div>
                </div>
                <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Submitted
                </Badge>
              </CardContent>
            </Card>
          ))}
          {subs.filter((s: any) => s.status === "submitted").length === 0 && (
            <div className="text-sm text-muted-foreground">No submissions yet this cycle.</div>
          )}
        </TabsContent>
      </Tabs>

      {activeSurvey && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">{activeSurvey.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{activeSurvey.code} · {activeSurvey.sections} sections · last saved {activeSub ? new Date(activeSub.updated_at).toLocaleString() : "—"}</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { k: "edu_enrolled", l: "Total enrolled in basic education", ph: "e.g. 2,450,000" },
                { k: "oosc", l: "Out-of-school children (estimate)", ph: "e.g. 320,000" },
                { k: "mat_mortality", l: "Maternal mortality (per 100k)", ph: "e.g. 412" },
                { k: "health_workers", l: "Health workers per 10k", ph: "e.g. 14.2" },
                { k: "igr", l: "IGR for the period (₦bn)", ph: "e.g. 56.4" },
                { k: "period", l: "Reporting period", ph: "e.g. Q4 2025" },
              ].map((f) => (
                <div key={f.k}>
                  <Label>{f.l}</Label>
                  <Input
                    placeholder={f.ph}
                    value={draft[f.k] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div>
              <Label>Notes & contextual narrative</Label>
              <Textarea
                rows={4}
                placeholder="Provide narrative context for the indicators above…"
                value={draft.notes ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="ghost" onClick={() => saveDraft(false)} disabled={saving}>Save draft</Button>
              <Button className="bg-primary" onClick={() => saveDraft(true)} disabled={saving}>Submit</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
