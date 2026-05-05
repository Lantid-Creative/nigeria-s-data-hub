import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero, PageShell } from "@/components/site/PageBits";
import { NigeriaMap } from "@/components/site/NigeriaMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Banknote, HeartPulse, GraduationCap, Leaf, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/snri")({
  component: SnriPage,
  head: () => ({
    meta: [
      { title: "SNRI — Sub-National Resilience Index | NGF Futures Lab" },
      { name: "description", content: "The Sub-National Resilience Index measures Nigeria's 36 states and the FCT across 6 dimensions and 12 indicators. A single comparable score for every state." },
      { property: "og:title", content: "Sub-National Resilience Index — NGF Futures Lab" },
      { property: "og:description", content: "A single comparable score for every Nigerian state. Six dimensions, twelve indicators, updated each reporting cycle." },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
  }),
});

const DIMS = [
  { i: Banknote, t: "Fiscal Health", d: "IGR, debt sustainability, expenditure quality" },
  { i: Users, t: "Human Capital", d: "Labour markets, skills, demographics" },
  { i: HeartPulse, t: "Health", d: "Service delivery and outcomes" },
  { i: GraduationCap, t: "Education", d: "Access, learning and financing" },
  { i: Leaf, t: "Climate", d: "Risk, adaptation and transition" },
  { i: ShieldCheck, t: "Security", d: "Stability and social cohesion" },
];

function SnriPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageShell>
        <PageHero
          eyebrow="Featured Instrument"
          title="The Sub-National Resilience Index."
          lede="The SNRI is the Lab's flagship composite measure, bringing together fiscal, human, environmental and institutional dimensions into a single comparable score for every Nigerian state."
        >
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-primary"><Link to="/methodology">Read methodology <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
            <Button asChild variant="outline"><Link to="/states">View states</Link></Button>
          </div>
        </PageHero>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">Six dimensions. Twelve indicators.</h2>
              <p className="mt-3 text-muted-foreground">A balanced view of every state's near-term pressures and long-horizon resilience.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {DIMS.map((d) => (
                  <Card key={d.t} className="shadow-soft">
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><d.i className="h-5 w-5" /></div>
                      <div>
                        <div className="font-semibold">{d.t}</div>
                        <div className="text-xs text-muted-foreground">{d.d}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">National view · zonal scores (mock)</div>
              <NigeriaMap className="h-auto w-full" ariaLabel="Map of Nigeria's six geo-political zones with mock SNRI scores" />
              <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-muted-foreground">
                {[18,30,45,65,85].map((p, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="h-1.5 w-full rounded" style={{ background: `oklch(0.45 0.13 155 / ${p / 100})` }} />
                    <span>{p < 30 ? "Lower" : p > 70 ? "Higher" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </PageShell>
      <SiteFooter />
    </div>
  );
}
