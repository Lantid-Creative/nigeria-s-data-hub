import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { logEvent } from "@/lib/audit";

export const Route = createFileRoute("/ngf/scenarios")({ component: ScenariosList });

function ScenariosList() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["saved-scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_scenarios").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleShare = async (id: string, current: boolean) => {
    const { error } = await supabase.from("saved_scenarios").update({ is_shared: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(!current ? "Shared with all signed-in users" : "Made private");
    logEvent("scenario.share", "scenario", id, { shared: !current });
    qc.invalidateQueries({ queryKey: ["saved-scenarios"] });
  };

  const remove = async (id: string) => {
    await supabase.from("saved_scenarios").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["saved-scenarios"] });
  };

  const sharedCount = rows.filter((r: any) => r.is_shared).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Saved scenarios"
        description="What-if shocks you've saved from the scenario builder"
        action={<Button asChild className="bg-primary"><Link to="/ngf">Build new →</Link></Button>}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Saved scenarios" value={rows.length} icon={Sparkles} accent="primary" />
        <StatCard label="Shared" value={sharedCount} icon={Share2} accent="info" />
        <StatCard label="Private" value={rows.length - sharedCount} icon={Sparkles} accent="gold" />
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Library</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {rows.map((r: any) => {
            const shocks = r.shocks ?? {};
            const top = Object.entries(shocks)
              .filter(([, v]) => Number(v) !== 0)
              .sort((a, b) => Math.abs(Number(b[1])) - Math.abs(Number(a[1])))
              .slice(0, 4);
            return (
              <div key={r.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="font-medium">{r.name}</div>
                  {r.description && <div className="text-xs text-muted-foreground">{r.description}</div>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {top.map(([k, v]) => (
                      <Badge key={k} variant="outline" className="text-[10px] tabular-nums">
                        {k}: {Number(v) > 0 ? "+" : ""}{v}
                      </Badge>
                    ))}
                    {!top.length && <span className="text-xs text-muted-foreground">no shocks applied</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.is_shared ? "default" : "secondary"}>{r.is_shared ? "shared" : "private"}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => toggleShare(r.id, r.is_shared)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {!rows.length && <div className="p-6 text-center text-sm text-muted-foreground">No scenarios saved yet. Use "Save scenario" on the builder.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
