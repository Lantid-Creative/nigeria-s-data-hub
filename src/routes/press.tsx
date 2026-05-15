import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Newspaper, Megaphone, Mic } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/press")({
  component: PressPage,
  head: () => ({
    meta: [
      { title: "Press & Announcements — NGF Futures Lab" },
      { name: "description", content: "Press releases, official announcements and media coverage from the NGF Futures Lab." },
      { property: "og:title", content: "Press & Announcements — NGF Futures Lab" },
      { property: "og:description", content: "Latest press releases and media from the Nigeria Governors' Forum Futures Lab." },
      { property: "og:url", content: "https://myadam.online/press" },
      { property: "og:image", content: "https://myadam.online/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://myadam.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://myadam.online/press" }],
  }),
});

const PRESS = [
  { type: "Release", icon: Megaphone, date: "12 Apr 2026",
    title: "NGF Futures Lab launches the 2026 State of Sub-National Resilience Report",
    summary: "The Lab today released its flagship annual report covering all 36 states and the FCT, with new metrics on climate adaptation and digital readiness." },
  { type: "Announcement", icon: Newspaper, date: "28 Mar 2026",
    title: "Three new states join the Climate-Smart Agriculture Living Lab",
    summary: "Following the success of Year 1, three additional state governments have joined the Lab's flagship pilot programme." },
  { type: "Media", icon: Mic, date: "14 Mar 2026",
    title: "Director General featured on policy roundtable: 'Anticipatory Governance for Africa'",
    summary: "The DG of the NGF Secretariat discussed the Futures Lab's approach to scenario-based planning at a continental forum." },
  { type: "Release", icon: Megaphone, date: "02 Mar 2026",
    title: "Sub-National Resilience Index v2 methodology published",
    summary: "An open methodology note on the revised SNRI framework, including weighting changes and new indicators." },
  { type: "Announcement", icon: Newspaper, date: "16 Feb 2026",
    title: "Q1 2026 reporting cycle now open for all 36 states + FCT",
    summary: "State PRS units can now access the Q1 survey instruments through their secure workspace." },
  { type: "Media", icon: Mic, date: "30 Jan 2026",
    title: "Lab analysis cited in national policy briefing on fiscal sustainability",
    summary: "Findings from the Sub-National Fiscal Frontiers paper informed a recent federal-level policy discussion." },
];

function PressPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="border-b bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Press Room</span>
          <h1 className="mt-2 font-display text-4xl md:text-5xl tracking-tight">
            News, releases and <span className="italic text-primary">announcements</span> from the Lab.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
            Official communications from the NGF Futures Lab — covering reports, partnerships, methodology updates and media coverage.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="space-y-5">
          {PRESS.map((p, i) => (
            <Card key={i} className="shadow-soft transition hover:shadow-elevated">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{p.type}</Badge>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {p.date}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg leading-snug">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  Read <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 border-primary/20 bg-primary/5 shadow-soft">
          <CardContent className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-xl">Media enquiries</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                For interviews, quotes or accreditation, contact the NGF Secretariat communications desk.
              </p>
            </div>
            <Button className="bg-primary">press@nggovernorsforum.org</Button>
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}

