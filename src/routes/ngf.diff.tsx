import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAllCycles } from "@/lib/state-data";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export const Route = createFileRoute("/ngf/diff")({ component: Diff });

function Diff() {
  const { data: cycles = [] } = useAllCycles();
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");

  useEffect(() => {
    if (cycles.length >= 2 && (!a || !b)) {
      setA(cycles[cycles.length - 2].id);
      setB(cycles[cycles.length - 1].id);
    } else if (cycles.length === 1 && !a) {
      setA(cycles[0].id); setB(cycles[0].id);
    }
  }, [cycles, a, b]);

  const { data: rowsA = [] } = useQuery({
    queryKey: ["scores-by-cycle", a],
    enabled: !!a,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_scores").select("*, states(name)").eq("cycle_id", a);
      if (error) throw error; return data ?? [];
    },
  });
  const { data: rowsB = [] } = useQuery({
    queryKey: ["scores-by-cycle", b],
    enabled: !!b,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_scores").select("*, states(name)").eq("cycle_id", b);
      if (error) throw error; return data ?? [];
    },
  });

  const merged = useMemo(() => {
    const ma = new Map((rowsA as any[]).map((r) => [r.state_code, r]));
    const mb = new Map((rowsB as any[]).map((r) => [r.state_code, r]));
    const codes = Array.from(new Set([...ma.keys(), ...mb.keys()]));
    return codes.map((code) => {
      const x = ma.get(code), y = mb.get(code);
      const av = x ? Number(x.resilience_index ?? 0) : null;
      const bv = y ? Number(y.resilience_index ?? 0) : null;
      const delta = av != null && bv != null ? +(bv - av).toFixed(1) : null;
      const name = (y?.states?.name ?? x?.states?.name ?? code);
      return { code, name, av, bv, delta };
    }).sort((p, q) => (q.delta ?? -999) - (p.delta ?? -999));
  }, [rowsA, rowsB]);

  const movers = merged.filter((r) => r.delta != null);
  const up = movers.filter((r) => (r.delta ?? 0) > 0).length;
  const down = movers.filter((r) => (r.delta ?? 0) < 0).length;
  const flat = movers.length - up - down;

  return (
    <div className="space-y-6">
      <SectionHeader title="Cross-cycle diff" description="Compare Sub-National Resilience between two reporting cycles" />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Cycles</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Baseline</Label>
            <Select value={a} onValueChange={setA}>
              <SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger>
              <SelectContent>
                {cycles.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Comparison</Label>
            <Select value={b} onValueChange={setB}>
              <SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger>
              <SelectContent>
                {cycles.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="shadow-soft"><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Improving states</div>
          <div className="font-display text-2xl text-emerald-600">{up}</div>
        </CardContent></Card>
        <Card className="shadow-soft"><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Declining states</div>
          <div className="font-display text-2xl text-destructive">{down}</div>
        </CardContent></Card>
        <Card className="shadow-soft"><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Stable states</div>
          <div className="font-display text-2xl text-muted-foreground">{flat}</div>
        </CardContent></Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">State-level deltas</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-2 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <div className="col-span-4">State</div>
            <div className="col-span-2 text-right">Baseline</div>
            <div className="col-span-2 text-right">Comparison</div>
            <div className="col-span-2 text-right">Δ</div>
            <div className="col-span-2 text-right">Trend</div>
          </div>
          <div className="divide-y">
            {merged.map((r) => {
              const d = r.delta ?? 0;
              const Icon = d > 0.5 ? ArrowUp : d < -0.5 ? ArrowDown : Minus;
              const tone = d > 0.5 ? "text-emerald-600" : d < -0.5 ? "text-destructive" : "text-muted-foreground";
              return (
                <div key={r.code} className="grid grid-cols-12 items-center gap-2 px-4 py-2 text-sm">
                  <div className="col-span-4 truncate font-medium">{r.name} <Badge variant="outline" className="ml-1 text-[10px]">{r.code}</Badge></div>
                  <div className="col-span-2 text-right font-mono">{r.av != null ? r.av.toFixed(1) : "—"}</div>
                  <div className="col-span-2 text-right font-mono">{r.bv != null ? r.bv.toFixed(1) : "—"}</div>
                  <div className={`col-span-2 text-right font-display ${tone}`}>{r.delta != null ? (d > 0 ? "+" : "") + r.delta.toFixed(1) : "—"}</div>
                  <div className={`col-span-2 flex justify-end ${tone}`}><Icon className="h-4 w-4" /></div>
                </div>
              );
            })}
            {!merged.length && <div className="p-6 text-center text-sm text-muted-foreground">No data for selected cycles.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
