import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, MapPin } from "lucide-react";
import { useInnovationPilots } from "@/lib/state-data";

export const Route = createFileRoute("/ngf/innovation")({ component: Innovation });

function Innovation() {
  const { data: rows = [] } = useInnovationPilots();
  return (
    <div className="space-y-6">
      <SectionHeader title="Innovation Pilots" description="Sub-national experiments and living labs" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(rows as any[]).map((p) => (
          <Card key={p.id} className="shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <Lightbulb className="h-5 w-5 text-gold" />
                <Badge variant="outline">{p.stage}</Badge>
              </div>
              <div className="mt-3 font-semibold">{p.title}</div>
              {p.summary && <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.states?.name ?? p.state_code ?? "—"}</span>
                {p.impact && <span>· {p.impact}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <Card className="md:col-span-3"><CardContent className="p-8 text-center text-sm text-muted-foreground">No pilots yet.</CardContent></Card>}
      </div>
    </div>
  );
}
