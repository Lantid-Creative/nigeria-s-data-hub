import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ALERTS } from "@/lib/mock-data";

export const Route = createFileRoute("/ngf/alerts")({ component: () => (
  <div className="space-y-6">
    <SectionHeader title="Alerts & Early Warning" description="Risk signals from foresight models and submissions" />
    <Card className="shadow-soft"><CardContent className="divide-y p-0">
      {[...ALERTS, ...ALERTS].map((a, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <span className={`h-2.5 w-2.5 rounded-full ${a.level === "high" ? "bg-destructive" : a.level === "medium" ? "bg-gold" : "bg-[color:var(--info)]"}`} />
          <div className="flex-1"><div className="text-sm">{a.title}</div><div className="text-xs text-muted-foreground">{a.time}</div></div>
          <Badge variant="outline" className="capitalize">{a.level}</Badge>
        </div>
      ))}
    </CardContent></Card>
  </div>
)});
