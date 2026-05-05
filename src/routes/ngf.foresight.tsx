import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Telescope, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useScenarios, useNationalSnriTrend } from "@/lib/state-data";
import { useState, useMemo } from "react";
import { AiInsightCard } from "@/components/platform/AiInsightCard";

export const Route = createFileRoute("/ngf/foresight")({ component: Foresight });

function Foresight() {
  const { data: scenarios = [] } = useScenarios();
  const { data: trend = [] } = useNationalSnriTrend();
  const [active, setActive] = useState<string | null>(null);

  const baseIndex = trend.length ? trend[trend.length - 1].index : 60;

  const horizon = useMemo(() => {
    const years = Array.from({ length: 7 }, (_, i) => 2025 + i);
    return years.map((year, i) => {
      const obj: any = { year };
      for (const s of scenarios as any[]) {
        // Project from base growth: simple linear estimate
        const g = Number(s.growth ?? 0);
        obj[s.code] = +(baseIndex + i * (g * 0.8)).toFixed(1);
      }
      return obj;
    });
  }, [scenarios, baseIndex]);

  const colors = ["oklch(0.45 0.13 155)", "oklch(0.78 0.16 80)", "oklch(0.6 0.22 27)", "oklch(0.55 0.18 305)"];
  const sc = (scenarios as any[]).find((s) => s.code === active) ?? (scenarios as any[])[0];

  return (
    <div className="space-y-6">
      <SectionHeader title="Strategic Foresight" description="Scenario planning across 36-state futures" />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Scenarios" value={scenarios.length} icon={Telescope} accent="primary" />
        <StatCard label="Horizon" value="2031" icon={TrendingUp} accent="info" />
        <StatCard label="Base SNRI" value={baseIndex || "—"} icon={TrendingUp} accent="gold" />
        <StatCard label="Worst-case Δ" value={`${Math.min(...(scenarios as any[]).map((s) => Number(s.growth ?? 0)))}%`} icon={TrendingDown} accent="destructive" />
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg">Resilience trajectory by scenario</CardTitle>
          <p className="text-xs text-muted-foreground">National SNRI projection · 2025–2031</p>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer>
              <LineChart data={horizon}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                <XAxis dataKey="year" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(scenarios as any[]).map((s, i) => (
                  <Line key={s.code} type="monotone" dataKey={s.code} name={s.name} stroke={colors[i % colors.length]} strokeWidth={2.5} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(scenarios as any[]).map((s) => {
          const isActive = (active ?? (scenarios as any[])[0]?.code) === s.code;
          return (
            <Card key={s.id} onClick={() => setActive(s.code)}
              className={`cursor-pointer shadow-soft transition ${isActive ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40"}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-base">{s.name}</h3>
                  <Badge variant="outline">{s.probability}%</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{s.summary}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">GDP growth</div>
                    <div className="flex items-center gap-1 font-display text-lg">
                      {Number(s.growth) > 3 ? <TrendingUp className="h-3 w-3 text-[color:var(--success)]" /> :
                       Number(s.growth) < 2 ? <TrendingDown className="h-3 w-3 text-destructive" /> :
                       <Minus className="h-3 w-3" />}
                      {s.growth}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Poverty</div>
                    <div className="font-display text-lg">{s.poverty}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sc && (
        <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5">
          <CardHeader><CardTitle className="font-display text-lg">{sc.name}</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{sc.summary}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
