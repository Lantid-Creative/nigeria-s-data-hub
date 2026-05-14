import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, ArrowRight, ArrowUpRight, Brain, FlaskConical,
  MapPin, Shield,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";
import {
  useAllStatesLatestScores, useAlerts, useInnovationPilots,
  useAllSubmissions, useNationalSnriTrend, useDimensions,
} from "@/lib/state-data";
import { AiInsightCard } from "@/components/platform/AiInsightCard";
import { NigeriaChoropleth } from "@/components/platform/NigeriaChoropleth";
import { ScenarioBuilder } from "@/components/platform/ScenarioBuilder";

export const Route = createFileRoute("/ngf/")({ component: NgfOverview });

const C1 = "oklch(0.45 0.13 155)";
const C2 = "oklch(0.78 0.16 80)";

function NgfOverview() {
  const { data: scores = [] } = useAllStatesLatestScores();
  const { data: alerts = [] } = useAlerts(null);
  const { data: pilots = [] } = useInnovationPilots();
  const { data: subs = [] } = useAllSubmissions();
  const { data: trend = [] } = useNationalSnriTrend();
  const { data: dims = [] } = useDimensions();

  const reporting = new Set(subs.filter((s: any) => s.status !== "not_started").map((s: any) => s.state_code)).size;
  const nationalSnri = scores.length
    ? +(scores.reduce((a: number, s: any) => a + Number(s.resilience_index ?? 0), 0) / scores.length).toFixed(1)
    : 0;
  const highAlerts = alerts.filter((a: any) => a.level === "high").length;

  // Sector performance from dimensions: avg of relevant column
  const dimKey: Record<string, string> = {
    ECON: "economic", FISC: "fiscal", HUMAN: "human_capital",
    CLIM: "climate", GOV: "governance", SEC: "security", SOC: "social",
  };
  const sectors = dims.map((d: any) => {
    const k = dimKey[d.code];
    const vals = scores.map((s: any) => Number(s[k] ?? 0)).filter(Boolean);
    const cur = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    return { sector: d.name, current: cur, target: Math.min(100, cur + 18) };
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Command Centre"
        description="Real-time view across Nigeria's 36 sub-national governments"
        action={
          <div className="flex gap-2">
            <Button variant="outline"><Brain className="mr-2 h-4 w-4" />AI Briefing</Button>
            <Button asChild className="bg-primary">
              <Link to="/ngf/reports">Generate report <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="National SNRI" value={nationalSnri || "—"} icon={Shield} />
        <StatCard label="States Reporting" value={`${reporting}/36`} icon={MapPin} accent="info" />
        <StatCard label="Active Pilots" value={pilots.length} icon={FlaskConical} accent="gold" />
        <StatCard label="Open Risk Alerts" value={highAlerts} icon={AlertTriangle} accent="destructive" />
      </div>

      <AiInsightCard
        mode="briefing"
        title="Executive Briefing"
        description="90-second AI briefing on the national picture, signals and decisions for this week."
        context={{
          national_snri: nationalSnri,
          states_reporting: reporting,
          active_pilots: pilots.length,
          high_alerts: highAlerts,
          sectors,
          recent_alerts: alerts.slice(0, 8).map((a: any) => ({ title: a.title, level: a.level, audience: a.audience })),
        }}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">National Resilience Index</CardTitle>
            <p className="text-xs text-muted-foreground">Average SNRI across reporting cycles</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C1} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={C1} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                  <XAxis dataKey="period" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="index" stroke={C1} strokeWidth={2.5} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">Dimension performance</CardTitle>
            <p className="text-xs text-muted-foreground">Current avg vs target</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={sectors} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                  <XAxis type="number" fontSize={10} />
                  <YAxis type="category" dataKey="sector" fontSize={11} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="current" fill={C1} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="target" fill={C2} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">State performance map</CardTitle>
              <p className="text-xs text-muted-foreground">Resilience score by state</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/ngf/states">All states <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {scores.length ? <NigeriaChoropleth scores={scores} /> : (
              <div className="p-6 text-center text-sm text-muted-foreground">No state scores yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">Live alerts</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {alerts.slice(0, 6).map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 p-4">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.level === "high" ? "bg-destructive" : a.level === "medium" ? "bg-gold" : "bg-[color:var(--info)]"}`} />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{a.title}</div>
                  {a.body && <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{a.body}</div>}
                  <Badge variant="outline" className="mt-1 text-[10px]">{a.audience}</Badge>
                </div>
              </div>
            ))}
            {!alerts.length && <div className="p-6 text-center text-sm text-muted-foreground">No alerts.</div>}
          </CardContent>
        </Card>
      </div>

      {scores.length > 0 && <ScenarioBuilder scores={scores} />}
    </div>
  );
}
