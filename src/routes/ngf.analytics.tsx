import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Brain, LineChart, Sparkles, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, LineChart as RLineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ScatterChart, Scatter, BarChart, Bar, Legend, PieChart, Pie, Cell,
} from "recharts";
import { SECTOR_PERFORMANCE, SNRI_TREND, STATE_METRICS, ZONES } from "@/lib/mock-data";

export const Route = createFileRoute("/ngf/analytics")({
  component: Analytics,
});

const COLORS = ["oklch(0.45 0.13 155)", "oklch(0.78 0.16 80)", "oklch(0.62 0.13 230)", "oklch(0.65 0.18 35)", "oklch(0.55 0.18 305)", "oklch(0.5 0.1 200)"];

function Analytics() {
  const zoneData = Object.keys(ZONES).map((z, i) => {
    const states = STATE_METRICS.filter((s) => s.zone === z);
    return {
      zone: z,
      avgSnri: Math.round(states.reduce((a, b) => a + b.resilienceIndex, 0) / states.length),
      avgFiscal: Math.round(states.reduce((a, b) => a + b.fiscalHealth, 0) / states.length),
      states: states.length,
      color: COLORS[i],
    };
  });

  const scatter = STATE_METRICS.map((s) => ({ x: s.fiscalHealth, y: s.humanCapital, name: s.name, z: s.populationMillions }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        description="Deep multi-dimensional analytics across all 36 states"
        action={<Badge className="bg-gold text-gold-foreground"><Sparkles className="mr-1 h-3 w-3" />AI Insights enabled</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Indicators" value="248" icon={BarChart3} />
        <StatCard label="Data Points" value="42.8K" icon={LineChart} delta={12} accent="info" />
        <StatCard label="Forecasts Run" value="184" icon={TrendingUp} delta={8} accent="gold" />
        <StatCard label="AI Briefs" value="34" icon={Brain} accent="primary" />
      </div>

      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="zones">Geo-spatial</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display text-lg">Multi-indicator trends</CardTitle></CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer>
                  <RLineChart data={SNRI_TREND.map((p, i) => ({
                    ...p,
                    fiscal: 50 + i * 2 + (i % 2),
                    human: 45 + i * 1.6,
                    climate: 60 - i * 0.8,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                    <XAxis dataKey="period" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="index" name="SNRI" stroke={COLORS[0]} strokeWidth={2.5} />
                    <Line type="monotone" dataKey="fiscal" name="Fiscal" stroke={COLORS[1]} strokeWidth={2} />
                    <Line type="monotone" dataKey="human" name="Human Capital" stroke={COLORS[2]} strokeWidth={2} />
                    <Line type="monotone" dataKey="climate" name="Climate Risk" stroke={COLORS[3]} strokeWidth={2} strokeDasharray="4 4" />
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
                        {zoneData.map((z, i) => <Cell key={z.zone} fill={COLORS[i]} />)}
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
              <p className="text-xs text-muted-foreground">Bubble size = population</p>
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

        <TabsContent value="distribution" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display text-lg">Sector targets</CardTitle></CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer>
                  <BarChart data={SECTOR_PERFORMANCE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                    <XAxis dataKey="sector" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="current" fill={COLORS[0]} radius={[4,4,0,0]} />
                    <Bar dataKey="target" fill={COLORS[1]} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI insights */}
      <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg gradient-gold text-gold-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-display text-lg">AI-generated insights</CardTitle>
            <p className="text-xs text-muted-foreground">Synthesized from latest quarterly submissions</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            "South-South zone shows strongest SNRI gains (+4.2 pts) driven by IGR diversification.",
            "8 northern states show widening climate risk gap — recommend targeted foresight workshops.",
            "Innovation capacity correlates 0.71 with fiscal health — invest in PRS digital tooling.",
          ].map((t, i) => (
            <div key={i} className="rounded-lg border bg-background p-4 text-sm">
              <Sparkles className="mb-2 h-4 w-4 text-gold" />
              {t}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
