import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/lib/state-data";

export const Route = createFileRoute("/ngf/alerts")({ component: AlertsPage });

function AlertsPage() {
  const { data: alerts = [] } = useAlerts(null);
  return (
    <div className="space-y-6">
      <SectionHeader title="Alerts & Early Warning" description="Risk signals from foresight models and submissions" />
      <Card className="shadow-soft"><CardContent className="divide-y p-0">
        {(alerts as any[]).map((a) => (
          <div key={a.id} className="flex items-start gap-4 p-4">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${a.level === "high" ? "bg-destructive" : a.level === "medium" ? "bg-gold" : "bg-[color:var(--info)]"}`} />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{a.title}</div>
              {a.body && <div className="mt-0.5 text-sm text-muted-foreground">{a.body}</div>}
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">{a.audience}</Badge>
                {a.state_code && <span>{a.state_code}</span>}
                <span>· {new Date(a.created_at).toLocaleString()}</span>
              </div>
            </div>
            <Badge variant={a.level === "high" ? "destructive" : "outline"}>{a.level}</Badge>
          </div>
        ))}
        {!alerts.length && <div className="p-8 text-center text-sm text-muted-foreground">No alerts yet.</div>}
      </CardContent></Card>
    </div>
  );
}
