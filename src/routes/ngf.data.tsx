import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Layers, BarChart3, MapPin } from "lucide-react";
import { useIndicators, useDimensions, useAllStates, useAllCycles } from "@/lib/state-data";

export const Route = createFileRoute("/ngf/data")({ component: DataHub });

function DataHub() {
  const { data: indicators = [] } = useIndicators();
  const { data: dimensions = [] } = useDimensions();
  const { data: states = [] } = useAllStates();
  const { data: cycles = [] } = useAllCycles();

  const byDim = new Map<string, any[]>();
  for (const ind of indicators as any[]) {
    const arr = byDim.get(ind.dimension_code) ?? [];
    arr.push(ind); byDim.set(ind.dimension_code, arr);
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Data Hub" description="Indicator catalogue, dimensions and reporting cycles" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Indicators" value={indicators.length} icon={BarChart3} />
        <StatCard label="Dimensions" value={dimensions.length} icon={Layers} accent="info" />
        <StatCard label="States" value={states.length} icon={MapPin} accent="gold" />
        <StatCard label="Cycles" value={cycles.length} icon={Database} accent="primary" />
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Indicators by dimension</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(dimensions as any[]).map((d) => {
            const items = byDim.get(d.code) ?? [];
            return (
              <div key={d.code} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-base">{d.name}</div>
                    {d.description && <div className="text-xs text-muted-foreground">{d.description}</div>}
                  </div>
                  <Badge variant="outline">{items.length} indicators</Badge>
                </div>
                <div className="mt-3 grid gap-1 text-sm md:grid-cols-2">
                  {items.map((i: any) => (
                    <div key={i.id} className="flex items-center justify-between gap-2 rounded border-l-2 border-primary/40 bg-muted/40 px-2 py-1.5">
                      <span className="truncate">{i.name}</span>
                      <span className="text-[10px] uppercase text-muted-foreground">{i.direction}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Reporting cycles</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {(cycles as any[]).map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.starts_on} → {c.ends_on}</div>
              </div>
              {c.is_current && <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]">Current</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
