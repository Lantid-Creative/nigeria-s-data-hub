import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Layers, BarChart3, MapPin, Download, Upload, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useIndicators, useDimensions, useAllStates, useAllCycles } from "@/lib/state-data";
import { downloadCsv, parseCsv } from "@/lib/csv";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/ngf/data")({ component: DataHub });

const SCORE_COLS = ["state_code", "cycle_id", "resilience_index", "fiscal", "human_capital", "economic", "governance", "security", "social", "climate"];

function DataHub() {
  const { data: indicators = [] } = useIndicators();
  const { data: dimensions = [] } = useDimensions();
  const { data: states = [] } = useAllStates();
  const { data: cycles = [] } = useAllCycles();
  const qc = useQueryClient();

  return (
    <div className="space-y-6">
      <SectionHeader title="Data Hub" description="Indicator catalogue, cycles, and bulk data operations" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Indicators" value={indicators.length} icon={BarChart3} />
        <StatCard label="Dimensions" value={dimensions.length} icon={Layers} accent="info" />
        <StatCard label="States" value={states.length} icon={MapPin} accent="gold" />
        <StatCard label="Cycles" value={cycles.length} icon={Database} accent="primary" />
      </div>

      <Tabs defaultValue="indicators">
        <TabsList>
          <TabsTrigger value="indicators">Indicators</TabsTrigger>
          <TabsTrigger value="cycles">Cycles</TabsTrigger>
          <TabsTrigger value="scores">Scores Import</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          <IndicatorsPanel indicators={indicators as any[]} dimensions={dimensions as any[]} qc={qc} />
        </TabsContent>

        <TabsContent value="cycles" className="space-y-4">
          <CyclesPanel cycles={cycles as any[]} qc={qc} />
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <ScoresImportPanel cycles={cycles as any[]} qc={qc} />
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <ExportsPanel indicators={indicators as any[]} dimensions={dimensions as any[]} states={states as any[]} cycles={cycles as any[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IndicatorsPanel({ indicators, dimensions, qc }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dimension_code: "", direction: "higher_better", source: "", sub_component: "" });

  const add = async () => {
    if (!form.name || !form.dimension_code) return toast.error("Name and dimension required");
    const { error } = await supabase.from("indicators").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Indicator added");
    qc.invalidateQueries({ queryKey: ["indicators"] });
    setOpen(false);
    setForm({ name: "", dimension_code: "", direction: "higher_better", source: "", sub_component: "" });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this indicator?")) return;
    const { error } = await supabase.from("indicators").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["indicators"] });
  };

  const byDim = new Map<string, any[]>();
  for (const ind of indicators) {
    const arr = byDim.get(ind.dimension_code) ?? [];
    arr.push(ind); byDim.set(ind.dimension_code, arr);
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg">Indicator catalogue</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Indicator</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Indicator</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Dimension</Label>
                  <Select value={form.dimension_code} onValueChange={(v) => setForm({ ...form, dimension_code: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {dimensions.map((d: any) => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Direction</Label>
                  <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="higher_better">Higher is better</SelectItem>
                      <SelectItem value="lower_better">Lower is better</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Sub-component</Label><Input value={form.sub_component} onChange={(e) => setForm({ ...form, sub_component: e.target.value })} /></div>
              <div><Label>Source</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={add}>Add</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {dimensions.map((d: any) => {
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-muted-foreground">{i.direction}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(i.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CyclesPanel({ cycles, qc }: any) {
  const [form, setForm] = useState({ code: "", label: "", starts_on: "", ends_on: "" });

  const add = async () => {
    if (!form.code || !form.label || !form.starts_on || !form.ends_on) return toast.error("All fields required");
    const { error } = await supabase.from("reporting_cycles").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Cycle added");
    qc.invalidateQueries({ queryKey: ["cycles"] });
    setForm({ code: "", label: "", starts_on: "", ends_on: "" });
  };

  const setCurrent = async (id: string) => {
    // unset all then set selected
    await supabase.from("reporting_cycles").update({ is_current: false }).neq("id", id);
    const { error } = await supabase.from("reporting_cycles").update({ is_current: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Current cycle updated");
    qc.invalidateQueries({ queryKey: ["cycles"] });
    qc.invalidateQueries({ queryKey: ["all-states-scores"] });
  };

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Reporting cycles</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {cycles.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{c.label} <span className="ml-2 text-xs text-muted-foreground">[{c.code}]</span></div>
                <div className="text-xs text-muted-foreground">{c.starts_on} → {c.ends_on}</div>
              </div>
              <div className="flex items-center gap-2">
                {c.is_current
                  ? <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]">Current</Badge>
                  : <Button size="sm" variant="outline" onClick={() => setCurrent(c.id)}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Mark current</Button>}
              </div>
            </div>
          ))}
          {!cycles.length && <div className="p-6 text-center text-sm text-muted-foreground">No cycles yet.</div>}
        </CardContent>
      </Card>
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Add cycle</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="2026-H1" /></div>
          <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="2026 H1" /></div>
          <div><Label>Starts</Label><Input type="date" value={form.starts_on} onChange={(e) => setForm({ ...form, starts_on: e.target.value })} /></div>
          <div><Label>Ends</Label><Input type="date" value={form.ends_on} onChange={(e) => setForm({ ...form, ends_on: e.target.value })} /></div>
          <div className="md:col-span-4"><Button onClick={add}><Plus className="mr-2 h-4 w-4" />Add cycle</Button></div>
        </CardContent>
      </Card>
    </>
  );
}

function ScoresImportPanel({ cycles, qc }: any) {
  const [cycleId, setCycleId] = useState<string>("");
  const [preview, setPreview] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (f: File) => {
    const text = await f.text();
    const rows = parseCsv(text);
    if (!rows.length) return toast.error("Empty CSV");
    if (!("state_code" in rows[0]) || !("resilience_index" in rows[0])) {
      return toast.error("CSV must include state_code and resilience_index");
    }
    setPreview(rows);
    toast.success(`Parsed ${rows.length} rows`);
  };

  const importRows = async () => {
    if (!cycleId) return toast.error("Select cycle");
    if (!preview.length) return toast.error("Upload a CSV first");
    setBusy(true);
    const payload = preview.map((r) => {
      const o: any = { state_code: r.state_code, cycle_id: cycleId };
      for (const k of ["resilience_index", "fiscal", "human_capital", "economic", "governance", "security", "social", "climate"]) {
        if (r[k] !== undefined && r[k] !== "") o[k] = Number(r[k]);
      }
      return o;
    });
    const { error } = await supabase.from("state_scores").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Imported ${payload.length} score rows`);
    setPreview([]); if (fileRef.current) fileRef.current.value = "";
    qc.invalidateQueries({ queryKey: ["all-states-scores"] });
  };

  const template = () => downloadCsv("state_scores_template", [
    { state_code: "KD", resilience_index: 72, fiscal: 70, human_capital: 65, economic: 60, governance: 75, security: 68, social: 70, climate: 62 },
  ], SCORE_COLS.filter((c) => c !== "cycle_id"));

  return (
    <Card className="shadow-soft">
      <CardHeader><CardTitle className="font-display text-lg">Bulk import state scores</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label>Reporting cycle</Label>
            <Select value={cycleId} onValueChange={setCycleId}>
              <SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger>
              <SelectContent>
                {cycles.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.label}{c.is_current ? " (current)" : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>CSV file</Label>
            <Input ref={fileRef} type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={template}><Download className="mr-2 h-4 w-4" />Template</Button>
            <Button disabled={!preview.length || !cycleId || busy} onClick={importRows}><Upload className="mr-2 h-4 w-4" />Import {preview.length || ""}</Button>
          </div>
        </div>
        {preview.length > 0 && (
          <div className="max-h-72 overflow-auto rounded border text-xs">
            <table className="w-full">
              <thead className="bg-muted"><tr>{Object.keys(preview[0]).map((k) => <th key={k} className="px-2 py-1 text-left font-medium">{k}</th>)}</tr></thead>
              <tbody>
                {preview.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t">{Object.keys(preview[0]).map((k) => <td key={k} className="px-2 py-1">{r[k]}</td>)}</tr>
                ))}
              </tbody>
            </table>
            {preview.length > 50 && <div className="p-2 text-center text-muted-foreground">…and {preview.length - 50} more rows</div>}
          </div>
        )}
        <p className="text-xs text-muted-foreground">CSV columns: state_code, resilience_index, fiscal, human_capital, economic, governance, security, social, climate. Cycle is applied from the selector.</p>
      </CardContent>
    </Card>
  );
}

function ExportsPanel({ indicators, dimensions, states, cycles }: any) {
  const exportScores = async () => {
    const { data, error } = await supabase.from("state_scores").select("*, reporting_cycles(code,label), states(name)").limit(5000);
    if (error) return toast.error(error.message);
    const rows = (data ?? []).map((r: any) => ({
      state_code: r.state_code, state: r.states?.name, cycle: r.reporting_cycles?.label,
      resilience_index: r.resilience_index, fiscal: r.fiscal, human_capital: r.human_capital,
      economic: r.economic, governance: r.governance, security: r.security, social: r.social, climate: r.climate,
    }));
    downloadCsv("state_scores", rows);
  };

  const items = [
    { label: "Indicators", n: indicators.length, run: () => downloadCsv("indicators", indicators) },
    { label: "Dimensions", n: dimensions.length, run: () => downloadCsv("dimensions", dimensions) },
    { label: "States", n: states.length, run: () => downloadCsv("states", states.map((s: any) => ({ code: s.code, name: s.name, zone_code: s.zone_code, capital: s.capital, population_millions: s.population_millions }))) },
    { label: "Cycles", n: cycles.length, run: () => downloadCsv("cycles", cycles) },
    { label: "State scores (all cycles)", n: "live", run: exportScores },
  ];

  return (
    <Card className="shadow-soft">
      <CardHeader><CardTitle className="font-display text-lg">Exports</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between rounded border p-3">
            <div>
              <div className="font-medium">{it.label}</div>
              <div className="text-xs text-muted-foreground">{it.n} {typeof it.n === "number" ? "rows" : ""}</div>
            </div>
            <Button size="sm" variant="outline" onClick={it.run}><Download className="mr-2 h-4 w-4" />Download CSV</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
