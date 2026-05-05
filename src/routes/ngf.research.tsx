import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";
import { useResearchProjects } from "@/lib/state-data";
import { AiInsightCard } from "@/components/platform/AiInsightCard";

export const Route = createFileRoute("/ngf/research")({ component: Research });

function Research() {
  const { data: rows = [] } = useResearchProjects();
  return (
    <div className="space-y-6">
      <SectionHeader title="Research Lab" description="Active research projects and field studies" />
      <AiInsightCard
        mode="research"
        title="Portfolio Synthesis"
        description="AI assessment of research health, blockers and proposed next field studies."
        context={{
          projects: (rows as any[]).map((r) => ({ title: r.title, status: r.status, progress: r.progress, lead: r.lead_name, summary: r.summary })),
        }}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {(rows as any[]).map((r) => (
          <Card key={r.id} className="shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  <div className="font-semibold">{r.title}</div>
                </div>
                <Badge variant="outline">{r.status}</Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Lead: {r.lead_name}</div>
              {r.summary && <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{r.progress}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${r.progress}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <Card className="md:col-span-2"><CardContent className="p-8 text-center text-sm text-muted-foreground">No research projects yet.</CardContent></Card>}
      </div>
    </div>
  );
}
