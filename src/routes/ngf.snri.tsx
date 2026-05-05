import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Brain, ArrowRight } from "lucide-react";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";
import { RESILIENCE_RADAR } from "@/lib/mock-data";

export const Route = createFileRoute("/ngf/snri")({ component: SNRI });

function SNRI() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Sub-National Resilience Index" description="The flagship composite measuring 36 states across 6 dimensions" />
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Composite framework</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80">
              <ResponsiveContainer>
                <RadarChart data={RESILIENCE_RADAR}>
                  <PolarGrid stroke="oklch(0.85 0.02 100)" />
                  <PolarAngleAxis dataKey="dim" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Radar dataKey="value" stroke="oklch(0.45 0.13 155)" fill="oklch(0.45 0.13 155)" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {RESILIENCE_RADAR.map((d) => (
                <div key={d.dim} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><span className="font-medium">{d.dim}</span></div>
                  <span className="font-display text-lg text-primary">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-lg gradient-gold text-gold-foreground"><Brain className="h-6 w-6" /></div>
          <div className="flex-1"><div className="font-display text-base">SNRI v2 — Methodology paper</div><div className="text-xs text-muted-foreground">12 indicators · 6 dimensions · annual recalibration</div></div>
          <ArrowRight className="h-4 w-4" />
        </CardContent>
      </Card>
    </div>
  );
}
