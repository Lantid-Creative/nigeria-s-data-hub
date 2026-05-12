import { useEffect, useMemo } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useAlerts, useAlertReads } from "@/lib/state-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export function NotificationBell({ to }: { to: "/state/alerts" | "/ngf/alerts" }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: alerts = [] } = useAlerts(null);
  const { data: reads = new Set() } = useAlertReads();

  // Realtime: refresh on new alerts or new reads
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("alerts-bell")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        qc.invalidateQueries({ queryKey: ["alerts"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "alert_reads" }, () => {
        qc.invalidateQueries({ queryKey: ["alert-reads", user.id] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, qc]);

  const unread = useMemo(
    () => (alerts as any[]).filter((a) => !reads.has(a.id)),
    [alerts, reads]
  );
  const recent = (alerts as any[]).slice(0, 8);

  async function markAllRead() {
    if (!user || !unread.length) return;
    const rows = unread.map((a) => ({ user_id: user.id, alert_id: a.id }));
    await supabase.from("alert_reads").upsert(rows, { onConflict: "user_id,alert_id" });
    qc.invalidateQueries({ queryKey: ["alert-reads", user.id] });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unread.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 divide-y overflow-y-auto">
          {recent.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">No notifications yet.</div>
          )}
          {recent.map((a: any) => {
            const isUnread = !reads.has(a.id);
            return (
              <div key={a.id} className={`flex items-start gap-2 p-3 ${isUnread ? "bg-primary/5" : ""}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  a.level === "high" ? "bg-destructive" :
                  a.level === "medium" ? "bg-gold" : "bg-[color:var(--info)]"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-xs font-medium">{a.title}</div>
                  {a.body && <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{a.body}</div>}
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                {isUnread && <Badge variant="outline" className="text-[9px]">new</Badge>}
              </div>
            );
          })}
        </div>
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full text-xs">
            <Link to={to}>View all</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
