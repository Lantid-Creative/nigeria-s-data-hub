import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Sparkles, Search, FileText, FlaskConical, Telescope,
  Lightbulb, BookOpen, Download, Calendar, BarChart3,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
  head: () => ({
    meta: [
      { title: "Research & Reports — NGF Futures Lab" },
      { name: "description", content: "Working papers, foresight studies, policy briefs and Living Lab pilots from the NGF Futures Lab." },
      { property: "og:title", content: "Research & Reports — NGF Futures Lab" },
      { property: "og:description", content: "Browse the full catalogue of NGF Futures Lab research, reports and policy briefs." },
    ],
  }),
});

const CATEGORIES = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "report", label: "Flagship Reports", icon: FileText },
  { id: "brief", label: "Policy Briefs", icon: FileText },
  { id: "working", label: "Working Papers", icon: FlaskConical },
  { id: "foresight", label: "Foresight Studies", icon: Telescope },
  { id: "livinglab", label: "Living Labs", icon: Lightbulb },
  { id: "data", label: "Data Notes", icon: BarChart3 },
] as const;

type CatId = typeof CATEGORIES[number]["id"];

const RESEARCH: Array<{
  id: string;
  title: string;
  category: Exclude<CatId, "all">;
  date: string;
  summary: string;
  authors: string;
  pages: number;
}> = [
  { id: "snri-2026", title: "State of Sub-National Resilience 2026", category: "report", date: "Mar 2026",
    summary: "The flagship annual SNRI report — scoring all 36 states + FCT across fiscal, human and climate dimensions.",
    authors: "NGF Economic Intelligence Unit", pages: 124 },
  { id: "fiscal-frontiers", title: "Sub-National Fiscal Frontiers", category: "working", date: "Feb 2026",
    summary: "Mapping IGR ceilings, debt sustainability and expenditure quality across the 36 states + FCT.",
    authors: "Dr. A. Okonkwo, F. Bello", pages: 58 },
  { id: "nigeria-2032", title: "Nigeria 2032: Four Scenarios for Sub-National Governance", category: "foresight", date: "Jan 2026",
    summary: "A decade-out scenario set built with state PRS units and the Lab's foresight panel.",
    authors: "NGF Futures Lab", pages: 86 },
  { id: "csa-pilot", title: "Climate-Smart Agriculture Living Lab — Year 1 Findings",
    category: "livinglab", date: "Dec 2025",
    summary: "Co-designed pilot in three states testing adaptive farming protocols and yield outcomes.",
    authors: "Living Labs Team", pages: 42 },
  { id: "human-cap-brief", title: "Human Capital Pressure Points: A 37-State Snapshot",
    category: "brief", date: "Nov 2025",
    summary: "A short policy brief on labour, learning and demographic risks facing each state and the FCT.",
    authors: "EIU Analyst Pool", pages: 12 },
  { id: "health-spend", title: "Health Spending vs Outcomes — A Comparative Note",
    category: "data", date: "Oct 2025",
    summary: "Data note exploring the gap between per-capita health spend and outcome indicators.",
    authors: "Lab Data Desk", pages: 18 },
  { id: "security-foresight", title: "Security & Cohesion: Three Horizons to 2030",
    category: "foresight", date: "Sep 2025",
    summary: "Three-horizons foresight on stability, social cohesion and state response capacity.",
    authors: "Foresight Practice", pages: 64 },
  { id: "digital-states", title: "Digital States Index — Pilot Methodology",
    category: "working", date: "Aug 2025",
    summary: "A working paper proposing a sub-index for connectivity, e-government and innovation capacity.",
    authors: "Dr. K. Ibrahim", pages: 36 },
  { id: "edu-brief", title: "Out-of-School Children: A State-by-State Brief",
    category: "brief", date: "Jul 2025",
    summary: "Where the gaps are biggest and which interventions are showing measurable impact.",
    authors: "Lab Education Desk", pages: 14 },
];

function ResearchPage() {
  const [active, setActive] = useState<CatId>("all");
  const [q, setQ] = useState("");

  const list = RESEARCH.filter((r) =>
    (active === "all" || r.category === active) &&
    (q.trim() === "" || (r.title + r.summary + r.authors).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <section className="border-b bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Research Library</span>
          <h1 className="mt-2 font-display text-4xl md:text-5xl tracking-tight">
            Evidence for the next decade of <span className="italic text-primary">sub-national governance</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
            Flagship reports, foresight studies, policy briefs and Living Lab outputs — covering all 36 states and the FCT.
          </p>
          <div className="mt-8 flex max-w-xl items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search reports, authors, themes…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const isActive = active === c.id;
            return (
              <button key={c.id} onClick={() => setActive(c.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  isActive ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary"
                }`}>
                <c.icon className="h-3.5 w-3.5" /> {c.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <Card key={r.id} className="group flex flex-col overflow-hidden shadow-soft transition hover:shadow-elevated">
              <div className="h-32 bg-gradient-to-br from-primary/15 via-primary/5 to-gold/15" />
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    {CATEGORIES.find((c) => c.id === r.category)?.label}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {r.date}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg leading-snug">{r.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{r.summary}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{r.authors}</span>
                  <span>{r.pages} pp</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Read
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
              No research matches your search.
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* shared chrome — kept lightweight here to avoid a refactor */
function TopBar() {
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
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/research" activeProps={{ className: "text-foreground font-medium" }} className="hover:text-foreground">Research</Link>
          <Link to="/press" activeProps={{ className: "text-foreground font-medium" }} className="hover:text-foreground">Press</Link>
        </nav>
        <Button asChild size="sm" className="bg-primary">
          <Link to="/login">State Login <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-10 border-t bg-background py-10">
      <div className="mx-auto max-w-7xl px-4 text-xs text-muted-foreground md:px-8">
        © 2026 Nigeria Governors' Forum Secretariat · NGF Futures Lab
      </div>
    </footer>
  );
}
