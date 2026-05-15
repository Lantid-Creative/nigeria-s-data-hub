import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero, PageShell } from "@/components/site/PageBits";
import { NigeriaMap } from "@/components/site/NigeriaMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Banknote,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Users,
  TrendingUp,
  Landmark,
  HandHeart,
  Eye,
  Shield,
  RefreshCw,
  Sparkles,
  Compass,
} from "lucide-react";

export const Route = createFileRoute("/snri")({
  component: SnriPage,
  head: () => ({
    meta: [
      { title: "SNRi — Sub-National Resilience Index | NGF Futures Lab" },
      {
        name: "description",
        content:
          "The Sub-National Resilience Index (SNRi) measures the resilience capacity of Nigeria's 36 states across 7 dimensions and 48 indicators — the first composite index purpose-built for the Nigerian subnational context.",
      },
      { property: "og:title", content: "Sub-National Resilience Index (SNRi) — NGF Futures Lab" },
      {
        property: "og:description",
        content:
          "Seven dimensions. Forty-eight indicators. A diagnostic, prognostic and prescriptive measure of state resilience across Nigeria.",
      },
      { property: "og:url", content: "https://myadam.online/snri" },
      { property: "og:image", content: "https://myadam.online/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://myadam.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://myadam.online/snri" }],
  }),
});

const DIMS = [
  {
    i: TrendingUp,
    t: "Economic Resilience",
    n: 7,
    d: "Market size, sectoral diversification, price stability, labour utilisation, private sector vibrancy and household welfare.",
  },
  {
    i: Banknote,
    t: "Fiscal Resilience",
    n: 7,
    d: "Revenue autonomy, FAAC dependency, budget execution, operating expenditure ratios and debt-service burdens.",
  },
  {
    i: HeartPulse,
    t: "Human Capital Resilience",
    n: 8,
    d: "Health workforce density, infrastructure, insurance coverage, education quality and educational inclusivity.",
  },
  {
    i: Leaf,
    t: "Climate & Environmental Resilience",
    n: 6,
    d: "Flood exposure, environmental degradation, WASH access, climate budgeting and disaster preparedness.",
  },
  {
    i: Landmark,
    t: "Governance & Institutional Resilience",
    n: 6,
    d: "Public financial management, audit accountability, digital governance readiness and procurement efficiency.",
  },
  {
    i: ShieldCheck,
    t: "Security Resilience",
    n: 7,
    d: "Conflict intensity, displacement, communal violence, policing capacity and GBV response mechanisms.",
  },
  {
    i: Users,
    t: "Social Resilience",
    n: 7,
    d: "Interpersonal and institutional trust, identity attachment, equality and associational participation.",
  },
];

const CAPACITIES = [
  { i: Eye, t: "Anticipatory", d: "Foresee and prepare for risks — early warning, contingency budgets, scenario planning." },
  { i: Shield, t: "Absorptive", d: "Withstand shocks without structural collapse via fiscal buffers and robust services." },
  { i: Compass, t: "Adaptive", d: "Adjust strategies, institutions and resource allocations during ongoing stress." },
  { i: RefreshCw, t: "Recovery", d: "Return to prior levels of functioning after a shock — reconstruction and continuity." },
  { i: Sparkles, t: "Transformative", d: "Use disruption as a catalyst for structural reform and institutional modernisation." },
];

function SnriPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageShell>
        <PageHero
          eyebrow="Flagship Instrument"
          title="The Sub-National Resilience Index."
          lede="Initiated by the NGF Secretariat's Economic Intelligence Unit, the SNRi is the first composite resilience index purpose-built for the Nigerian subnational context — measuring the capacity of each state to anticipate, withstand, adapt to, recover from and transform through shocks."
        >
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-primary">
              <Link to="/methodology">
                Read methodology <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/states">View states</Link>
            </Button>
          </div>
        </PageHero>

        {/* Definition */}
        <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Definition</span>
          <h2 className="mt-3 font-display text-2xl md:text-3xl">
            Resilience as capacity, not the absence of fragility.
          </h2>
          <p className="mt-4 text-muted-foreground">
            State resilience is the capacity of a subnational government and its population to{" "}
            <span className="text-foreground">anticipate, withstand, adapt to, and recover from</span>{" "}
            multifaceted shocks and chronic stresses, while simultaneously pursuing positive transformation and
            sustainable development. The SNRi measures the <em>stock</em> of these capacities — the structural
            conditions that determine how well a state can navigate future shocks — rather than performance during
            any single event.
          </p>
        </section>

        {/* Five capacities */}
        <section className="border-y bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Conceptual foundation
              </span>
              <h2 className="mt-3 font-display text-2xl md:text-3xl">Five complementary capacities.</h2>
              <p className="mt-3 text-muted-foreground">
                Synthesising Briguglio et al. (2009), the IPCC AR5 framework and the post-COVID resilience
                literature, the SNRi operationalises resilience through five distinct capacities.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {CAPACITIES.map((c) => (
                <Card key={c.t} className="shadow-soft">
                  <CardContent className="p-5">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                      <c.i className="h-5 w-5" />
                    </div>
                    <div className="mt-3 font-display text-base">{c.t}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Dimensions + map */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Dimensional architecture
              </span>
              <h2 className="mt-3 font-display text-2xl md:text-3xl">Seven dimensions. Forty-eight indicators.</h2>
              <p className="mt-3 text-muted-foreground">
                Each dimension is internally organised on a dual axis — <strong>Risk / Exposure</strong> and{" "}
                <strong>Coping / Adaptive Capacity</strong> — following the OECD <em>States of Fragility</em> and
                INFORM Risk approaches. Indicators are treated as <em>formative</em> constructs: non-substitutable
                contributors to resilience rather than interchangeable reflections of it.
              </p>
              <div className="mt-8 grid gap-3">
                {DIMS.map((d) => (
                  <Card key={d.t} className="shadow-soft">
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                        <d.i className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold">{d.t}</div>
                          <span className="text-xs text-muted-foreground">{d.n} indicators</span>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{d.d}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border bg-card p-6 shadow-soft">
                <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  National view · zonal scores (illustrative)
                </div>
                <NigeriaMap
                  className="h-auto w-full"
                  ariaLabel="Map of Nigeria's six geo-political zones with illustrative SNRi scores"
                />
                <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-muted-foreground">
                  {[18, 30, 45, 65, 85].map((p, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="h-1.5 w-full rounded"
                        style={{ background: `oklch(0.45 0.13 155 / ${p / 100})` }}
                      />
                      <span>{p < 30 ? "Lower" : p > 70 ? "Higher" : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Card className="mt-4 shadow-soft">
                <CardContent className="p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <HandHeart className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-display text-base">From measurement to intervention</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The SNRi supports a three-stage analytical pathway: <strong>diagnostic</strong> (current
                    resilience profile), <strong>prognostic</strong> (scenario projections under varying policy and
                    shock assumptions), and <strong>prescriptive</strong> (translating vulnerabilities into
                    actionable policy recommendations for governors and partners).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Methodology strip */}
        <section className="border-t bg-secondary/30">
          <div className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-20">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Methodology</span>
            <h2 className="mt-3 font-display text-2xl md:text-3xl">
              Built to the JRC-OECD standard for composite indicators.
            </h2>
            <p className="mt-4 text-muted-foreground">
              The SNRi follows the JRC-OECD <em>Handbook on Constructing Composite Indicators</em> (2008) — the
              same ten-step framework used by the Human Development Index, the Ibrahim Index of African Governance,
              the INFORM Risk Index and the ND-GAIN Country Index. Indicators are selected on three conjunctive
              criteria: theoretical relevance in peer-reviewed literature, data availability for all 36 states, and
              precedent in at least one established composite index.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link to="/methodology">
                  See the full methodology <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </PageShell>
      <SiteFooter />
    </div>
  );
}
