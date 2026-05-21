import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSurveys, useStateSubmissions, useStateCode, useSurveyStructure } from "@/lib/state-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Clock, Save, Send, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/state/surveys")({ component: Surveys });

function Surveys() {
  const code = useStateCode();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: surveys = [] } = useSurveys();
  const { data: subs = [] } = useStateSubmissions(code);
  const [active, setActive] = useState<string | null>(null);

  const activeSurvey = (surveys as any[]).find((s) => s.id === active) ?? (surveys as any[])[0];
  const activeSub = (subs as any[]).find((s) => s.survey_id === activeSurvey?.id);
  const { data: sections = [] } = useSurveyStructure(activeSurvey?.id);

  const allQuestions = useMemo(
    () => (sections as any[]).flatMap((s) => s.questions ?? []),
    [sections]
  );
  const requiredCodes = useMemo(
    () => allQuestions.filter((q) => q.required).map((q) => q.code),
    [allQuestions]
  );

  const [draft, setDraft] = useState<Record<string, any>>(activeSub?.payload ?? {});
  // re-sync draft when switching surveys
  useMemo(() => {
    setDraft(activeSub?.payload ?? {});
  }, [activeSub?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [saving, setSaving] = useState(false);

  const completion = useMemo(() => {
    if (!allQuestions.length) return 0;
    const filled = allQuestions.filter((q) => {
      const v = draft[q.code];
      return v !== undefined && v !== null && String(v).trim() !== "";
    }).length;
    return Math.round((filled / allQuestions.length) * 100);
  }, [allQuestions, draft]);

  async function saveDraft(submit = false) {
    if (!activeSurvey || !user) return;
    if (submit) {
      const missing = requiredCodes.filter((c) => !draft[c] || String(draft[c]).trim() === "");
      if (missing.length) {
        toast.error(`Please complete required fields (${missing.length} remaining)`);
        return;
      }
    }
    setSaving(true);
    const status: "submitted" | "in_progress" | "not_started" = submit
      ? "submitted"
      : completion > 0
      ? "in_progress"
      : "not_started";

    // Compute validation flags (YoY > 30% on numeric fields vs prior submission)
    let flags: Array<{ label: string; severity: string; message: string }> = [];
    let aiRisk = 0;
    if (submit) {
      const { data: prior } = await supabase
        .from("survey_submissions")
        .select("payload")
        .eq("state_code", code)
        .eq("survey_id", activeSurvey.id)
        .in("status", ["approved", "submitted", "rejected"])
        .order("submitted_at", { ascending: false })
        .limit(1);
      const priorPayload = (prior?.[0]?.payload ?? {}) as Record<string, unknown>;
      for (const q of allQuestions) {
        if (q.question_type !== "number") continue;
        const cur = Number(draft[q.code]);
        const prv = Number(priorPayload[q.code]);
        if (!Number.isFinite(cur) || !Number.isFinite(prv) || prv === 0) continue;
        const deltaPct = Math.abs(((cur - prv) / prv) * 100);
        if (deltaPct > 30) {
          flags.push({
            label: q.label,
            severity: deltaPct > 75 ? "error" : "warn",
            message: `Year-on-year change of ${deltaPct.toFixed(0)}% (was ${prv}, now ${cur}).`,
          });
        }
      }
      aiRisk = Math.min(100, flags.reduce((s, f) => s + (f.severity === "error" ? 25 : 10), 0));
    }

    const payload = {
      state_code: code,
      survey_id: activeSurvey.id,
      payload: draft,
      completion_pct: submit ? 100 : completion,
      status,
      submitted_by: user.id,
      submitted_at: submit ? new Date().toISOString() : null,
      flags,
      ai_risk_score: aiRisk,
    };
    const { error } = activeSub
      ? await supabase.from("survey_submissions").update(payload).eq("id", activeSub.id)
      : await supabase.from("survey_submissions").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    if (submit && flags.length) {
      toast.warning(`Submitted with ${flags.length} validation flag${flags.length > 1 ? "s" : ""} — NGF will review.`);
    } else {
      toast.success(submit ? "Submitted for validation" : "Draft saved");
    }
    qc.invalidateQueries({ queryKey: ["submissions", code] });
  }

  const locked = activeSub?.status === "submitted" || activeSub?.status === "approved";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Survey Engine"
        description="Submit periodic indicators directly to the NGF Futures Lab"
        action={
          <div className="flex gap-2">
            <Button variant="outline" disabled={saving || locked} onClick={() => saveDraft(false)}>
              <Save className="mr-2 h-4 w-4" />Save draft
            </Button>
            <Button className="bg-primary" disabled={saving || locked} onClick={() => saveDraft(true)}>
              <Send className="mr-2 h-4 w-4" />Submit for validation
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({(surveys as any[]).length})</TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({(subs as any[]).filter((s) => s.status === "submitted" || s.status === "approved").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {(surveys as any[]).map((s) => {
            const sub = (subs as any[]).find((x) => x.survey_id === s.id);
            const pct = sub?.completion_pct ?? 0;
            const isActive = (active ?? (surveys as any[])[0]?.id) === s.id;
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
                      {sub?.status === "rejected" && (
                        <Badge className="bg-destructive/10 text-destructive">Needs revision</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.sections} sections · {s.questions} questions · Due {s.due_date ?? "—"}
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
          {(subs as any[]).filter((s) => s.status === "submitted" || s.status === "approved").map((s: any) => (
            <Card key={s.id} className="shadow-soft">
              <CardContent className="flex items-center justify-between p-4 text-sm">
                <div>
                  <div className="font-medium">{s.surveys?.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Submitted {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "—"}
                  </div>
                </div>
                {s.status === "approved" ? (
                  <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                  </Badge>
                ) : (
                  <Badge className="bg-primary/10 text-primary">
                    <Clock className="mr-1 h-3 w-3" /> Under review
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {activeSurvey && (
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="font-display text-lg">{activeSurvey.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {activeSurvey.code} · {(sections as any[]).length} sections · {allQuestions.length} questions ·
                  last saved {activeSub ? new Date(activeSub.updated_at).toLocaleString() : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={completion} className="h-1.5 w-32" />
                <span className="text-xs text-muted-foreground">{completion}%</span>
              </div>
            </div>
            {locked && (
              <div className="mt-2 flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
                <AlertCircle className="h-3.5 w-3.5" /> This submission is locked. Contact NGF to reopen.
              </div>
            )}
            {activeSub?.review_notes && (
              <div className="mt-2 rounded-md bg-muted px-3 py-2 text-xs">
                <span className="font-medium">Review notes:</span> {activeSub.review_notes}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {(sections as any[]).length === 0 && (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                This survey has no questions yet.
              </div>
            )}
            {(sections as any[]).map((sec) => (
              <div key={sec.id} className="space-y-3">
                <div className="border-b pb-2">
                  <div className="font-display text-base font-semibold">{sec.title}</div>
                  {sec.description && <div className="text-xs text-muted-foreground">{sec.description}</div>}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {(sec.questions as any[]).map((q) => (
                    <div key={q.id} className={q.question_type === "longtext" ? "md:col-span-2" : ""}>
                      <Label className="flex items-center gap-1">
                        {q.label}
                        {q.required && <span className="text-destructive">*</span>}
                        {q.unit && <span className="text-xs text-muted-foreground">({q.unit})</span>}
                      </Label>
                      {q.question_type === "longtext" ? (
                        <Textarea
                          rows={3}
                          disabled={locked}
                          placeholder={q.help_text ?? ""}
                          value={draft[q.code] ?? ""}
                          onChange={(e) => setDraft((d) => ({ ...d, [q.code]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          type={q.question_type === "number" ? "number" : "text"}
                          disabled={locked}
                          placeholder={q.help_text ?? ""}
                          value={draft[q.code] ?? ""}
                          onChange={(e) => setDraft((d) => ({ ...d, [q.code]: e.target.value }))}
                        />
                      )}
                      {q.help_text && q.question_type !== "longtext" && (
                        <div className="mt-1 text-[11px] text-muted-foreground">{q.help_text}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="ghost" onClick={() => saveDraft(false)} disabled={saving || locked}>Save draft</Button>
              <Button className="bg-primary" onClick={() => saveDraft(true)} disabled={saving || locked}>Submit</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
