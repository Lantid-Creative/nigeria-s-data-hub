import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Sparkles, BarChart3, Table as TableIcon } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAllStatesLatestScores, useDimensions, useNationalSnriTrend, useZones } from "@/lib/state-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/ngf/askdata")({ component: AskData });

const SAMPLES = [
  "Which state had the biggest SNRI gain this cycle?",
  "What's the average fiscal score in the South-South zone?",
  "Which dimensions are dragging the national score down?",
  "Top 3 states for human capital — and why?",
];

const DIM_KEYS = ["resilience_index","economic","fiscal","social","security","climate","human_capital","governance"] as const;

function detectMetric(q: string): typeof DIM_KEYS[number] {
  const s = q.toLowerCase();
  if (s.includes("fiscal")) return "fiscal";
  if (s.includes("human capital") || s.includes("education") || s.includes("health")) return "human_capital";
  if (s.includes("climate") || s.includes("environment")) return "climate";
  if (s.includes("security") || s.includes("violence") || s.includes("crime")) return "security";
  if (s.includes("social")) return "social";
  if (s.includes("govern")) return "governance";
  if (s.includes("economic") || s.includes("gdp") || s.includes("growth")) return "economic";
  return "resilience_index";
}

function AskData() {
  const { data: scores = [] } = useAllStatesLatestScores();
  const { data: dims = [] } = useDimensions();
  const { data: zones = [] } = useZones();
  const { data: trend = [] } = useNationalSnriTrend();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [metric, setMetric] = useState<typeof DIM_KEYS[number]>("resilience_index");

  const ranked = useMemo(() => {
    return (scores as any[])
      .map(s => ({
        code: s.state_code,
        name: s.states?.name ?? s.state_code,
        zone: zones.find((z:any) => z.code === s.states?.zone_code)?.name ?? s.states?.zone_code ?? "—",
        value: Number(s[metric] ?? 0),
      }))
      .sort((a,b) => b.value - a.value);
  }, [scores, zones, metric]);

  const ask = async (question?: string) => {
    const Q = (question ?? q).trim();
    if (!Q) return;
    setQ(Q); setLoading(true); setAnswer("");
    setMetric(detectMetric(Q));
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

  const metricLabel = metric === "resilience_index" ? "SNRI" : (dims.find((d:any) => d.code === metric)?.name ?? metric);

  return (
    <div className="space-y-6">
      <SectionHeader title="Ask the Data" description="Natural-language queries with AI narrative, ranked tables, and live charts over the SNRI dataset." />

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
          <CardHeader><CardTitle className="font-display text-lg">AI narrative</CardTitle></CardHeader>
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

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Data slice · {metricLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList>
              <TabsTrigger value="chart"><BarChart3 className="mr-1 h-3.5 w-3.5" /> Chart</TabsTrigger>
              <TabsTrigger value="table"><TableIcon className="mr-1 h-3.5 w-3.5" /> Table</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ranked} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="table">
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">#</th>
                      <th className="px-2 py-2 text-left">State</th>
                      <th className="px-2 py-2 text-left">Zone</th>
                      <th className="px-2 py-2 text-right">{metricLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranked.map((r, i) => (
                      <tr key={r.code} className="border-b last:border-0">
                        <td className="px-2 py-1.5 text-muted-foreground">{i+1}</td>
                        <td className="px-2 py-1.5 font-medium">{r.name}</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{r.zone}</td>
                        <td className="px-2 py-1.5 text-right font-semibold">{r.value.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
