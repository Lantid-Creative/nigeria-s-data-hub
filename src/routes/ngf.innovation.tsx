import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, MapPin, TrendingUp } from "lucide-react";
import { INNOVATION_PILOTS } from "@/lib/mock-data";

export const Route = createFileRoute("/ngf/innovation")({
  component: Innovation,
});

const stageColor = (stage: string) =>
  stage === "Scaling" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" :
  stage === "Active" ? "bg-primary/10 text-primary" :
  stage === "Pilot" ? "bg-gold/20 text-gold-foreground" :
  "bg-muted text-muted-foreground";

function Innovation() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Innovation Pilots"
        description="Living labs and policy experiments across the federation"
        action={<Button className="bg-primary"><Plus className="mr-2 h-4 w-4" />Launch pilot</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active Pilots" value={INNOVATION_PILOTS.length} icon={Lightbulb} accent="gold" />
        <StatCard label="States Engaged" value="14" icon={MapPin} accent="primary" />
        <StatCard label="Scaled" value="3" icon={TrendingUp} accent="info" delta={1} />
        <StatCard label="Lessons Codified" value="46" icon={Lightbulb} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {INNOVATION_PILOTS.map((p) => (
          <Card key={p.title} className="group relative overflow-hidden shadow-soft transition hover:shadow-elevated">
            <div className="absolute inset-x-0 top-0 h-1 gradient-gold opacity-0 transition group-hover:opacity-100" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">{p.state}</div>
                  <h3 className="mt-0.5 font-display text-lg">{p.title}</h3>
                </div>
                <Badge className={stageColor(p.stage)}>{p.stage}</Badge>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Reach: <span className="text-foreground">{p.impact}</span></div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">View dossier</Button>
                <Button variant="ghost" size="sm">Replicate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg">Innovation pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {["Discovery", "Design", "Pilot", "Scale"].map((stage, i) => (
              <div key={stage} className="rounded-lg border bg-muted/30 p-4">
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">{stage}</div>
                <div className="mt-2 font-display text-2xl text-primary">{[8, 5, 6, 3][i]}</div>
                <div className="mt-1 text-muted-foreground">initiatives</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
