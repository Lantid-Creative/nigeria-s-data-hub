import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, BarChart3, Brain, FlaskConical, Globe2, ShieldCheck, Sparkles,
  TrendingUp, Users, HeartPulse, Leaf, GraduationCap, Wheat, Banknote,
  Cpu, Telescope, Lightbulb, FileText, Activity, Building2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "NGF Futures Lab — Anticipatory Governance for Nigeria's States" },
      { name: "description", content: "The NGF Futures Lab is the data, foresight and innovation engine of the Nigeria Governors' Forum — measuring sub-national resilience and shaping the next decade of state governance." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Hero />
      <PulseStrip />
      <WhatIsLab />
      <Pillars />
      <HowItWorks />
      <ThematicCoverage />
      <SnriExplainer />
      <ResearchInnovation />
      <ForStates />
      <Partners />
      <Footer />
    </div>
  );
}

/* ------------------------------ Top nav ------------------------------ */
function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md gradient-gold">
            <Sparkles className="h-5 w-5 text-gold-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base text-foreground">NGF Futures Lab</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Nigeria Governors' Forum</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#about" className="hover:text-foreground">About</a>
          <a href="#pillars" className="hover:text-foreground">Pillars</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#themes" className="hover:text-foreground">Coverage</a>
          <Link to="/research" className="hover:text-foreground">Research</Link>
          <Link to="/press" className="hover:text-foreground">Press</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-primary">
            <Link to="/login">State Login <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------- Hero ------------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary/30">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%), radial-gradient(40% 40% at 95% 90%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-soft backdrop-blur">
            <Activity className="h-3.5 w-3.5 text-primary" />
            The intelligence engine of the NGF
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
            From crisis response to{" "}
            <span className="italic text-primary">anticipatory governance</span> across Nigeria's 36 states + FCT.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            The NGF Futures Lab is where sub-national data, strategic foresight and
            policy innovation meet — built with state governments, anchored at the
            NGF Secretariat.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-primary">
              <Link to="/login">State Login <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#about">Explore the Lab</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Restricted access · credentials issued by the NGF Secretariat
          </p>
        </div>

        {/* Hero illustration: stylised Nigeria + data constellation */}
        <div className="relative">
          <NigeriaConstellation />
        </div>
      </div>
    </section>
  );
}

function NigeriaConstellation() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-lg">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-gold/10" />
      <svg viewBox="0 0 500 400" className="relative h-full w-full">
        <defs>
          <linearGradient id="hLine" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.45 0.13 155)" stopOpacity="0.8" />
            <stop offset="1" stopColor="oklch(0.78 0.16 80)" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Stylised Nigeria silhouette — abstract polygon */}
        <path
          d="M90,140 L150,90 L250,80 L340,95 L410,140 L420,210 L380,290 L300,330 L210,335 L130,300 L80,230 Z"
          fill="oklch(0.45 0.13 155 / 0.08)"
          stroke="oklch(0.45 0.13 155 / 0.4)"
          strokeWidth="1.5"
        />

        {/* Six geo-political zone nodes */}
        {[
          { x: 140, y: 180, l: "NW" },
          { x: 250, y: 140, l: "NC" },
          { x: 360, y: 170, l: "NE" },
          { x: 170, y: 270, l: "SW" },
          { x: 270, y: 290, l: "SS" },
          { x: 360, y: 270, l: "SE" },
        ].map((n) => (
          <g key={n.l}>
            <circle cx={n.x} cy={n.y} r="22" fill="oklch(0.45 0.13 155 / 0.1)" />
            <circle cx={n.x} cy={n.y} r="10" fill="oklch(0.45 0.13 155)" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">{n.l}</text>
          </g>
        ))}

        {/* Connections */}
        {[
          [140,180,250,140],[250,140,360,170],[140,180,170,270],
          [250,140,270,290],[360,170,360,270],[170,270,270,290],
          [270,290,360,270],
        ].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#hLine)" strokeWidth="1.2" />
        ))}

        {/* Floating data card */}
        <g transform="translate(340,40)">
          <rect width="140" height="70" rx="10" fill="white" stroke="oklch(0.45 0.13 155 / 0.2)" />
          <text x="12" y="22" fontSize="9" fill="oklch(0.55 0 0)" fontWeight="600" letterSpacing="1">SNRI · NATIONAL</text>
          <text x="12" y="48" fontSize="22" fontFamily="serif" fill="oklch(0.45 0.13 155)">64.2</text>
          <polyline points="80,55 92,48 104,52 116,40 128,44" fill="none" stroke="oklch(0.78 0.16 80)" strokeWidth="2" />
        </g>

        {/* Floating mini bars */}
        <g transform="translate(30,310)">
          <rect width="140" height="70" rx="10" fill="white" stroke="oklch(0.45 0.13 155 / 0.2)" />
          <text x="12" y="22" fontSize="9" fill="oklch(0.55 0 0)" fontWeight="600" letterSpacing="1">REPORTING CYCLE</text>
          {[18,28,14,32,22,26,20].map((h,i)=>(
            <rect key={i} x={12+i*18} y={60-h} width="12" height={h} rx="2" fill="oklch(0.78 0.16 80)" />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ----------------------------- Pulse strip --------------------------- */
function PulseStrip() {
  const items = [
    { v: "36+1", l: "States + FCT" },
    { v: "6", l: "Geo-political zones" },
    { v: "12", l: "Resilience indicators" },
    { v: "4", l: "Lab pillars" },
  ];
  return (
    <section className="border-y bg-background py-6">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4 md:px-8">
        {items.map((s) => (
          <div key={s.l} className="flex items-baseline gap-3">
            <div className="font-display text-3xl text-primary">{s.v}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- What is the Lab ------------------------- */
function WhatIsLab() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">What is the Futures Lab</span>
          <h2 className="mt-2 font-display text-3xl md:text-5xl leading-tight">
            A new operating system for sub-national governance.
          </h2>
          <p className="mt-6 text-muted-foreground md:text-lg">
            The NGF Futures Lab is the Secretariat's intelligence arm. It brings
            together state-reported data, advanced analytics, scenario modelling
            and applied research into a single environment — so that governors,
            commissioners and PRS units can move from reacting to events to
            shaping the next decade.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "A shared evidence base across all 36 states",
              "Foresight tools embedded in budget and planning cycles",
              "Innovation pilots that travel between states",
              "Capacity building for state analytical units",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span className="text-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Editorial geometric illustration */}
        <div className="relative">
          <svg viewBox="0 0 500 420" className="h-auto w-full">
            <rect x="40" y="40" width="420" height="340" rx="16" fill="oklch(0.45 0.13 155 / 0.05)" />
            <circle cx="250" cy="210" r="120" fill="none" stroke="oklch(0.45 0.13 155 / 0.25)" strokeDasharray="3 5" />
            <circle cx="250" cy="210" r="80" fill="none" stroke="oklch(0.45 0.13 155 / 0.35)" />
            <circle cx="250" cy="210" r="40" fill="oklch(0.45 0.13 155)" />
            <text x="250" y="215" textAnchor="middle" fontSize="14" fill="white" fontFamily="serif">LAB</text>
            {[
              { x: 250, y: 90, l: "Data" },
              { x: 370, y: 210, l: "Foresight" },
              { x: 250, y: 330, l: "Innovation" },
              { x: 130, y: 210, l: "Capacity" },
            ].map((n) => (
              <g key={n.l}>
                <circle cx={n.x} cy={n.y} r="34" fill="white" stroke="oklch(0.78 0.16 80)" strokeWidth="2" />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fill="oklch(0.45 0.13 155)" fontWeight="600">{n.l}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Pillars ------------------------------ */
function Pillars() {
  const items = [
    { i: BarChart3, t: "Measure", d: "Sub-National Resilience Index, sectoral KPIs and a unified data layer across 36 states.",
      svg: (
        <svg viewBox="0 0 120 80" className="h-16 w-full">
          {[24,38,18,46,30,42].map((h,i)=>(
            <rect key={i} x={10+i*18} y={70-h} width="12" height={h} rx="2" fill="oklch(0.45 0.13 155)" opacity={0.4 + i*0.1} />
          ))}
        </svg>
      )},
    { i: Brain, t: "Analyse", d: "Comparative analytics, peer benchmarking and AI-generated insights for policy makers.",
      svg: (
        <svg viewBox="0 0 120 80" className="h-16 w-full">
          <polyline points="10,60 30,48 50,52 70,30 90,38 110,18" fill="none" stroke="oklch(0.45 0.13 155)" strokeWidth="2.5" />
          {[[10,60],[30,48],[50,52],[70,30],[90,38],[110,18]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="3.5" fill="oklch(0.78 0.16 80)" />
          ))}
        </svg>
      )},
    { i: Telescope, t: "Foresee", d: "Scenario planning to 2032, early-warning alerts and predictive risk modelling.",
      svg: (
        <svg viewBox="0 0 120 80" className="h-16 w-full">
          <path d="M10,60 Q40,55 60,45 T110,15" fill="none" stroke="oklch(0.45 0.13 155)" strokeWidth="2" />
          <path d="M10,60 Q40,50 60,35 T110,5" fill="none" stroke="oklch(0.78 0.16 80)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M10,60 Q40,58 60,55 T110,40" fill="none" stroke="oklch(0.45 0.13 155 / 0.4)" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )},
    { i: Lightbulb, t: "Innovate", d: "Living Labs, applied research and innovation pilots that travel between states.",
      svg: (
        <svg viewBox="0 0 120 80" className="h-16 w-full">
          {[[30,40],[60,25],[90,45],[60,55]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="10" fill="none" stroke="oklch(0.45 0.13 155)" strokeWidth="1.5" />
          ))}
          <circle cx="60" cy="40" r="5" fill="oklch(0.78 0.16 80)" />
        </svg>
      )},
  ];
  return (
    <section id="pillars" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Four Pillars</span>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">
            Measure. Analyse. Foresee. Innovate.
          </h2>
          <p className="mt-3 text-muted-foreground">
            The Lab is structured around four reinforcing pillars — each one
            answering a different question states ask about their future.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <Card key={p.t} className="group relative overflow-hidden shadow-soft transition hover:shadow-elevated">
              <div className="absolute inset-x-0 top-0 h-1 gradient-gold opacity-0 transition group-hover:opacity-100" />
              <CardContent className="p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <p.i className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl">{p.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
                <div className="mt-4 rounded-md bg-secondary/60 p-3">{p.svg}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- How it works --------------------------- */
function HowItWorks() {
  const steps = [
    {
      n: "01", t: "States Report",
      d: "PRS units submit periodic survey instruments through their secure state workspace. Validation, attachments and audit trail built in.",
      svg: (
        <svg viewBox="0 0 200 140" className="h-32 w-full">
          <rect x="20" y="20" width="100" height="100" rx="8" fill="white" stroke="oklch(0.45 0.13 155 / 0.3)" />
          {[35,55,75,95].map((y,i)=>(
            <g key={i}>
              <rect x="32" y={y} width="60" height="6" rx="2" fill="oklch(0.45 0.13 155 / 0.15)" />
              <circle cx="105" cy={y+3} r="4" fill={i<2?"oklch(0.78 0.16 80)":"oklch(0.45 0.13 155 / 0.2)"} />
            </g>
          ))}
          <path d="M130,70 L170,70" stroke="oklch(0.45 0.13 155)" strokeWidth="1.5" markerEnd="url(#arr1)" />
          <defs><marker id="arr1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L6,4 L0,8 Z" fill="oklch(0.45 0.13 155)" /></marker></defs>
        </svg>
      ),
    },
    {
      n: "02", t: "Lab Analyses",
      d: "Data flows into the NGF Command Centre. Analysts, models and AI work together — comparing states, scoring resilience, surfacing anomalies.",
      svg: (
        <svg viewBox="0 0 200 140" className="h-32 w-full">
          <circle cx="100" cy="70" r="50" fill="oklch(0.45 0.13 155 / 0.08)" stroke="oklch(0.45 0.13 155 / 0.3)" strokeDasharray="3 3" />
          <circle cx="100" cy="70" r="22" fill="oklch(0.45 0.13 155)" />
          <text x="100" y="74" textAnchor="middle" fontSize="10" fill="white" fontWeight="600">SNRI</text>
          {[[60,30],[140,30],[40,90],[160,90],[100,130]].map(([x,y],i)=>(
            <g key={i}>
              <line x1="100" y1="70" x2={x} y2={y} stroke="oklch(0.78 0.16 80)" strokeWidth="1" />
              <circle cx={x} cy={y} r="6" fill="oklch(0.78 0.16 80)" />
            </g>
          ))}
        </svg>
      ),
    },
    {
      n: "03", t: "Insights Return",
      d: "Briefs, dashboards, alerts and policy recommendations flow back to governors and state PRS teams — closing the loop.",
      svg: (
        <svg viewBox="0 0 200 140" className="h-32 w-full">
          <rect x="60" y="20" width="120" height="100" rx="8" fill="white" stroke="oklch(0.45 0.13 155 / 0.3)" />
          <rect x="72" y="32" width="60" height="6" rx="2" fill="oklch(0.45 0.13 155)" />
          <rect x="72" y="46" width="90" height="4" rx="2" fill="oklch(0.45 0.13 155 / 0.2)" />
          <rect x="72" y="56" width="80" height="4" rx="2" fill="oklch(0.45 0.13 155 / 0.2)" />
          <polyline points="72,100 92,88 112,92 132,75 152,82 168,68" fill="none" stroke="oklch(0.78 0.16 80)" strokeWidth="2" />
          <path d="M50,70 L20,70" stroke="oklch(0.45 0.13 155)" strokeWidth="1.5" markerEnd="url(#arr2)" />
          <defs><marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L6,4 L0,8 Z" fill="oklch(0.45 0.13 155)" /></marker></defs>
        </svg>
      ),
    },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">How it works</span>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">
          A continuous loop between states and the Secretariat.
        </h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <Card key={s.n} className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl text-gold">{s.n}</span>
                <h3 className="font-display text-xl">{s.t}</h3>
              </div>
              <div className="mt-4 rounded-md bg-secondary/40 p-3">{s.svg}</div>
              <p className="mt-4 text-sm text-muted-foreground">{s.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Thematic coverage ----------------------- */
function ThematicCoverage() {
  const themes = [
    { i: Banknote, t: "Fiscal Health", d: "IGR, debt, expenditure quality" },
    { i: Users, t: "Human Capital", d: "Labour, skills, demographics" },
    { i: HeartPulse, t: "Health", d: "Service delivery & outcomes" },
    { i: GraduationCap, t: "Education", d: "Access, learning, financing" },
    { i: Wheat, t: "Agriculture", d: "Productivity & food security" },
    { i: Leaf, t: "Climate", d: "Risk, adaptation, transition" },
    { i: ShieldCheck, t: "Security", d: "Stability & social cohesion" },
    { i: Cpu, t: "Digital & Innovation", d: "Connectivity, e-gov, startups" },
  ];
  return (
    <section id="themes" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Coverage</span>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Eight themes. One coherent picture.</h2>
          <p className="mt-3 text-muted-foreground">
            The Lab tracks the full spectrum of sub-national resilience — from
            today's fiscal pressures to tomorrow's climate and digital transitions.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {themes.map((th) => (
            <div key={th.t} className="group flex items-start gap-3 rounded-lg border bg-background p-4 shadow-soft transition hover:border-primary/40 hover:shadow-elevated">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <th.i className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{th.t}</div>
                <div className="text-xs text-muted-foreground">{th.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- SNRI explainer -------------------------- */
function SnriExplainer() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <svg viewBox="0 0 500 380" className="h-auto w-full">
            <rect x="20" y="20" width="460" height="340" rx="16" fill="oklch(0.45 0.13 155 / 0.04)" />

            {/* Inputs column */}
            <text x="60" y="55" fontSize="11" fill="oklch(0.55 0 0)" fontWeight="600" letterSpacing="1">INPUTS</text>
            {["Fiscal","Human Capital","Health","Education","Climate","Security"].map((l,i)=>(
              <g key={l} transform={`translate(40,${75+i*38})`}>
                <rect width="120" height="28" rx="6" fill="white" stroke="oklch(0.45 0.13 155 / 0.25)" />
                <text x="12" y="18" fontSize="11" fill="oklch(0.3 0 0)">{l}</text>
                <line x1="120" y1="14" x2="200" y2="14" stroke="oklch(0.45 0.13 155 / 0.4)" strokeDasharray="2 3" />
              </g>
            ))}

            {/* Engine */}
            <g transform="translate(220,150)">
              <circle r="58" fill="oklch(0.45 0.13 155 / 0.1)" />
              <circle r="40" fill="oklch(0.45 0.13 155)" />
              <text textAnchor="middle" y="-2" fontSize="11" fill="white" fontWeight="600">Weighted</text>
              <text textAnchor="middle" y="14" fontSize="11" fill="white" fontWeight="600">Index</text>
            </g>

            {/* Output */}
            <text x="380" y="55" fontSize="11" fill="oklch(0.55 0 0)" fontWeight="600" letterSpacing="1">OUTPUT</text>
            <g transform="translate(340,110)">
              <rect width="130" height="180" rx="10" fill="white" stroke="oklch(0.78 0.16 80)" strokeWidth="2" />
              <text x="14" y="28" fontSize="10" fill="oklch(0.55 0 0)" fontWeight="600" letterSpacing="1">SNRI SCORE</text>
              <text x="14" y="72" fontSize="36" fill="oklch(0.45 0.13 155)" fontFamily="serif">A−</text>
              <rect x="14" y="90" width="100" height="6" rx="3" fill="oklch(0.45 0.13 155 / 0.15)" />
              <rect x="14" y="90" width="78" height="6" rx="3" fill="oklch(0.45 0.13 155)" />
              <text x="14" y="118" fontSize="10" fill="oklch(0.55 0 0)">Resilient · Improving</text>
              <line x1="14" y1="135" x2="116" y2="135" stroke="oklch(0.45 0.13 155 / 0.1)" />
              <text x="14" y="155" fontSize="9" fill="oklch(0.55 0 0)">Peer rank: 7 / 36</text>
              <text x="14" y="170" fontSize="9" fill="oklch(0.55 0 0)">Trend: ▲ +3.2 YoY</text>
            </g>

            {/* Arrow engine → output */}
            <line x1="280" y1="150" x2="335" y2="150" stroke="oklch(0.45 0.13 155)" strokeWidth="1.5" markerEnd="url(#arr3)" />
            <defs><marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L6,4 L0,8 Z" fill="oklch(0.45 0.13 155)" /></marker></defs>
          </svg>
        </div>
        <div className="order-1 lg:order-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Featured Instrument</span>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">
            The Sub-National Resilience Index.
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            The SNRI is the Lab's flagship composite measure — bringing together
            fiscal, human, environmental and institutional dimensions into a single
            comparable score for every Nigerian state.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Twelve weighted indicators across six dimensions",
              "Updated each reporting cycle from state submissions",
              "Letter grade, peer rank and year-on-year trend",
              "Drill-down to underlying drivers and gaps",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- Research & Innovation --------------------- */
function ResearchInnovation() {
  return (
    <section id="research" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Research & Innovation</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              A working lab, not a static report.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Active research streams and Living Labs translate evidence into
              experiments — and experiments into scalable policy.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { i: FlaskConical, tag: "Research Stream", t: "Sub-national fiscal frontiers",
              d: "Mapping IGR ceilings and debt sustainability paths across the 36 states." },
            { i: Lightbulb, tag: "Living Lab", t: "Climate-smart agriculture pilot",
              d: "Co-designed with three pilot states to test adaptive farming protocols." },
            { i: Telescope, tag: "Foresight Study", t: "Nigeria 2032 scenarios",
              d: "Four plausible futures for sub-national governance over the next decade." },
          ].map((c) => (
            <Card key={c.t} className="overflow-hidden shadow-soft">
              <div className="h-32 bg-gradient-to-br from-primary/15 via-primary/5 to-gold/15" />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <c.i className="h-3.5 w-3.5" /> {c.tag}
                </div>
                <h3 className="mt-3 font-display text-lg">{c.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- For states ---------------------------- */
function ForStates() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">For State Governments</span>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">
            Your state, in the national picture.
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            A dedicated workspace for your PRS unit — submit reporting cycles, see
            your dashboard, benchmark against peers, and tap into the Lab's
            knowledge base. Your data is yours; aggregated views power the
            national picture.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { i: FileText, t: "Survey Engine", d: "Structured submission with validation" },
              { i: TrendingUp, t: "Your Dashboard", d: "State-only view of indicators" },
              { i: Users, t: "Peer Benchmark", d: "Compare with similar states" },
              { i: Building2, t: "Knowledge Hub", d: "Briefs, models, playbooks" },
            ].map((b) => (
              <div key={b.t} className="flex gap-3 rounded-lg border p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                  <b.i className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{b.t}</div>
                  <div className="text-xs text-muted-foreground">{b.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-primary">
              <Link to="/login">Sign in to your state workspace <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>

        {/* Workspace mock illustration */}
        <Card className="overflow-hidden border-0 shadow-elevated">
          <div className="bg-sidebar p-2">
            <div className="flex gap-1.5 px-2 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-gold/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
          </div>
          <div className="grid grid-cols-12 bg-card">
            <div className="col-span-4 border-r bg-sidebar p-3 text-xs text-sidebar-foreground/80">
              <div className="mb-3 text-[10px] uppercase tracking-wider opacity-60">State Workspace</div>
              {["Dashboard","Surveys","State Profile","Indicators","Peer Benchmark","Knowledge"].map((n,i)=>(
                <div key={n} className={`rounded-md px-2 py-1.5 ${i===0?"bg-sidebar-accent text-sidebar-primary":""}`}>{n}</div>
              ))}
            </div>
            <div className="col-span-8 p-4">
              <div className="grid grid-cols-3 gap-2">
                {[{l:"Your SNRI",v:"B+"},{l:"Cycle",v:"Q2"},{l:"Peer Rank",v:"7/36"}].map(s=>(
                  <div key={s.l} className="rounded-md border bg-background p-3">
                    <div className="text-[10px] uppercase text-muted-foreground">{s.l}</div>
                    <div className="font-display text-xl">{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-md border bg-gradient-to-br from-primary/5 to-gold/10 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Indicator trend</div>
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
    </section>
  );
}

/* ----------------------------- Partners ------------------------------ */
function Partners() {
  return (
    <section id="partners" className="bg-primary py-20 text-primary-foreground">
      <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold">Anchored in Partnership</span>
        <h2 className="mt-3 font-display text-3xl md:text-5xl">
          Built by the NGF Secretariat. With the states. For Nigeria.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">
          The Futures Lab is anchored at the NGF Economic Intelligence Unit and
          delivered in partnership with development organisations and state PRS
          departments across all six geo-political zones.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["NGF Secretariat","Economic Intelligence Unit","State PRS Network","Development Partners"].map((p)=>(
            <div key={p} className="rounded-lg border border-white/15 bg-white/5 px-4 py-6 text-sm text-white/90">
              {p}
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Link to="/login">State Login <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Footer ------------------------------- */
function Footer() {
  return (
    <footer className="border-t bg-background py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md gradient-gold">
              <Sparkles className="h-5 w-5 text-gold-foreground" />
            </div>
            <div className="font-display">NGF Futures Lab</div>
          </div>
          <p className="mt-3 max-w-sm text-xs text-muted-foreground">
            The intelligence engine of the Nigeria Governors' Forum — measuring
            sub-national resilience and shaping the next decade of state governance.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground">Explore</div>
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <li><a href="#about" className="hover:text-foreground">About the Lab</a></li>
            <li><a href="#pillars" className="hover:text-foreground">Pillars</a></li>
            <li><a href="#how" className="hover:text-foreground">How it works</a></li>
            <li><a href="#research" className="hover:text-foreground">Research</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground">Access</div>
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">State Login</Link></li>
            <li>Credentials issued by NGF Secretariat</li>
            <li>Contact: lab@nggovernorsforum.org</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t px-4 pt-6 text-xs text-muted-foreground md:px-8">
        © 2026 Nigeria Governors' Forum Secretariat · NGF Futures Lab
      </div>
    </footer>
  );
}
