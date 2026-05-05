import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlerts, useStateCode } from "@/lib/state-data";
import { AlertCircle, Bell } from "lucide-react";

export const Route = createFileRoute("/state/alerts")({ component: Alerts });

function Alerts() {
  const code = useStateCode();
  const { data: alerts = [] } = useAlerts(code);

  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" description={`Alerts and updates for ${code} State`} />
      <Card className="shadow-soft">
        <CardContent className="divide-y p-0">
          {alerts.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 h-6 w-6" /> No notifications.
            </div>
          )}
          {alerts.map((a: any) => (
            <div key={a.id} className="flex items-start gap-4 p-4">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${
                a.level === "high" ? "bg-destructive/10 text-destructive" :
                a.level === "medium" ? "bg-gold/20 text-gold-foreground" :
                "bg-[color:var(--info)]/15 text-[color:var(--info)]"
              }`}>
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{a.title}</div>
                {a.body && <div className="mt-0.5 text-xs text-muted-foreground">{a.body}</div>}
                <div className="mt-1 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
              </div>
              <Badge variant="outline" className="capitalize">{a.level}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
