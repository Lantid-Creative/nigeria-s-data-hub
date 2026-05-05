import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Telescope, Play, TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { SCENARIOS } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/ngf/foresight")({
  component: Foresight,
});

const horizon = Array.from({ length: 7 }, (_, i) => 2025 + i).map((year, i) => ({
  year,
  baseline: 64 + i * 1.2,
  accelerated: 64 + i * 4.1,
  shock: 64 - i * 2.4,
  leapfrog: 64 + i * 5.6,
}));

function Foresight() {
  const [active, setActive] = useState("accelerated");
  const sc = SCENARIOS.find((s) => s.id === active)!;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Strategic Foresight"
        description="Scenario planning across 36-state futures to 2032"
        action={<Button className="bg-primary"><Play className="mr-2 h-4 w-4" />Run new scenario</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active Scenarios" value="4" icon={Telescope} accent="primary" />
        <StatCard label="Horizon" value="2032" icon={TrendingUp} accent="info" />
        <StatCard label="Models" value="12" icon={Brain} accent="gold" />
        <StatCard label="Stress Tests" value="38" icon={TrendingDown} accent="destructive" />
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
                <YAxis fontSize={11} domain={[40, 110]} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" stroke="oklch(0.45 0.13 155)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="accelerated" stroke="oklch(0.78 0.16 80)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="shock" stroke="oklch(0.6 0.22 27)" strokeWidth={2.5} strokeDasharray="6 4" />
                <Line type="monotone" dataKey="leapfrog" stroke="oklch(0.55 0.18 305)" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SCENARIOS.map((s) => {
          const isActive = s.id === active;
          return (
            <Card
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`cursor-pointer shadow-soft transition ${isActive ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40"}`}
            >
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
                      {s.growth > 3 ? <TrendingUp className="h-3 w-3 text-[color:var(--success)]" /> :
                       s.growth < 2 ? <TrendingDown className="h-3 w-3 text-destructive" /> :
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

      <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg gradient-gold text-gold-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <CardTitle className="font-display text-lg">{sc.name} · Policy implications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {[
            "Re-prioritise MTEF capital allocations toward digital and green corridors.",
            "Strengthen state PRS analytics units in 12 lagging states.",
            "Build 18 living-lab pilots focused on AfCFTA value-chain readiness.",
            "Establish climate-shock contingency reserves across 7 high-risk states.",
          ].map((t, i) => (
            <div key={i} className="rounded-lg border bg-background p-4 text-sm">{t}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
