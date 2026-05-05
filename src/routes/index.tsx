import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, BarChart3, Brain, FlaskConical, Globe2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

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

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 gradient-radial-gold" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Strategic foresight for Nigeria's 36 states
              </span>
              <h1 className="mt-5 font-display text-4xl leading-[1.05] text-balance md:text-6xl">
                Anticipatory governance.<br />
                <span className="text-gold">Data-driven futures.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
                The intelligence platform powering the NGF Futures Lab — where Nigeria's
                sub-national governments diagnose risk, plan for the future, and turn
                evidence into policy that works.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                  <Link to="/ngf">Enter NGF Command Centre <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15">
                  <Link to="/state">State Government Portal</Link>
                </Button>
              </div>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-6">
                {[
                  { v: "36", l: "States covered" },
                  { v: "220M+", l: "Citizens" },
                  { v: "40%", l: "Of public spend" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-3xl text-gold">{s.v}</div>
                    <div className="text-xs uppercase tracking-wider text-white/60">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating preview */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gold/20 blur-2xl" />
                <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between text-xs text-white/70">
                      <span>Sub-National Resilience Index</span>
                      <span className="rounded-full bg-gold/20 px-2 py-0.5 text-gold">Live</span>
                    </div>
                    <div className="font-display text-5xl text-white">64.2</div>
                    <div className="mt-1 text-xs text-[color:var(--success)]">+2.1 vs Q4 2025</div>

                    <div className="mt-5 space-y-3">
                      {[
                        { l: "Fiscal", v: 68, c: "bg-gold" },
                        { l: "Human Capital", v: 62, c: "bg-[color:var(--info)]" },
                        { l: "Climate", v: 51, c: "bg-destructive" },
                        { l: "Innovation", v: 55, c: "bg-emerald-400" },
                      ].map((r) => (
                        <div key={r.l}>
                          <div className="mb-1 flex justify-between text-[11px] text-white/70">
                            <span>{r.l}</span><span>{r.v}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className={`h-full rounded-full ${r.c}`} style={{ width: `${r.v}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-wider text-white/60">
                      <div className="rounded-md border border-white/10 py-2">36 / 36 states</div>
                      <div className="rounded-md border border-white/10 py-2">12 indicators</div>
                      <div className="rounded-md border border-white/10 py-2">Quarterly</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
