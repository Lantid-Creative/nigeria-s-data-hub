import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlerts, useAlertReads, useStateCode } from "@/lib/state-data";
import { AlertCircle, Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/state/alerts")({ component: Alerts });

function Alerts() {
  const code = useStateCode();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: alerts = [] } = useAlerts(code);
  const { data: reads = new Set<string>() } = useAlertReads();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Realtime
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("state-alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        qc.invalidateQueries({ queryKey: ["alerts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  const visible = useMemo(() => {
    if (filter === "unread") return (alerts as any[]).filter((a) => !reads.has(a.id));
    return alerts as any[];
  }, [alerts, filter, reads]);

  async function markRead(alertId: string) {
    if (!user) return;
    await supabase.from("alert_reads").upsert({ user_id: user.id, alert_id: alertId }, { onConflict: "user_id,alert_id" });
    qc.invalidateQueries({ queryKey: ["alert-reads", user.id] });
  }

  async function markAllRead() {
    if (!user) return;
    const unread = (alerts as any[]).filter((a) => !reads.has(a.id));
    if (!unread.length) return;
    await supabase.from("alert_reads").upsert(
      unread.map((a) => ({ user_id: user.id, alert_id: a.id })),
      { onConflict: "user_id,alert_id" }
    );
    qc.invalidateQueries({ queryKey: ["alert-reads", user.id] });
  }

  const unreadCount = (alerts as any[]).filter((a) => !reads.has(a.id)).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        description={`Alerts and updates for ${code} State`}
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant={filter === "all" ? "default" : "outline"} className={filter === "all" ? "bg-primary" : ""} onClick={() => setFilter("all")}>
              All ({alerts.length})
            </Button>
            <Button size="sm" variant={filter === "unread" ? "default" : "outline"} className={filter === "unread" ? "bg-primary" : ""} onClick={() => setFilter("unread")}>
              Unread ({unreadCount})
            </Button>
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllRead}>
                <Check className="mr-1 h-3 w-3" /> Mark all read
              </Button>
            )}
          </div>
        }
      />
      <Card className="shadow-soft">
        <CardContent className="divide-y p-0">
          {visible.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 h-6 w-6" /> {filter === "unread" ? "No unread notifications." : "No notifications."}
            </div>
          )}
          {visible.map((a: any) => {
            const isUnread = !reads.has(a.id);
            return (
              <div key={a.id} className={`flex items-start gap-4 p-4 ${isUnread ? "bg-primary/5" : ""}`}>
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${
                  a.level === "high" ? "bg-destructive/10 text-destructive" :
                  a.level === "medium" ? "bg-gold/20 text-gold-foreground" :
                  "bg-[color:var(--info)]/15 text-[color:var(--info)]"
                }`}>
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{a.title}</span>
                    {isUnread && <Badge variant="outline" className="text-[9px]">new</Badge>}
                  </div>
                  {a.body && <div className="mt-0.5 text-xs text-muted-foreground">{a.body}</div>}
                  <div className="mt-1 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{a.level}</Badge>
                  {isUnread && (
                    <Button size="sm" variant="ghost" onClick={() => markRead(a.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
