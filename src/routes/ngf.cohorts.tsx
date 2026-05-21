import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { useAllStatesLatestScores, useZones, useDimensions } from "@/lib/state-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

export const Route = createFileRoute("/ngf/cohorts")({ component: Cohorts });

const DIM_KEYS = ["economic","fiscal","social","security","climate","human_capital","governance"] as const;
type Mode = "zone" | "tier";

function tierFor(pop: number | null | undefined): string {
  if (!pop) return "Unknown";
  if (pop >= 8) return "Mega (≥8M)";
  if (pop >= 5) return "Large (5–8M)";
  if (pop >= 3) return "Mid (3–5M)";
  return "Small (<3M)";
}

function Cohorts() {
  const { data: scores = [] } = useAllStatesLatestScores();
  const { data: zones = [] } = useZones();
  const { data: dims = [] } = useDimensions();
  const [mode, setMode] = useState<Mode>("zone");

  const cohorts = useMemo(() => {
    type Cohort = { key: string; states: any[]; avg: Record<string, number>; n: number };
    const groups = new Map<string, Cohort>();
    for (const s of scores as any[]) {
      const key = mode === "zone"
        ? (zones.find((z:any) => z.code === s.states?.zone_code)?.name ?? s.states?.zone_code ?? "—")
        : tierFor(s.states?.population_millions);
      const g: Cohort = groups.get(key) ?? { key, states: [], avg: {}, n: 0 };
      g.states.push(s); g.n += 1;
      groups.set(key, g);
    }
    for (const g of groups.values()) {
      const fields = ["resilience_index", ...DIM_KEYS] as const;
      for (const f of fields) {
        const vals = g.states.map(s => Number(s[f] ?? NaN)).filter(v => !Number.isNaN(v));
        g.avg[f] = vals.length ? +(vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1) : 0;
      }
    }
    return Array.from(groups.values()).sort((a,b) => b.avg.resilience_index - a.avg.resilience_index);
  }, [scores, zones, mode]);

  const radarData = useMemo(() => DIM_KEYS.map(k => {
    const row: any = { dimension: dims.find((d:any) => d.code === k)?.name ?? k };
    for (const c of cohorts) row[c.key] = c.avg[k];
    return row;
  }), [cohorts, dims]);

  const colors = ["hsl(var(--primary))", "hsl(var(--gold))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="space-y-6">
      <SectionHeader title="Cohort Analysis" description="Group states by geo-political zone or population tier — compare SNRI and dimension performance side by side." />

      <Card className="shadow-soft">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm font-medium">Group by</span>
          <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="zone">Geo-political zone</SelectItem>
              <SelectItem value="tier">Population tier</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">{cohorts.length} cohorts · {scores.length} states</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Average SNRI by cohort</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohorts} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                  <XAxis dataKey="key" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avg.resilience_index" fill="hsl(var(--primary))" name="SNRI" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Dimension profile</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  {cohorts.map((c, i) => (
                    <Radar key={c.key} name={c.key} dataKey={c.key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.15} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Cohort detail</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-2 py-2 text-left">Cohort</th>
                <th className="px-2 py-2 text-right">States</th>
                <th className="px-2 py-2 text-right">SNRI</th>
                {DIM_KEYS.map(k => <th key={k} className="px-2 py-2 text-right">{(dims.find((d:any) => d.code === k)?.name ?? k).slice(0,6)}</th>)}
              </tr>
            </thead>
            <tbody>
              {cohorts.map(c => (
                <tr key={c.key} className="border-b last:border-0">
                  <td className="px-2 py-2 font-medium">{c.key}</td>
                  <td className="px-2 py-2 text-right">{c.n}</td>
                  <td className="px-2 py-2 text-right font-semibold">{c.avg.resilience_index}</td>
                  {DIM_KEYS.map(k => <td key={k} className="px-2 py-2 text-right">{c.avg[k]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
