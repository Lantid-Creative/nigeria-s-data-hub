import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllStatesLatestScores, useStateCode, useStateRow } from "@/lib/state-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AiInsightCard } from "@/components/platform/AiInsightCard";

export const Route = createFileRoute("/state/benchmark")({ component: Benchmark });

function Benchmark() {
  const code = useStateCode();
  const { data: state } = useStateRow(code);
  const { data: peers = [] } = useAllStatesLatestScores();
  const [scope, setScope] = useState<"national" | "zone">("national");

  const filtered = useMemo(() => {
    const list = scope === "zone"
      ? peers.filter((p: any) => p.states?.zone_code === state?.zone_code)
      : peers;
    return [...list].sort((a: any, b: any) => Number(b.resilience_index) - Number(a.resilience_index));
  }, [peers, scope, state]);

  const myIdx = filtered.findIndex((p: any) => p.state_code === code);
  const me = filtered[myIdx];
  const avg = filtered.length ? filtered.reduce((a: number, p: any) => a + Number(p.resilience_index), 0) / filtered.length : 0;

  const chartData = filtered.map((p: any) => ({
    name: p.states?.name ?? p.state_code,
    value: Number(p.resilience_index),
    me: p.state_code === code,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Peer Benchmarking"
        description={`Compare ${state?.name ?? code} against peers across the SNRi composite`}
        action={
          <Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
            <TabsList>
              <TabsTrigger value="zone">Zone ({state?.zone_code})</TabsTrigger>
              <TabsTrigger value="national">National</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-soft"><CardContent className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Your rank</div>
          <div className="mt-1 font-display text-3xl">#{myIdx + 1} <span className="text-base text-muted-foreground">/ {filtered.length}</span></div>
        </CardContent></Card>
        <Card className="shadow-soft"><CardContent className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Your SNRi</div>
          <div className="mt-1 font-display text-3xl text-primary">{me ? Number(me.resilience_index).toFixed(1) : "—"}</div>
        </CardContent></Card>
        <Card className="shadow-soft"><CardContent className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{scope === "zone" ? "Zone avg" : "National avg"}</div>
          <div className="mt-1 font-display text-3xl">{avg.toFixed(1)}</div>
        </CardContent></Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">SNRi composite ranking</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[480px] w-full">
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 100)" />
                <XAxis type="number" domain={[0, 100]} fontSize={11} />
                <YAxis dataKey="name" type="category" fontSize={10} width={90} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="oklch(0.45 0.13 155)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Detailed comparison</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {filtered.map((p: any, i: number) => (
            <div key={p.state_code} className={`flex items-center gap-4 px-5 py-3 text-sm ${p.state_code === code ? "bg-primary/5" : ""}`}>
              <div className="w-8 font-mono text-xs text-muted-foreground">#{i + 1}</div>
              <div className="flex-1">
                <span className={p.state_code === code ? "font-semibold text-primary" : "font-medium"}>
                  {p.states?.name ?? p.state_code}{p.state_code === code ? " (you)" : ""}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">{p.states?.zone_code}</span>
              </div>
              <div className="hidden gap-3 text-xs text-muted-foreground md:flex">
                <span>F {Number(p.fiscal ?? 0).toFixed(0)}</span>
                <span>HC {Number(p.human_capital ?? 0).toFixed(0)}</span>
                <span>S {Number(p.security ?? 0).toFixed(0)}</span>
                <span>G {Number(p.governance ?? 0).toFixed(0)}</span>
              </div>
              <Badge variant={p.state_code === code ? "default" : "outline"} className={p.state_code === code ? "bg-primary" : ""}>
                {Number(p.resilience_index).toFixed(1)}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
