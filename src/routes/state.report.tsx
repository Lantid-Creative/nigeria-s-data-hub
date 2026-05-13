import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStateCode } from "@/lib/state-data";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/state/report")({ component: StateReport });

const DIMS = [
  { key: "economic", label: "Economic" },
  { key: "fiscal", label: "Fiscal" },
  { key: "human_capital", label: "Human Capital" },
  { key: "climate", label: "Climate" },
  { key: "governance", label: "Governance" },
  { key: "security", label: "Security" },
  { key: "social", label: "Social" },
];

function StateReport() {
  const code = useStateCode();

  const { data: state } = useQuery({
    queryKey: ["report-state", code],
    queryFn: async () => (await supabase.from("states").select("*").eq("code", code).maybeSingle()).data,
  });
  const { data: scores = [] } = useQuery({
    queryKey: ["report-scores", code],
    queryFn: async () => (await supabase.from("state_scores").select("*, reporting_cycles(label)").eq("state_code", code).order("created_at", { ascending: false }).limit(8)).data ?? [],
  });
  const { data: commitments = [] } = useQuery({
    queryKey: ["report-commitments", code],
    queryFn: async () => (await supabase.from("commitments").select("*").eq("state_code", code).order("target_date")).data ?? [],
  });

  const latest: any = scores[0];
  const radar = latest ? DIMS.map((d) => ({ dim: d.label, value: Number(latest[d.key] ?? 0) })) : [];
  const trajectory = [...scores].reverse().map((s: any) => ({
    cycle: s.reporting_cycles?.label ?? new Date(s.created_at).toISOString().slice(0, 7),
    snri: Number(s.resilience_index ?? 0),
  }));

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-display text-2xl">State performance report</h1>
          <p className="text-sm text-muted-foreground">Printable / PDF-ready summary for governor briefings</p>
        </div>
        <Button onClick={() => window.print()} className="bg-primary"><Printer className="mr-2 h-4 w-4" /> Print / Save as PDF</Button>
      </div>

      <div className="rounded-2xl border bg-card p-8 shadow-soft print:border-0 print:shadow-none">
        <header className="mb-6 flex items-end justify-between border-b pb-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-primary">NGF Futures Lab — State Report</div>
            <h2 className="mt-1 font-display text-3xl">{state?.name ?? code}</h2>
            <p className="text-sm text-muted-foreground">{state?.capital ?? "—"} · Zone {state?.zone_code ?? "—"} · {state?.population_millions ?? "—"}M residents</p>
            <p className="mt-2 text-xs text-muted-foreground">Generated {new Date().toLocaleDateString()}</p>
          </div>
          {latest && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current SNRI</div>
              <div className="font-display text-5xl text-primary tabular-nums">{Number(latest.resilience_index).toFixed(1)}</div>
            </div>
          )}
        </header>

        <section className="mb-8 grid gap-6 md:grid-cols-2 break-inside-avoid">
          <div>
            <h3 className="mb-3 font-display text-lg">Resilience profile</h3>
            <div className="h-[260px]">
              <ResponsiveContainer>
                <RadarChart data={radar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dim" fontSize={10} />
                  <PolarRadiusAxis domain={[0, 100]} fontSize={9} />
                  <Radar dataKey="value" stroke="oklch(0.45 0.13 155)" fill="oklch(0.45 0.13 155 / 0.3)" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-display text-lg">SNRI trajectory</h3>
            <div className="h-[260px]">
              <ResponsiveContainer>
                <LineChart data={trajectory}>
                  <XAxis dataKey="cycle" fontSize={10} />
                  <YAxis domain={[0, 100]} fontSize={10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="snri" stroke="oklch(0.45 0.13 155)" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mb-8 break-inside-avoid">
          <h3 className="mb-3 font-display text-lg">Dimension scores</h3>
          <div className="grid grid-cols-4 gap-3">
            {latest && DIMS.map((d) => (
              <div key={d.key} className="rounded border p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.label}</div>
                <div className="font-display text-xl tabular-nums">{Number(latest[d.key] ?? 0).toFixed(0)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="break-inside-avoid">
          <h3 className="mb-3 font-display text-lg">Commitments ({commitments.length})</h3>
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">Title</th><th>Status</th><th>Progress</th><th>Due</th></tr>
            </thead>
            <tbody>
              {commitments.slice(0, 12).map((c: any) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2">{c.title}</td>
                  <td>{c.status}</td>
                  <td>{c.progress}%</td>
                  <td>{c.target_date ?? "—"}</td>
                </tr>
              ))}
              {!commitments.length && <tr><td colSpan={4} className="py-3 text-center text-muted-foreground">No commitments recorded.</td></tr>}
            </tbody>
          </table>
        </section>

        <footer className="mt-8 border-t pt-4 text-[10px] text-muted-foreground">
          Confidential — Prepared by the NGF Futures Lab for the Office of the Governor of {state?.name ?? code}.
        </footer>
      </div>
    </div>
  );
}
