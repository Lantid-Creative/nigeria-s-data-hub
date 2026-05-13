import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowLeft, MapPin } from "lucide-react";

export const Route = createFileRoute("/states/$code")({
  component: PublicState,
  head: ({ params }) => ({
    meta: [
      { title: `${params.code} · State Profile — NGF Futures Lab` },
      { name: "description", content: `Public resilience profile, SNRI score and dimensions for ${params.code} state.` },
      { property: "og:title", content: `${params.code} — State Resilience Profile` },
      { property: "og:description", content: `Sub-National Resilience Index and dimension scores for ${params.code}.` },
      { property: "og:image", content: "/og-image.jpg" },
    ],
  }),
});

const DIMS = [
  { key: "economic", label: "Economic" },
  { key: "fiscal", label: "Fiscal" },
  { key: "human_capital", label: "Human Capital" },
  { key: "climate", label: "Climate" },
  { key: "governance", label: "Governance" },
  { key: "security", label: "Security" },
  { key: "social", label: "Social" },
];

function PublicState() {
  const { code } = Route.useParams();
  const codeUp = code.toUpperCase();

  const { data: state } = useQuery({
    queryKey: ["pub-state", codeUp],
    queryFn: async () => {
      const { data } = await supabase.from("states").select("*").eq("code", codeUp).maybeSingle();
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["pub-state-scores", codeUp],
    queryFn: async () => {
      const { data } = await supabase.from("state_scores")
        .select("*, reporting_cycles(label, starts_on)")
        .eq("state_code", codeUp)
        .order("created_at", { ascending: false }).limit(8);
      return data ?? [];
    },
  });

  const latest: any = scores[0];
  const trajectory = [...scores].reverse().map((s: any) => ({
    cycle: s.reporting_cycles?.label ?? new Date(s.created_at).toISOString().slice(0, 7),
    snri: Number(s.resilience_index ?? 0),
  }));
  const radar = latest ? DIMS.map((d) => ({ dim: d.label, value: Number(latest[d.key] ?? 0) })) : [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <Link to="/states" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> All states
        </Link>

        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">State Profile</span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{state?.name ?? codeUp}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {state?.capital ?? "—"} · Zone {state?.zone_code ?? "—"} · {state?.population_millions ?? "—"}M residents
            </p>
          </div>
          {latest && (
            <div className="rounded-2xl border bg-card px-6 py-4 text-right shadow-soft">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current SNRI</div>
              <div className="font-display text-5xl text-primary tabular-nums">{Number(latest.resilience_index).toFixed(1)}</div>
            </div>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display">Resilience profile</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer>
                  <RadarChart data={radar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dim" fontSize={11} />
                    <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                    <Radar dataKey="value" stroke="oklch(0.45 0.13 155)" fill="oklch(0.45 0.13 155 / 0.3)" />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display">SNRI trajectory</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer>
                  <LineChart data={trajectory}>
                    <XAxis dataKey="cycle" fontSize={11} />
                    <YAxis domain={[0, 100]} fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="snri" stroke="oklch(0.45 0.13 155)" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 shadow-soft">
          <CardHeader><CardTitle className="font-display">Dimension scores</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            {latest ? DIMS.map((d) => (
              <div key={d.key} className="rounded-lg border p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.label}</div>
                <div className="mt-1 font-display text-2xl tabular-nums">{Number(latest[d.key] ?? 0).toFixed(0)}</div>
              </div>
            )) : <div className="text-sm text-muted-foreground">No scores published yet.</div>}
          </CardContent>
        </Card>

        <div className="mt-10 rounded-2xl border bg-muted/30 p-6 text-sm text-muted-foreground">
          <Badge variant="outline" className="mb-2">Public profile</Badge>
          <p>Data published by the NGF Futures Lab from the {state?.name ?? codeUp} state PRS unit submission, scored by the SNRI methodology. State officials can sign in to view the full workspace.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
