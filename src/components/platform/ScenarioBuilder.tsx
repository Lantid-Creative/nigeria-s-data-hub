import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { RotateCcw, Sparkles, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logEvent } from "@/lib/audit";

const DIM_KEYS = [
  { key: "economic", label: "Economic" },
  { key: "fiscal", label: "Fiscal" },
  { key: "human_capital", label: "Human Capital" },
  { key: "climate", label: "Climate" },
  { key: "governance", label: "Governance" },
  { key: "security", label: "Security" },
  { key: "social", label: "Social" },
];

export function ScenarioBuilder({ scores }: { scores: any[] }) {
  const [shocks, setShocks] = useState<Record<string, number>>(
    Object.fromEntries(DIM_KEYS.map((d) => [d.key, 0]))
  );

  const projection = useMemo(() => {
    return scores.map((s: any) => {
      const dims = DIM_KEYS.map((d) => Math.max(0, Math.min(100, Number(s[d.key] ?? 0) + (shocks[d.key] ?? 0))));
      const newSnri = +(dims.reduce((a, b) => a + b, 0) / dims.length).toFixed(1);
      const baseSnri = Number(s.resilience_index ?? 0);
      return {
        state: s.states?.name ?? s.state_code,
        code: s.state_code,
        baseline: +baseSnri.toFixed(1),
        projected: newSnri,
        delta: +(newSnri - baseSnri).toFixed(1),
      };
    }).sort((a, b) => b.projected - a.projected);
  }, [scores, shocks]);

  const nat = useMemo(() => {
    if (!projection.length) return { base: 0, proj: 0 };
    const base = projection.reduce((a, b) => a + b.baseline, 0) / projection.length;
    const proj = projection.reduce((a, b) => a + b.projected, 0) / projection.length;
    return { base: +base.toFixed(1), proj: +proj.toFixed(1) };
  }, [projection]);

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Scenario builder
          </CardTitle>
          <p className="text-xs text-muted-foreground">Apply a shock (±) to each dimension and watch SNRI move across the federation.</p>
        </div>
        <div className="flex items-center gap-2">
          <SaveScenarioDialog shocks={shocks} />
          <Button variant="ghost" size="sm" onClick={() => setShocks(Object.fromEntries(DIM_KEYS.map((d) => [d.key, 0])))}>
            <RotateCcw className="mr-1 h-3 w-3" /> Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          {DIM_KEYS.map((d) => (
            <div key={d.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{d.label}</span>
                <Badge variant="outline" className="tabular-nums">{shocks[d.key] >= 0 ? `+${shocks[d.key]}` : shocks[d.key]}</Badge>
              </div>
              <Slider
                min={-30} max={30} step={1}
                value={[shocks[d.key] ?? 0]}
                onValueChange={([v]) => setShocks((s) => ({ ...s, [d.key]: v }))}
              />
            </div>
          ))}
          <div className="rounded-md border bg-muted/40 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">National SNRI</span>
              <span className="font-display text-base">
                {nat.base} → <span className={nat.proj > nat.base ? "text-[color:var(--success)]" : nat.proj < nat.base ? "text-destructive" : ""}>{nat.proj}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="h-[420px]">
            <ResponsiveContainer>
              <BarChart data={projection.slice(0, 18)} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 100)" />
                <XAxis dataKey="code" fontSize={10} interval={0} angle={-45} textAnchor="end" height={50} />
                <YAxis fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine y={nat.base} stroke="oklch(0.6 0.02 260)" strokeDasharray="3 3" />
                <Bar dataKey="baseline" name="Baseline" fill="oklch(0.78 0.16 80)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="projected" name="Projected" fill="oklch(0.45 0.13 155)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">Top 18 states by projected SNRI.</div>
        </div>
      </CardContent>
    </Card>
  );
}
