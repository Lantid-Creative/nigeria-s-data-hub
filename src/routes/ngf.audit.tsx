import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toCsv, downloadCsv } from "@/lib/csv";
import { formatDistanceToNow } from "date-fns";
import { Activity, Download, Search } from "lucide-react";

export const Route = createFileRoute("/ngf/audit")({ component: AuditPage });

type Row = {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  actor_email: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function AuditPage() {
  const [q, setQ] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, entity, entity_id, actor_email, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    refetchInterval: 30_000,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((r) =>
      [r.action, r.entity, r.entity_id, r.actor_email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [data, q]);

  const exportCsv = () => {
    const rows = filtered.map((r) => ({
      timestamp: r.created_at,
      actor: r.actor_email ?? "",
      action: r.action,
      entity: r.entity,
      entity_id: r.entity_id ?? "",
      metadata: JSON.stringify(r.metadata ?? {}),
    }));
    downloadCsv(`audit-log-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Audit Log"
        description="Platform activity stream — actions, actors, and entities across the workspace."
      />

      <Card className="shadow-soft">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Activity className="h-4 w-4 text-primary" /> Recent activity
            <Badge variant="secondary" className="ml-2">{filtered.length}</Badge>
          </CardTitle>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by action, entity, actor…"
                className="h-9 pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No activity recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">Actor</th>
                    <th className="py-2 pr-3">Action</th>
                    <th className="py-2 pr-3">Entity</th>
                    <th className="py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-2 pr-3">{r.actor_email ?? "—"}</td>
                      <td className="py-2 pr-3">
                        <Badge variant="outline" className="font-mono text-[11px]">
                          {r.action}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {r.entity}
                        {r.entity_id ? <span className="text-muted-foreground"> · {r.entity_id.slice(0, 8)}</span> : null}
                      </td>
                      <td className="max-w-[360px] truncate py-2 font-mono text-[11px] text-muted-foreground">
                        {r.metadata && Object.keys(r.metadata).length > 0
                          ? JSON.stringify(r.metadata)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
