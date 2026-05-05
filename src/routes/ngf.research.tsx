import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, FileText, Plus, Users, BookOpen } from "lucide-react";
import { RESEARCH_PROJECTS } from "@/lib/mock-data";

export const Route = createFileRoute("/ngf/research")({
  component: Research,
});

function Research() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Research Lab"
        description="Active studies, working papers and futures research"
        action={<Button className="bg-primary"><Plus className="mr-2 h-4 w-4" />New study</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active Studies" value="14" icon={FlaskConical} accent="primary" />
        <StatCard label="Working Papers" value="38" icon={FileText} accent="gold" />
        <StatCard label="Researchers" value="22" icon={Users} accent="info" />
        <StatCard label="Knowledge Assets" value="412" icon={BookOpen} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {RESEARCH_PROJECTS.map((p) => (
          <Card key={p.title} className="shadow-soft transition hover:border-primary/40">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base">{p.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Lead: {p.lead}</p>
                </div>
                <Badge variant="outline">{p.status}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Progress value={p.progress} className="h-1.5" />
                <span className="text-xs text-muted-foreground">{p.progress}%</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">Open workspace</Button>
                <Button variant="ghost" size="sm">Share findings</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg">Research methodologies</CardTitle>
          <p className="text-xs text-muted-foreground">Frameworks deployed across the Futures Lab</p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            { t: "Strategic foresight", d: "Three-horizons, scenario planning, backcasting." },
            { t: "Systems mapping", d: "Causal loops, leverage analysis, archetypes." },
            { t: "Quantitative modelling", d: "Bayesian, ML, time-series, agent-based." },
            { t: "Ethnographic", d: "Community ethnographies, sensemaking workshops." },
            { t: "Resilience indices", d: "SNRI v2, sectoral and zonal sub-indices." },
            { t: "Policy experiments", d: "RCTs, quasi-experiments, living labs." },
          ].map((m) => (
            <div key={m.t} className="rounded-lg border p-4">
              <div className="text-sm font-semibold">{m.t}</div>
              <div className="mt-1 text-xs text-muted-foreground">{m.d}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
