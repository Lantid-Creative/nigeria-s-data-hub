import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, BarChart3, Brain, FlaskConical, Globe2, ShieldCheck, Sparkles, TrendingUp, Search, BarChart2, Users, HeartPulse, Leaf, GraduationCap, Wheat, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "NGF Futures Lab — Anticipatory Governance for Nigeria's States" },
      { name: "description", content: "Strategic foresight, sub-national resilience intelligence, and policy innovation for Nigeria's 36 state governments." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md gradient-gold">
              <Sparkles className="h-5 w-5 text-gold-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base text-foreground">NGF Futures Lab</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Nigeria Governors' Forum</div>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#pillars" className="hover:text-foreground">Pillars</a>
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#impact" className="hover:text-foreground">Impact</a>
            <a href="#partners" className="hover:text-foreground">Partners</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/state">State Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary">
              <Link to="/ngf">NGF Console <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — NDIP-inspired clean editorial */}
      <section className="relative overflow-hidden bg-secondary/30">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%), radial-gradient(40% 40% at 90% 100%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-16 text-center md:px-8 md:pt-28 md:pb-24">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-soft backdrop-blur">
            <Activity className="h-3.5 w-3.5 text-primary" />
            Real-time sub-national intelligence
          </span>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-foreground text-balance md:text-6xl lg:text-7xl">
            Nigeria's sub-national data,{" "}
            <span className="italic text-primary">made simple</span> to govern.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Ask questions in plain language and get instant charts, foresight and
            AI-powered analysis across all 36 states — fiscal health, human capital,
            climate risk, innovation and more.
          </p>

          <div className="mx-auto mt-10 max-w-2xl">
            <div className="group flex items-center gap-2 rounded-2xl border bg-background p-2 shadow-elevated focus-within:ring-2 focus-within:ring-primary/30">
              <Search className="ml-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ask a question about Nigeria's states…"
                className="h-11 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              />
              <Button asChild size="lg" className="bg-primary">
                <Link to="/ngf">
                  Ask Lab AI <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Or{" "}
              <Link to="/state" className="font-medium text-primary hover:underline">
                sign in as a State Government →
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Explore by topic
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                { i: BarChart2, l: "Fiscal" },
                { i: Users, l: "Human Capital" },
                { i: HeartPulse, l: "Health" },
                { i: Leaf, l: "Climate" },
                { i: GraduationCap, l: "Education" },
                { i: Wheat, l: "Agriculture" },
                { i: ShieldCheck, l: "Security" },
              ].map((t) => (
                <button
                  key={t.l}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-1.5 text-sm text-foreground shadow-soft transition hover:border-primary/40 hover:text-primary"
                >
                  <t.i className="h-3.5 w-3.5 text-primary" />
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-6 border-t pt-8 text-left">
            {[
              { v: "36", l: "States covered" },
              { v: "220M+", l: "Citizens" },
              { v: "12", l: "Resilience indicators" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl text-primary">{s.v}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Pillars */}
      <section id="pillars" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Four Pillars</span>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">From short-term crisis management to long-term anticipatory governance.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { i: BarChart3, t: "Futures Intelligence", d: "Diagnostics, indices and dashboards that make the invisible visible." },
            { i: Brain, t: "Strategic Foresight", d: "Scenario planning embedded in MTEFs, budgets and development plans." },
            { i: FlaskConical, t: "Innovation & Policy Labs", d: "Pilots, experiments and innovation dossiers with state PRS units." },
            { i: ShieldCheck, t: "Capacity & Partnerships", d: "Build analytical units, train officials, partner with UNDP and beyond." },
          ].map((p) => (
            <Card key={p.t} className="group relative overflow-hidden shadow-soft transition hover:shadow-elevated">
              <div className="absolute inset-x-0 top-0 h-1 gradient-gold opacity-0 transition group-hover:opacity-100" />
              <CardContent className="p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <p.i className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg">{p.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform preview */}
      <section id="platform" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">The Platform</span>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">One platform. Two perspectives. National impact.</h2>
              <p className="mt-4 text-muted-foreground">
                State governments capture, validate and submit data through their own
                workspace. The NGF Secretariat consolidates everything into a real-time
                command centre — analytics, foresight, research and reporting in one place.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  { i: Building2, t: "State Workspace", d: "Survey submission, validation queue, state-only dashboard, peer benchmarking." },
                  { i: Globe2, t: "NGF Command Centre", d: "National analytics, SNRI, scenario planning, research lab, reports & alerts." },
                  { i: TrendingUp, t: "Futures Intelligence", d: "Predictive models, early-warning signals, AI insights and policy briefs." },
                ].map((r) => (
                  <div key={r.t} className="flex gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <r.i className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{r.t}</div>
                      <div className="text-sm text-muted-foreground">{r.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <Button asChild className="bg-primary"><Link to="/ngf">Open NGF Console</Link></Button>
                <Button asChild variant="outline"><Link to="/state">Open State Portal</Link></Button>
              </div>
            </div>

            <Card className="overflow-hidden border-0 shadow-elevated">
              <div className="bg-sidebar p-2">
                <div className="flex gap-1.5 px-2 py-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-gold/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                </div>
              </div>
              <div className="grid grid-cols-12 bg-card">
                <div className="col-span-3 border-r bg-sidebar p-3 text-xs text-sidebar-foreground/80">
                  <div className="mb-3 text-[10px] uppercase tracking-wider opacity-60">NGF Console</div>
                  {["Overview", "Analytics", "States", "Foresight", "Research Lab", "Reports"].map((n, i) => (
                    <div key={n} className={`rounded-md px-2 py-1.5 ${i === 1 ? "bg-sidebar-accent text-sidebar-primary" : ""}`}>{n}</div>
                  ))}
                </div>
                <div className="col-span-9 p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[{l:"SNRI",v:"64.2"},{l:"States Reporting",v:"32/36"},{l:"Active Pilots",v:"18"}].map(s=>(
                      <div key={s.l} className="rounded-md border bg-background p-3">
                        <div className="text-[10px] uppercase text-muted-foreground">{s.l}</div>
                        <div className="font-display text-xl">{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 h-32 rounded-md border bg-gradient-to-br from-primary/5 to-gold/10 p-3">
                    <div className="text-[10px] uppercase text-muted-foreground">Resilience trend</div>
                    <svg viewBox="0 0 200 60" className="mt-1 h-20 w-full">
                      <path d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,24 L150,20 L175,16 L200,12"
                        stroke="oklch(0.45 0.13 155)" strokeWidth="2" fill="none" />
                      <path d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,24 L150,20 L175,16 L200,12 L200,60 L0,60 Z"
                        fill="oklch(0.45 0.13 155 / 0.15)" />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { v: "36", l: "State Futures Diagnostics by 2028" },
            { v: "1,500+", l: "Officials trained in foresight & analytics" },
            { v: "20", l: "Living Labs with active pilots" },
            { v: "$1.52M", l: "Total programme value" },
          ].map((s) => (
            <div key={s.l} className="border-l-2 border-gold pl-4">
              <div className="font-display text-4xl text-primary">{s.v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="partners" className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
          <h2 className="font-display text-3xl md:text-5xl">A flagship for sub-national anticipatory governance.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Built with state PRS units. Anchored at the NGF Secretariat's Economic
            Intelligence Unit. Partnered with UNDP and global foresight institutions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Link to="/ngf">Launch the Command Centre</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link to="/state">Sign in as a State</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground md:flex-row md:px-8">
          <div>© 2026 Nigeria Governors' Forum Secretariat. NGF Futures Lab.</div>
          <div>Anchored at the NGF Economic Intelligence Unit · In partnership with UNDP</div>
        </div>
      </footer>
    </div>
  );
}
