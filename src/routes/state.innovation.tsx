import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, FlaskConical } from "lucide-react";
import { useInnovationPilots, useResearchProjects } from "@/lib/state-data";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/state/innovation")({ component: StateInnovation });

function StateInnovation() {
  const { data: pilots = [] } = useInnovationPilots();
  const { data: research = [] } = useResearchProjects();
  const [stateCode, setStateCode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("current_state_code");
      setStateCode((data as any) ?? null);
    })();
  }, []);

  const myPilots = (pilots as any[]).filter((p) => !stateCode || p.state_code === stateCode);

  return (
    <div className="space-y-6">
      <SectionHeader title="Innovation & Research" description="Pilots in your state and the national research portfolio" />

      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-gold" /> Pilots in your state</div>
        <div className="grid gap-4 md:grid-cols-2">
          {myPilots.map((p) => (
            <Card key={p.id} className="shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold">{p.title}</div>
                  <Badge variant="outline">{p.stage}</Badge>
                </div>
                {p.summary && <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>}
                {p.impact && <div className="mt-2 text-xs text-muted-foreground">Impact: {p.impact}</div>}
              </CardContent>
            </Card>
          ))}
          {!myPilots.length && <Card className="md:col-span-2"><CardContent className="p-8 text-center text-sm text-muted-foreground">No active pilots in your state yet.</CardContent></Card>}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><FlaskConical className="h-4 w-4 text-primary" /> National research portfolio</div>
        <div className="grid gap-4 md:grid-cols-2">
          {(research as any[]).map((r) => (
            <Card key={r.id} className="shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold">{r.title}</div>
                  <Badge variant="outline">{r.status}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Lead: {r.lead_name}</div>
                {r.summary && <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>}
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${r.progress}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
          {!(research as any[]).length && <Card className="md:col-span-2"><CardContent className="p-8 text-center text-sm text-muted-foreground">No research projects yet.</CardContent></Card>}
        </div>
      </div>
    </div>
  );
}
