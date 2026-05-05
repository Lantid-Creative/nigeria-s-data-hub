import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStateCode, useStateRow, useStateScores } from "@/lib/state-data";

export const Route = createFileRoute("/state/profile")({ component: StateProfile });

function StateProfile() {
  const code = useStateCode();
  const { data: state } = useStateRow(code);
  const { data: scores = [] } = useStateScores(code);
  const latest = scores[scores.length - 1];

  const dims = latest
    ? [
        { l: "Economic", v: latest.economic },
        { l: "Fiscal", v: latest.fiscal },
        { l: "Human Capital", v: latest.human_capital },
        { l: "Climate", v: latest.climate },
        { l: "Governance", v: latest.governance },
        { l: "Security", v: latest.security },
        { l: "Social", v: latest.social },
      ]
    : [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="State Profile"
        description={`${state?.name ?? code} State · core indicators and SNRi composition`}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "State", v: state?.name ?? "—" },
          { l: "Capital", v: state?.capital ?? "—" },
          { l: "Zone", v: state?.zone_code ?? "—" },
          { l: "Population", v: state ? `${state.population_millions}M` : "—" },
        ].map((x) => (
          <Card key={x.l} className="shadow-soft">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{x.l}</div>
              <div className="mt-1 font-display text-2xl">{x.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg">Current SNRi composition</CardTitle>
          <p className="text-xs text-muted-foreground">
            Composite Resilience Index: <span className="font-semibold text-primary">{latest ? Number(latest.resilience_index).toFixed(1) : "—"}</span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dims.map((d) => (
              <div key={d.l} className="rounded-lg border p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{d.l}</div>
                <div className="mt-1 font-display text-3xl">{d.v == null ? "—" : Number(d.v).toFixed(0)}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${d.v ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Reporting history</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {scores.slice().reverse().map((s: any) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <div className="font-medium">{s.reporting_cycles?.label}</div>
                <div className="text-xs text-muted-foreground">Submitted {new Date(s.created_at).toLocaleDateString()}</div>
              </div>
              <Badge variant="outline">SNRi {Number(s.resilience_index).toFixed(1)}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
