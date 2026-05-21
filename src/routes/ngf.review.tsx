import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logEvent } from "@/lib/audit";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/ngf/review")({ component: ReviewQueue });

type Submission = {
  id: string;
  state_code: string;
  survey_id: string;
  status: string;
  completion_pct: number;
  payload: Record<string, unknown>;
  flags: Array<{ label: string; severity: string; message: string }>;
  ai_risk_score: number;
  submitted_at: string | null;
  review_notes: string | null;
  surveys?: { title: string; code: string };
  states?: { name: string };
};

function ReviewQueue() {
  const qc = useQueryClient();
  const [active, setActive] = useState<Submission | null>(null);
  const [notes, setNotes] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["review-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_submissions")
        .select("*, surveys(title,code), states(name)")
        .in("status", ["submitted", "approved", "rejected"])
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Submission[];
    },
  });

  const pending = useMemo(() => rows.filter((r) => r.status === "submitted"), [rows]);
  const done = useMemo(() => rows.filter((r) => r.status !== "submitted"), [rows]);

  async function decide(id: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("survey_submissions")
      .update({
        status,
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Submission ${status}`);
    logEvent(`submission.${status}`, "survey_submissions", id, { notes });
    setActive(null);
    setNotes("");
    qc.invalidateQueries({ queryKey: ["review-queue"] });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Review Queue"
        description={`${pending.length} submissions awaiting validation · ${done.length} resolved`}
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({done.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 grid gap-3">
          {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {pending.map((r) => (
            <SubmissionRow key={r.id} row={r} onOpen={() => { setActive(r); setNotes(r.review_notes ?? ""); }} />
          ))}
          {!pending.length && !isLoading && (
            <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Inbox zero. Nothing to review.</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 grid gap-3">
          {done.map((r) => (
            <SubmissionRow key={r.id} row={r} onOpen={() => setActive(r)} />
          ))}
        </TabsContent>
      </Tabs>

      {active && (
        <Card className="shadow-soft border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="font-display text-lg">
                  {active.states?.name ?? active.state_code} · {active.surveys?.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Submitted {active.submitted_at ? new Date(active.submitted_at).toLocaleString() : "—"} ·
                  {" "}{active.completion_pct}% complete · Risk score {active.ai_risk_score}/100
                </p>
              </div>
              <Link to="/ngf/states">
                <Button variant="outline" size="sm">
                  State profile <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Validation flags ({(active.flags ?? []).length})
              </div>
              {(active.flags ?? []).length === 0 ? (
                <div className="rounded-md border bg-[color:var(--success)]/5 px-3 py-2 text-sm text-[color:var(--success)]">
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />No issues detected.
                </div>
              ) : (
                <ul className="space-y-1">
                  {(active.flags ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm">
                      <AlertTriangle
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          f.severity === "error" ? "text-destructive" : "text-amber-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{f.label}</div>
                        <div className="text-xs text-muted-foreground">{f.message}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Submitted payload
              </div>
              <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-snug">
                {JSON.stringify(active.payload ?? {}, null, 2)}
              </pre>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reviewer notes (optional)
              </div>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context for the state — what to fix, what's missing, what changed."
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="ghost" onClick={() => setActive(null)}>Close</Button>
              <Button variant="outline" onClick={() => decide(active.id, "rejected")}>
                <XCircle className="mr-1 h-4 w-4" />Request revision
              </Button>
              <Button className="bg-primary" onClick={() => decide(active.id, "approved")}>
                <CheckCircle2 className="mr-1 h-4 w-4" />Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SubmissionRow({ row, onOpen }: { row: Submission; onOpen: () => void }) {
  const flagCount = (row.flags ?? []).length;
  const statusBadge =
    row.status === "approved"
      ? <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]"><CheckCircle2 className="mr-1 h-3 w-3" />Approved</Badge>
      : row.status === "rejected"
      ? <Badge className="bg-destructive/10 text-destructive"><XCircle className="mr-1 h-3 w-3" />Revision</Badge>
      : <Badge className="bg-primary/10 text-primary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
  return (
    <Card className="shadow-soft">
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{row.states?.name ?? row.state_code}</span>
            <span className="text-sm text-muted-foreground">· {row.surveys?.title ?? row.survey_id}</span>
            {statusBadge}
            {flagCount > 0 && (
              <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                <AlertTriangle className="mr-1 h-3 w-3" />{flagCount} flag{flagCount > 1 ? "s" : ""}
              </Badge>
            )}
            {row.ai_risk_score > 0 && (
              <Badge variant="outline">Risk {row.ai_risk_score}</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.completion_pct}% complete · submitted {row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : "—"}
          </div>
        </div>
        <Button size="sm" onClick={onOpen} className="bg-primary">Review</Button>
      </CardContent>
    </Card>
  );
}
