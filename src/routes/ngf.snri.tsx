import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";
import { useAllStatesLatestScores, useDimensions, useNationalSnriTrend } from "@/lib/state-data";
import { AiInsightCard } from "@/components/platform/AiInsightCard";

export const Route = createFileRoute("/ngf/snri")({ component: SNRI });

const DIM_KEY: Record<string, string> = {
  ECON: "economic", FISC: "fiscal", HUMAN: "human_capital",
  CLIM: "climate", GOV: "governance", SEC: "security", SOC: "social",
};

function SNRI() {
  const { data: dims = [] } = useDimensions();
  const { data: scores = [] } = useAllStatesLatestScores();
  const { data: trend = [] } = useNationalSnriTrend();

  const radar = (dims as any[]).map((d) => {
    const k = DIM_KEY[d.code];
    const vals = (scores as any[]).map((s) => Number(s[k] ?? 0)).filter(Boolean);
    const v = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    return { dim: d.name, value: v };
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Sub-National Resilience Index" description="Composite measuring 36 states across 7 dimensions" />
      <AiInsightCard
        mode="snri"
        title="SNRI Analysis"
        description="AI commentary on what's driving the index and where policy should focus."
        context={{ trend, dimension_avg: radar, states: scores.length }}
      />
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">National composite</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80">
              <ResponsiveContainer>
                <RadarChart data={radar}>
                  <PolarGrid stroke="oklch(0.85 0.02 100)" />
                  <PolarAngleAxis dataKey="dim" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Radar dataKey="value" stroke="oklch(0.45 0.13 155)" fill="oklch(0.45 0.13 155)" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {radar.map((d) => (
                <div key={d.dim} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><span className="font-medium">{d.dim}</span></div>
                  <span className="font-display text-lg text-primary">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
