import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity, AlertCircle, ArrowRight, ClipboardCheck, FileSpreadsheet,
  ShieldCheck, TrendingUp, Users,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { RESILIENCE_RADAR, SNRI_TREND, SURVEY_INSTRUMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/state/")({
  component: StateDashboard,
});

const chartColor = "oklch(0.45 0.13 155)";

function StateDashboard() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Welcome back, Aisha"
        description="Kaduna State · Q1 2026 reporting cycle in progress"
        action={
          <Button asChild className="bg-primary">
            <Link to="/state/surveys">
              <ClipboardCheck className="mr-2 h-4 w-4" /> Resume submission
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="State Resilience Index" value="68.4" icon={ShieldCheck} delta={3.2} deltaLabel="vs Q4" accent="primary" />
        <StatCard label="Survey Completion" value="78%" icon={FileSpreadsheet} delta={12} deltaLabel="this cycle" accent="gold" />
        <StatCard label="Indicators Tracked" value="124" icon={Activity} delta={4} accent="info" />
        <StatCard label="Open Alerts" value="3" icon={AlertCircle} accent="destructive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Resilience trajectory</CardTitle>
              <p className="text-xs text-muted-foreground">Quarterly composite index — Kaduna vs national average</p>
            </div>
            <Badge variant="secondary" className="bg-secondary">Last 9 quarters</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <AreaChart data={SNRI_TREND}>
                  <defs>
                    <linearGradient id="area1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                  <XAxis dataKey="period" fontSize={11} stroke="oklch(0.5 0.02 260)" />
                  <YAxis fontSize={11} stroke="oklch(0.5 0.02 260)" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="index" stroke={chartColor} strokeWidth={2.5} fill="url(#area1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">Resilience dimensions</CardTitle>
            <p className="text-xs text-muted-foreground">SNRI sub-indices, current quarter</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <RadarChart data={RESILIENCE_RADAR}>
                  <PolarGrid stroke="oklch(0.85 0.02 100)" />
                  <PolarAngleAxis dataKey="dim" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} />
                  <Radar dataKey="value" stroke={chartColor} fill={chartColor} fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
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
            {SURVEY_INSTRUMENTS.map((s) => (
              <div key={s.id} className="rounded-lg border p-4 transition hover:border-primary/40 hover:shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{s.id}</div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {s.sections} sections · {s.questions} questions · Due {s.dueDate}
                    </div>
                  </div>
                  <Badge className={s.responseRate > 70 ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-gold/20 text-gold-foreground"}>
                    {s.responseRate}%
                  </Badge>
                </div>
                <div className="mt-3">
                  <Progress value={s.responseRate} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Peer benchmarking</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { s: "Lagos", v: 78, you: false },
              { s: "Kaduna (you)", v: 68, you: true },
              { s: "Kano", v: 65, you: false },
              { s: "Cross River", v: 61, you: false },
              { s: "Zone average", v: 58, you: false },
            ].map((row) => (
              <div key={row.s}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className={row.you ? "font-semibold text-primary" : ""}>{row.s}</span>
                  <span className="tabular-nums">{row.v}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${row.you ? "bg-primary" : "bg-gold"}`} style={{ width: `${row.v}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Recent activity</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[
              { i: TrendingUp, t: "Fiscal Sustainability Survey — 64% complete", w: "Today, 09:42" },
              { i: Users, t: "3 new officials enrolled in Foresight 101 training", w: "Yesterday" },
              { i: ClipboardCheck, t: "Q4 2025 Core Indicators validated by NGF", w: "2 days ago" },
              { i: AlertCircle, t: "Climate Vulnerability Assessment due in 18 days", w: "3 days ago" },
            ].map((a) => (
              <div key={a.t} className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <a.i className="h-4 w-4" />
                </div>
                <div>
                  <div>{a.t}</div>
                  <div className="text-xs text-muted-foreground">{a.w}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
