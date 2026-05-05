import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useSurveys, useAllSubmissions } from "@/lib/state-data";
import { useMemo } from "react";

export const Route = createFileRoute("/ngf/surveys")({ component: SurveysPage });

function SurveysPage() {
  const { data: surveys = [] } = useSurveys();
  const { data: subs = [] } = useAllSubmissions();

  const stats = useMemo(() => {
    const bySurvey = new Map<string, any[]>();
    for (const s of subs as any[]) {
      const arr = bySurvey.get(s.survey_id) ?? [];
      arr.push(s);
      bySurvey.set(s.survey_id, arr);
    }
    return bySurvey;
  }, [subs]);

  const totalSubs = subs.length;
  const submitted = (subs as any[]).filter((s) => s.status === "submitted" || s.status === "approved").length;
  const inProgress = (subs as any[]).filter((s) => s.status === "in_progress").length;
  const pending = (subs as any[]).filter((s) => s.status === "submitted").length;

  return (
    <div className="space-y-6">
      <SectionHeader title="Survey Engine" description="Design instruments, manage cycles and validate state submissions" />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active surveys" value={surveys.length} icon={GitBranch} />
        <StatCard label="Submissions" value={totalSubs} icon={Clock} accent="info" />
        <StatCard label="Submitted/Approved" value={submitted} icon={CheckCircle2} accent="gold" />
        <StatCard label="Awaiting review" value={pending} icon={AlertCircle} accent="destructive" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(surveys as any[]).map((s) => {
          const list = stats.get(s.id) ?? [];
          const rate = Math.round((list.filter((x) => x.status === "submitted" || x.status === "approved").length / 36) * 100);
          return (
            <Card key={s.id} className="shadow-soft">
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
        {!surveys.length && <Card className="md:col-span-2"><CardContent className="p-8 text-center text-sm text-muted-foreground">No surveys yet.</CardContent></Card>}
      </div>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Recent submissions</CardTitle>
          <span className="text-xs text-muted-foreground">{inProgress} in progress</span>
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
              {(subs as any[]).slice(0, 25).map((s) => (
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
                    {s.status === "submitted" && <Button size="sm" variant="outline">Review</Button>}
                  </td>
                </tr>
              ))}
              {!subs.length && <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No submissions yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
