import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { AiInsightCard } from "@/components/platform/AiInsightCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAllStatesLatestScores, useAlerts, useAllSubmissions, useNationalSnriTrend } from "@/lib/state-data";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ngf/briefing")({ component: Briefing });

function Briefing() {
  const { data: scores = [] } = useAllStatesLatestScores();
  const { data: alerts = [] } = useAlerts(null);
  const { data: subs = [] } = useAllSubmissions();
  const { data: trend = [] } = useNationalSnriTrend();

  const reporting = new Set(subs.filter((s: any) => s.status !== "not_started").map((s: any) => s.state_code)).size;
  const nationalSnri = scores.length
    ? +(scores.reduce((a: number, s: any) => a + Number(s.resilience_index ?? 0), 0) / scores.length).toFixed(1)
    : 0;

  const sorted = [...scores].sort((a: any, b: any) => Number(a.resilience_index) - Number(b.resilience_index));
  const bottom5 = sorted.slice(0, 5).map((s: any) => ({ state: s.states?.name, snri: Number(s.resilience_index) }));
  const top5 = sorted.slice(-5).reverse().map((s: any) => ({ state: s.states?.name, snri: Number(s.resilience_index) }));

  const { data: stored } = useQuery({
    queryKey: ["latest-briefing"],
    queryFn: async () => {
      const { data } = await supabase.from("ai_briefings").select("*").eq("scope", "national").order("briefing_date", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Daily Executive Briefing" description="AI-generated overview of the national picture for the Director-General" />

      {stored && (
        <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Cron-generated brief · {stored.briefing_date}</CardTitle>
            <Badge variant="outline">auto · 06:00 UTC</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {stored.summary && <p className="text-sm">{stored.summary}</p>}
            {Array.isArray(stored.bullets) && stored.bullets.length > 0 && (
              <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                {(stored.bullets as any[]).map((b: any, i: number) => <li key={i}>{String(b)}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <AiInsightCard
        mode="briefing"
        title="Today's brief"
        description="Headline · key signals · risks · decisions for the week"
        context={{
          national_snri: nationalSnri, states_reporting: reporting,
          trend, top5, bottom5,
          recent_alerts: alerts.slice(0, 8).map((a: any) => ({ title: a.title, level: a.level, state: a.state_code })),
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <AiInsightCard
          mode="anomaly"
          title="Anomaly digest"
          description="Top 5 unusual signals worth investigating"
          context={{ scores, recent_alerts: alerts.slice(0, 12) }}
        />
        <AiInsightCard
          mode="hotspot"
          title="Hotspot scan"
          description="States most in need of intervention"
          context={{ bottom5, scores: scores.slice(0, 36) }}
        />
      </div>
    </div>
  );
}
