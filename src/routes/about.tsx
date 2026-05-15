import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero, PageShell, Prose } from "@/components/site/PageBits";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — NGF Futures Lab" },
      { name: "description", content: "The NGF Futures Lab is the data, foresight and innovation engine of the Nigeria Governors' Forum, anchored at the Economic Intelligence Unit." },
      { property: "og:title", content: "About the NGF Futures Lab" },
      { property: "og:description", content: "Anticipatory governance for Nigeria's 36 states + FCT — data, foresight and innovation, anchored at the NGF Secretariat." },
      { property: "og:url", content: "https://myadam.online/about" },
      { property: "og:image", content: "https://myadam.online/og-image.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://myadam.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://myadam.online/about" }],
  }),
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageShell>
        <PageHero
          eyebrow="About"
          title={<>A new operating system for sub-national governance.</>}
          lede="The NGF Futures Lab is the intelligence arm of the Nigeria Governors' Forum Secretariat. We bring together state-reported data, advanced analytics, scenario modelling and applied research so that governors and PRS units can move from reacting to events to shaping the next decade."
        />
        <Prose>
          <h2>Mandate</h2>
          <p>
            Anchored at the NGF Economic Intelligence Unit, the Lab serves all 36 states and the FCT.
            Our mandate is to measure resilience, anticipate change, and translate evidence into
            policy that travels between states.
          </p>
          <h2>What we do</h2>
          <ul>
            <li>Maintain a shared evidence base across all 36 states + FCT.</li>
            <li>Embed foresight tools in state budget and planning cycles.</li>
            <li>Run innovation pilots through Living Labs that scale across the federation.</li>
            <li>Build the analytical capacity of state PRS departments.</li>
          </ul>
          <h2>How we are governed</h2>
          <p>
            The Lab is overseen by the NGF Secretariat and guided by a panel of state PRS leads,
            development partners and independent foresight practitioners. Editorial independence
            of research outputs is protected by published methodologies and peer review.
          </p>
        </Prose>
        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
            <h2 className="font-display text-2xl md:text-3xl">Work with the Lab</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              For partnerships, briefings or media enquiries, reach out to the Secretariat.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-primary"><Link to="/contact">Request a briefing <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
              <Button asChild variant="outline"><Link to="/methodology">Read methodology</Link></Button>
            </div>
          </div>
        </section>
      </PageShell>
      <SiteFooter />
    </div>
  );
}
