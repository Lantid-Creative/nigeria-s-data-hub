import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, ArrowUpDown, MapPin } from "lucide-react";
import { STATE_METRICS, ZONES } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/ngf/states")({
  component: States,
});

function States() {
  const [q, setQ] = useState("");
  const [zone, setZone] = useState("all");
  const filtered = STATE_METRICS.filter(
    (s) => s.name.toLowerCase().includes(q.toLowerCase()) && (zone === "all" || s.zone === zone),
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="State Directory"
        description="Detailed profile, indicators and reporting status for every state"
        action={<Button variant="outline"><Download className="mr-2 h-4 w-4" />Export CSV</Button>}
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
              {Object.keys(ZONES).map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-muted-foreground">{filtered.length} states</div>
        </CardContent>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3"><span className="inline-flex items-center gap-1">SNRI <ArrowUpDown className="h-3 w-3" /></span></th>
                <th className="px-4 py-3">Fiscal</th>
                <th className="px-4 py-3">Human</th>
                <th className="px-4 py-3">Climate Risk</th>
                <th className="px-4 py-3">Security</th>
                <th className="px-4 py-3">IGR (₦bn)</th>
                <th className="px-4 py-3">Survey</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s) => (
                <tr key={s.name} className="transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.zone}</td>
                  <td className="px-4 py-3">
                    <span className="font-display text-base text-primary">{s.resilienceIndex}</span>
                  </td>
                  <td className="px-4 py-3">{s.fiscalHealth}</td>
                  <td className="px-4 py-3">{s.humanCapital}</td>
                  <td className="px-4 py-3">
                    <span className={s.climateRisk > 70 ? "text-destructive" : ""}>{s.climateRisk}</span>
                  </td>
                  <td className="px-4 py-3">{s.securityIndex}</td>
                  <td className="px-4 py-3 tabular-nums">{s.igrBillion}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${s.surveyCompletion}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{s.surveyCompletion}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.status === "submitted" && <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]">Submitted</Badge>}
                    {s.status === "in-progress" && <Badge className="bg-gold/20 text-gold-foreground">In progress</Badge>}
                    {s.status === "overdue" && <Badge className="bg-destructive/10 text-destructive">Overdue</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
