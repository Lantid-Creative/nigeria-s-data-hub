import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { STATE_METRICS } from "@/lib/mock-data";

export const Route = createFileRoute("/state/profile")({ component: () => {
  const s = STATE_METRICS[17]; // Kaduna
  return (
    <div className="space-y-6">
      <SectionHeader title="State Profile" description="Kaduna State · core indicators and metadata" />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { l: "Population", v: `${s.populationMillions}M` },
          { l: "IGR", v: `₦${s.igrBillion}bn` },
          { l: "Unemployment", v: `${s.unemploymentRate}%` },
          { l: "Poverty rate", v: `${s.povertyRate}%` },
          { l: "Resilience", v: s.resilienceIndex },
          { l: "Climate risk", v: s.climateRisk },
        ].map((x) => (
          <Card key={x.l} className="shadow-soft"><CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{x.l}</div>
            <div className="mt-1 font-display text-3xl">{x.v}</div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}});
