import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Brain, Download, LineChart, Sparkles, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, LineChart as RLineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ScatterChart, Scatter, BarChart, Bar, Legend, PieChart, Pie, Cell,
  ZAxis,
} from "recharts";
import { useAllStatesLatestScores, useZones, useNationalSnriTrend, useIndicators, useDimensions } from "@/lib/state-data";
import { useMemo, useState } from "react";
import { AiInsightCard } from "@/components/platform/AiInsightCard";
import { downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/ngf/analytics")({ component: Analytics });

const COLORS = ["oklch(0.45 0.13 155)", "oklch(0.78 0.16 80)", "oklch(0.62 0.13 230)", "oklch(0.65 0.18 35)", "oklch(0.55 0.18 305)", "oklch(0.5 0.1 200)"];

const DIM_FIELDS = [
  { key: "resilience_index", label: "SNRI (composite)" },
  { key: "economic", label: "Economic" },
  { key: "fiscal", label: "Fiscal" },
  { key: "human_capital", label: "Human Capital" },
  { key: "climate", label: "Climate" },
  { key: "governance", label: "Governance" },
  { key: "security", label: "Security" },
  { key: "social", label: "Social" },
];

function Analytics() {
  const { data: scores = [] } = useAllStatesLatestScores();
  const { data: zones = [] } = useZones();
  const { data: trend = [] } = useNationalSnriTrend();
  const { data: indicators = [] } = useIndicators();
  const { data: dims = [] } = useDimensions();

  const [xKey, setXKey] = useState("fiscal");
  const [yKey, setYKey] = useState("human_capital");

  const zoneData = useMemo(() => (zones as any[]).map((z, i) => {
    const zoneStates = (scores as any[]).filter((s) => s.states?.zone_code === z.code);
    const avg = (key: string) =>
      zoneStates.length ? Math.round(zoneStates.reduce((a, b) => a + Number(b[key] ?? 0), 0) / zoneStates.length) : 0;
    return {
      zone: z.name,
      avgSnri: avg("resilience_index"),
      avgFiscal: avg("fiscal"),
      states: zoneStates.length,
      color: COLORS[i % COLORS.length],
    };
  }), [zones, scores]);

  const scatter = useMemo(() => (scores as any[]).map((s) => ({
    x: Number(s[xKey] ?? 0),
    y: Number(s[yKey] ?? 0),
    name: s.states?.name ?? s.state_code,
  })), [scores, xKey, yKey]);

  // Pearson correlation
  const correlation = useMemo(() => {
    const n = scatter.length;
    if (n < 2) return 0;
    const mx = scatter.reduce((a, p) => a + p.x, 0) / n;
    const my = scatter.reduce((a, p) => a + p.y, 0) / n;
    let num = 0, dx = 0, dy = 0;
    for (const p of scatter) {
      num += (p.x - mx) * (p.y - my);
      dx += (p.x - mx) ** 2;
      dy += (p.y - my) ** 2;
    }
    const d = Math.sqrt(dx * dy);
    return d ? +(num / d).toFixed(2) : 0;
  }, [scatter]);

  const xLabel = DIM_FIELDS.find((d) => d.key === xKey)?.label ?? xKey;
  const yLabel = DIM_FIELDS.find((d) => d.key === yKey)?.label ?? yKey;

  const dataPoints = (indicators as any[]).length * 36;

  // CSV exports
  const exportStates = () =>
    downloadCsv("state-scores", (scores as any[]).map((s) => ({
      state_code: s.state_code,
      state: s.states?.name ?? s.state_code,
      zone: s.states?.zone_code ?? "",
      snri: s.resilience_index,
      economic: s.economic, fiscal: s.fiscal, human_capital: s.human_capital,
      climate: s.climate, governance: s.governance, security: s.security, social: s.social,
    })));
  const exportZones = () => downloadCsv("zone-performance", zoneData);
  const exportTrend = () => downloadCsv("national-trend", trend as any[]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        description="Deep multi-dimensional analytics across all states"
        action={<Badge className="bg-gold text-gold-foreground"><Sparkles className="mr-1 h-3 w-3" />Live data</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Indicators" value={indicators.length} icon={BarChart3} />
        <StatCard label="Data Points" value={dataPoints.toLocaleString()} icon={LineChart} accent="info" />
        <StatCard label="Cycles tracked" value={trend.length} icon={TrendingUp} accent="gold" />
        <StatCard label="States scored" value={scores.length} icon={Brain} accent="primary" />
      </div>

      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="zones">Geo-spatial</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display text-lg">National SNRI trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer>
                  <RLineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                    <XAxis dataKey="period" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="index" name="SNRI" stroke={COLORS[0]} strokeWidth={2.5} />
                  </RLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-soft">
              <CardHeader><CardTitle className="font-display text-lg">Performance by zone</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer>
                    <BarChart data={zoneData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                      <XAxis dataKey="zone" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis fontSize={11} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="avgSnri" name="SNRI" fill={COLORS[0]} radius={[4,4,0,0]} />
                      <Bar dataKey="avgFiscal" name="Fiscal" fill={COLORS[1]} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardHeader><CardTitle className="font-display text-lg">State distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={zoneData} dataKey="states" nameKey="zone" innerRadius={60} outerRadius={110} paddingAngle={2}>
                        {zoneData.map((z, i) => <Cell key={z.zone} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlations" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-lg">Fiscal Health vs Human Capital</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                    <XAxis type="number" dataKey="x" name="Fiscal" fontSize={11} />
                    <YAxis type="number" dataKey="y" name="Human Capital" fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Scatter data={scatter} fill={COLORS[0]} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
