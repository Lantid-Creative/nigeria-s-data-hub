import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, ArrowRight, ArrowUpRight, Brain, ClipboardCheck, FlaskConical,
  Globe2, MapPin, Shield, Telescope, TrendingUp, Users,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";
import { ALERTS, SECTOR_PERFORMANCE, SNRI_TREND, STATE_METRICS } from "@/lib/mock-data";

export const Route = createFileRoute("/ngf/")({
  component: NgfOverview,
});

const C1 = "oklch(0.45 0.13 155)";
const C2 = "oklch(0.78 0.16 80)";

function NgfOverview() {
  const reporting = STATE_METRICS.filter((s) => s.status !== "overdue").length;
  const topRisk = [...STATE_METRICS].sort((a, b) => b.climateRisk - a.climateRisk).slice(0, 5);
  const topPerform = [...STATE_METRICS].sort((a, b) => b.resilienceIndex - a.resilienceIndex).slice(0, 5);

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

      {/* Hero stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="National SNRI" value="64.2" icon={Shield} delta={2.1} deltaLabel="vs Q4" />
        <StatCard label="States Reporting" value={`${reporting}/36`} icon={MapPin} delta={6} accent="info" />
        <StatCard label="Active Pilots" value="18" icon={FlaskConical} delta={3} accent="gold" />
        <StatCard label="Open Risk Alerts" value={ALERTS.filter((a) => a.level === "high").length} icon={AlertTriangle} accent="destructive" />
      </div>

      {/* Trends + zone */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">National Resilience Index</CardTitle>
              <p className="text-xs text-muted-foreground">Composite SNRI · Quarterly</p>
            </div>
            <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]">+33% since 2024</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={SNRI_TREND}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C1} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={C1} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                  <XAxis dataKey="period" fontSize={11} />
                  <YAxis fontSize={11} domain={[40, 70]} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="index" stroke={C1} strokeWidth={2.5} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">Sector performance</CardTitle>
            <p className="text-xs text-muted-foreground">Current vs target</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={SECTOR_PERFORMANCE} layout="vertical" margin={{ left: 10 }}>
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

      {/* Maps + alerts */}
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
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
              {STATE_METRICS.map((s) => {
                const v = s.resilienceIndex;
                const tone =
                  v >= 75 ? "bg-emerald-500/80 text-white" :
                  v >= 60 ? "bg-emerald-400/60" :
                  v >= 50 ? "bg-gold/70" :
                  v >= 40 ? "bg-orange-400/70" : "bg-destructive/70 text-white";
                return (
                  <div key={s.name} className={`group relative aspect-square cursor-pointer rounded-md ${tone} p-1.5 text-[10px] font-medium transition hover:scale-110`}>
                    <div className="truncate">{s.name.slice(0, 3).toUpperCase()}</div>
                    <div className="text-[9px] opacity-80">{v}</div>
                    <div className="pointer-events-none absolute -top-12 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] text-background group-hover:block">
                      {s.name} · SNRI {v}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>Lower</span>
              <div className="flex h-2 flex-1 overflow-hidden rounded-full">
                <div className="flex-1 bg-destructive/70" />
                <div className="flex-1 bg-orange-400/70" />
                <div className="flex-1 bg-gold/70" />
                <div className="flex-1 bg-emerald-400/60" />
                <div className="flex-1 bg-emerald-500/80" />
              </div>
              <span>Higher</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Risk alerts</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/ngf/alerts">All</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ALERTS.map((a) => (
              <div key={a.title} className="flex gap-3 rounded-lg border p-3">
                <div className={`mt-0.5 h-2 w-2 rounded-full ${
                  a.level === "high" ? "bg-destructive" : a.level === "medium" ? "bg-gold" : "bg-[color:var(--info)]"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground">{a.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">Top performing states</CardTitle>
            <p className="text-xs text-muted-foreground">By composite SNRI</p>
          </CardHeader>
          <CardContent className="divide-y">
            {topPerform.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.zone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg text-primary">{s.resilienceIndex}</span>
                  <TrendingUp className="h-3 w-3 text-[color:var(--success)]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-lg">Highest climate risk</CardTitle>
            <p className="text-xs text-muted-foreground">Foresight model · 12-month horizon</p>
          </CardHeader>
          <CardContent className="divide-y">
            {topRisk.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Globe2 className="h-4 w-4 text-destructive" />
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.zone}</div>
                  </div>
                </div>
                <Badge className="bg-destructive/10 text-destructive">Risk {s.climateRisk}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { i: Telescope, t: "Run scenario", to: "/ngf/foresight" },
          { i: FlaskConical, t: "Open research lab", to: "/ngf/research" },
          { i: ClipboardCheck, t: "Validate submissions", to: "/ngf/surveys" },
          { i: Users, t: "Manage states", to: "/ngf/states" },
        ].map((q) => (
          <Link key={q.t} to={q.to} className="group">
            <Card className="shadow-soft transition group-hover:border-primary/40 group-hover:shadow-elevated">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <q.i className="h-5 w-5" />
                </div>
                <div className="flex-1 text-sm font-medium">{q.t}</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
