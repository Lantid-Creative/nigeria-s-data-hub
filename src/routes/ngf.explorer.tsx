import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDimensions } from "@/lib/state-data";
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/ngf/explorer")({ component: Explorer });

const DIM_KEYS = ["economic","fiscal","social","security","climate","human_capital","governance"] as const;
type DimKey = typeof DIM_KEYS[number];

function useAllScoresHistory() {
  return useQuery({
    queryKey: ["all-scores-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_scores")
        .select("*, reporting_cycles(code,label,starts_on), states(name,zone_code)")
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function Explorer() {
  const { data: dims = [] } = useDimensions();
  const { data: rows = [], isLoading } = useAllScoresHistory();
  const [dim, setDim] = useState<DimKey>("economic");

  const byState = useMemo(() => {
    type Entry = { code: string; name: string; zone: string; series: { period: string; value: number; sort: string }[] };
    const map = new Map<string, Entry>();
    for (const r of rows as any[]) {
      const c = r.reporting_cycles; if (!c) continue;
      const v = Number(r[dim] ?? NaN); if (Number.isNaN(v)) continue;
      const entry = map.get(r.state_code) ?? { code: r.state_code, name: r.states?.name ?? r.state_code, zone: r.states?.zone_code ?? "—", series: [] };
      entry.series.push({ period: c.label, value: v, sort: c.starts_on });
      map.set(r.state_code, entry);
    }
    for (const e of map.values()) e.series.sort((a,b) => a.sort.localeCompare(b.sort));
    return Array.from(map.values()).sort((a,b) => a.name.localeCompare(b.name));
  }, [rows, dim]);

  // Outliers: z-score on latest value across states
  const outliers = useMemo(() => {
    const latest = byState.map(s => ({ ...s, last: s.series.at(-1)?.value ?? null })).filter(s => s.last != null) as any[];
    const mean = latest.reduce((a,b) => a + b.last, 0) / Math.max(latest.length,1);
    const sd = Math.sqrt(latest.reduce((a,b) => a + (b.last - mean) ** 2, 0) / Math.max(latest.length,1)) || 1;
    return latest.map(s => ({ ...s, z: (s.last - mean) / sd })).filter(s => Math.abs(s.z) > 1.3).sort((a,b) => b.z - a.z);
  }, [byState]);

  const dimLabel = dims.find((d:any) => d.code === dim)?.name ?? dim;

  return (
    <div className="space-y-6">
      <SectionHeader title="Indicator Explorer" description="Small-multiples trend across all 36 states, with statistical outlier callouts." />

      <Card className="shadow-soft">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm font-medium">Dimension</span>
          <Select value={dim} onValueChange={(v) => setDim(v as DimKey)}>
            <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIM_KEYS.map(k => (
                <SelectItem key={k} value={k}>{dims.find((d:any) => d.code === k)?.name ?? k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">{byState.length} states</Badge>
          <Badge variant="outline" className="border-amber-500/40 text-amber-600">
            <AlertTriangle className="mr-1 h-3 w-3" /> {outliers.length} outliers
          </Badge>
        </CardContent>
      </Card>

      {outliers.length > 0 && (
        <Card className="shadow-soft border-amber-500/30">
          <CardHeader><CardTitle className="font-display text-lg">Outliers · {dimLabel}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {outliers.map(o => (
                <div key={o.code} className="flex items-center justify-between rounded-md border bg-card p-2 text-sm">
                  <div>
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-muted-foreground">{o.zone}</div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${o.z > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {o.z > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {o.last.toFixed(1)} · z={o.z.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {isLoading && <div className="col-span-full text-sm text-muted-foreground">Loading…</div>}
        {byState.map(s => {
          const last = s.series.at(-1)?.value ?? null;
          const first = s.series[0]?.value ?? null;
          const delta = (last != null && first != null) ? last - first : null;
          return (
            <Card key={s.code} className="shadow-soft">
              <CardContent className="p-3">
                <div className="mb-1 flex items-baseline justify-between">
                  <div className="text-xs font-semibold">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground">{s.zone}</div>
                </div>
                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={s.series} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip contentStyle={{ fontSize: 11 }} labelStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="font-semibold">{last?.toFixed(1) ?? "—"}</span>
                  {delta != null && (
                    <span className={delta >= 0 ? "text-emerald-600" : "text-rose-600"}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
