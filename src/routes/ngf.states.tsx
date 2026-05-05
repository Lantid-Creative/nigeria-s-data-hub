import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { useAllStates, useAllStatesLatestScores, useZones, useAllSubmissions } from "@/lib/state-data";

export const Route = createFileRoute("/ngf/states")({ component: States });

function States() {
  const [q, setQ] = useState("");
  const [zone, setZone] = useState("all");
  const { data: states = [] } = useAllStates();
  const { data: scores = [] } = useAllStatesLatestScores();
  const { data: zones = [] } = useZones();
  const { data: subs = [] } = useAllSubmissions();

  const scoreByCode = useMemo(() => {
    const m = new Map<string, any>();
    for (const s of scores as any[]) m.set(s.state_code, s);
    return m;
  }, [scores]);

  const subsByCode = useMemo(() => {
    const m = new Map<string, { pct: number; status: string }>();
    for (const s of subs as any[]) {
      const cur = m.get(s.state_code);
      if (!cur || s.completion_pct > cur.pct) m.set(s.state_code, { pct: s.completion_pct, status: s.status });
    }
    return m;
  }, [subs]);

  const rows = useMemo(() => {
    return (states as any[])
      .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
      .filter((s) => zone === "all" || s.zone_code === zone);
  }, [states, q, zone]);

  function exportCsv() {
    const header = ["State","Zone","SNRI","Fiscal","Human","Climate","Security","Economic","Survey%","Status"];
    const lines = [header.join(",")];
    for (const s of rows) {
      const sc = scoreByCode.get(s.code) ?? {};
      const sub = subsByCode.get(s.code);
      lines.push([
        s.name, s.zone_code,
        sc.resilience_index ?? "", sc.fiscal ?? "", sc.human_capital ?? "",
        sc.climate ?? "", sc.security ?? "", sc.economic ?? "",
        sub?.pct ?? 0, sub?.status ?? "not_started",
      ].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ngf-states.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="State Directory"
        description="Detailed profile, indicators and reporting status for every state"
        action={<Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export CSV</Button>}
      />

      <Card className="shadow-soft">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search state…" className="pl-9" />
          </div>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All zones</SelectItem>
              {zones.map((z: any) => <SelectItem key={z.code} value={z.code}>{z.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-muted-foreground">{rows.length} states</div>
        </CardContent>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">SNRI</th>
                <th className="px-4 py-3">Fiscal</th>
                <th className="px-4 py-3">Human</th>
                <th className="px-4 py-3">Climate</th>
                <th className="px-4 py-3">Security</th>
                <th className="px-4 py-3">Pop (m)</th>
                <th className="px-4 py-3">Survey</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((s: any) => {
                const sc = scoreByCode.get(s.code) ?? {};
                const sub = subsByCode.get(s.code);
                const pct = sub?.pct ?? 0;
                const status = sub?.status ?? "not_started";
                return (
                  <tr key={s.code} className="transition hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.zone_code}</td>
                    <td className="px-4 py-3"><span className="font-display text-base text-primary">{Math.round(Number(sc.resilience_index ?? 0)) || "—"}</span></td>
                    <td className="px-4 py-3">{sc.fiscal ?? "—"}</td>
                    <td className="px-4 py-3">{sc.human_capital ?? "—"}</td>
                    <td className="px-4 py-3">{sc.climate ?? "—"}</td>
                    <td className="px-4 py-3">{sc.security ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{s.population_millions ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {status === "submitted" || status === "approved" ? <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]">{status}</Badge> :
                       status === "in_progress" ? <Badge className="bg-gold/20 text-gold-foreground">In progress</Badge> :
                       status === "rejected" ? <Badge className="bg-destructive/10 text-destructive">Rejected</Badge> :
                       <Badge variant="outline">Not started</Badge>}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">No states match.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
