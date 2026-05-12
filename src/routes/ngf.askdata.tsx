import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAllStatesLatestScores, useDimensions, useNationalSnriTrend } from "@/lib/state-data";
import { toast } from "sonner";

export const Route = createFileRoute("/ngf/askdata")({ component: AskData });

const SAMPLES = [
  "Which state had the biggest SNRI gain this cycle?",
  "What's the average fiscal score in the South-South zone?",
  "Which dimensions are dragging the national score down?",
  "Top 3 states for human capital — and why?",
];

function AskData() {
  const { data: scores = [] } = useAllStatesLatestScores();
  const { data: dims = [] } = useDimensions();
  const { data: trend = [] } = useNationalSnriTrend();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const ask = async (question?: string) => {
    const Q = (question ?? q).trim();
    if (!Q) return;
    setQ(Q); setLoading(true); setAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: { mode: "ask_data", context: { question: Q, scores, dimensions: dims, trend } },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAnswer((data as any)?.content ?? "");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Ask the data" description="Natural-language queries over scores, indicators and trends." />

      <Card className="shadow-soft">
        <CardContent className="space-y-3 p-5">
          <div className="flex gap-2">
            <Input placeholder="Ask anything about the data…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} />
            <Button onClick={() => ask()} disabled={loading} className="bg-primary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="ml-1.5">Ask</span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map(s => (
              <button key={s} onClick={() => ask(s)} className="rounded-full border px-3 py-1 text-xs transition hover:bg-muted">{s}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      {(answer || loading) && (
        <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5">
          <CardHeader><CardTitle className="font-display text-lg">Answer</CardTitle></CardHeader>
          <CardContent>
            {loading && !answer && <div className="text-sm text-muted-foreground">Thinking…</div>}
            {answer && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
