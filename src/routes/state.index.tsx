import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, AlertCircle, ArrowRight, ClipboardCheck, FileSpreadsheet,
  ShieldCheck, TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  useStateCode, useStateRow, useStateScores, useCurrentCycle,
  useAllStatesLatestScores, useStateSubmissions, useSurveys, useAlerts,
  useDimensions, scoreFor,
} from "@/lib/state-data";
import { AiInsightCard } from "@/components/platform/AiInsightCard";
import { useAuth } from "@/lib/auth";
import { useMemo } from "react";

export const Route = createFileRoute("/state/")({ component: StateDashboard });

const chartColor = "oklch(0.45 0.13 155)";

function StateDashboard() {
  const code = useStateCode();
  const { profile } = useAuth();
  const { data: state } = useStateRow(code);
  const { data: cycle } = useCurrentCycle();
  const { data: scores = [] } = useStateScores(code);
  const { data: dims = [] } = useDimensions();
  const { data: surveys = [] } = useSurveys();
  const { data: subs = [] } = useStateSubmissions(code);
  const { data: alerts = [] } = useAlerts(code);
  const { data: peers = [] } = useAllStatesLatestScores();

  const latest = scores[scores.length - 1];
  const prev = scores[scores.length - 2];
  const delta = latest && prev ? +(Number(latest.resilience_index) - Number(prev.resilience_index)).toFixed(1) : 0;

  const trend = scores.map((s: any) => ({
    period: s.reporting_cycles?.label ?? "—",
    index: Number(s.resilience_index),
  }));

  const radar = useMemo(() => dims.map((d: any) => ({
    dim: d.name.replace(/ Resilience.*/, "").replace("& Environmental", "Climate").replace("Human Capital", "Human").replace("Governance & Institutional", "Governance"),
    value: latest ? scoreFor(latest, d.code) ?? 0 : 0,
  })), [dims, latest]);

  const peerRanking = useMemo(() => {
    const sorted = [...peers].sort((a: any, b: any) => Number(b.resilience_index) - Number(a.resilience_index));
    const myIndex = sorted.findIndex((p: any) => p.state_code === code);
    return { rank: myIndex + 1, total: sorted.length, top: sorted.slice(0, 4), my: sorted[myIndex] };
  }, [peers, code]);

  const completionAvg = subs.length
    ? Math.round(subs.reduce((a: number, s: any) => a + s.completion_pct, 0) / subs.length)
    : 0;

  const openAlerts = alerts.filter((a: any) => a.level === "high" || a.level === "medium").length;
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Welcome back, ${firstName}`}
        description={`${state?.name ?? code} State · ${cycle?.label ?? ""} reporting cycle in progress`}
        action={
          <Button asChild className="bg-primary">
            <Link to="/state/surveys">
              <ClipboardCheck className="mr-2 h-4 w-4" /> Resume submission
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Resilience Index"
          value={latest ? Number(latest.resilience_index).toFixed(1) : "—"}
          icon={ShieldCheck}
          delta={delta}
          deltaLabel="vs prev cycle"
          accent="primary"
        />
        <StatCard
          label="Survey Completion"
          value={subs.length ? `${completionAvg}%` : "0%"}
          icon={FileSpreadsheet}
          accent="gold"
        />
        <StatCard
          label="Indicators Tracked"
          value="48"
          icon={Activity}
          accent="info"
        />
        <StatCard
          label="Open Alerts"
          value={String(openAlerts)}
          icon={AlertCircle}
          accent="destructive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Resilience trajectory</CardTitle>
              <p className="text-xs text-muted-foreground">SNRi composite — {state?.name ?? code} State</p>
            </div>
            <Badge variant="secondary" className="bg-secondary">{trend.length} cycles</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              {trend.length === 0 ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="area1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                    <XAxis dataKey="period" fontSize={11} stroke="oklch(0.5 0.02 260)" />
                    <YAxis fontSize={11} domain={[0, 100]} stroke="oklch(0.5 0.02 260)" />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="index" stroke={chartColor} strokeWidth={2.5} fill="url(#area1)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">7 Resilience Dimensions</CardTitle>
            <p className="text-xs text-muted-foreground">SNRi sub-indices · current cycle</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {radar.length === 0 ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer>
                  <RadarChart data={radar}>
                    <PolarGrid stroke="oklch(0.85 0.02 100)" />
                    <PolarAngleAxis dataKey="dim" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} />
                    <Radar dataKey="value" stroke={chartColor} fill={chartColor} fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-lg">Active survey instruments</CardTitle>
            <p className="text-xs text-muted-foreground">Submit data through the unified Futures Lab pipeline</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/state/surveys">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {surveys.map((s: any) => {
              const sub = subs.find((x: any) => x.survey_id === s.id);
              const pct = sub?.completion_pct ?? 0;
              return (
                <div key={s.id} className="rounded-lg border p-4 transition hover:border-primary/40 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">{s.code}</div>
                      <div className="font-semibold">{s.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {s.sections} sections · {s.questions} questions · Due {s.due_date}
                      </div>
                    </div>
                    <Badge className={pct > 70 ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-gold/20 text-gold-foreground"}>
                      {pct}%
                    </Badge>
                  </div>
                  <div className="mt-3"><Progress value={pct} className="h-1.5" /></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Peer benchmarking</CardTitle>
            <Badge variant="outline">Rank #{peerRanking.rank}/{peerRanking.total}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {peerRanking.top.map((row: any) => {
              const isMe = row.state_code === code;
              const v = Number(row.resilience_index);
              return (
                <div key={row.state_code}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={isMe ? "font-semibold text-primary" : ""}>
                      {row.states?.name ?? row.state_code}{isMe ? " (you)" : ""}
                    </span>
                    <span className="tabular-nums">{v.toFixed(1)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${isMe ? "bg-primary" : "bg-gold"}`} style={{ width: `${v}%` }} />
                  </div>
                </div>
              );
            })}
            {peerRanking.my && !peerRanking.top.find((p: any) => p.state_code === code) && (
              <div className="border-t pt-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-primary">{state?.name} (you)</span>
                  <span className="tabular-nums">{Number(peerRanking.my.resilience_index).toFixed(1)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${peerRanking.my.resilience_index}%` }} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Recent alerts</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            {alerts.slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex gap-3">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                  a.level === "high" ? "bg-destructive/10 text-destructive" :
                  a.level === "medium" ? "bg-gold/20 text-gold-foreground" :
                  "bg-primary/10 text-primary"
                }`}>
                  {a.level === "high" ? <AlertCircle className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div>{a.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-muted-foreground">No recent alerts.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
