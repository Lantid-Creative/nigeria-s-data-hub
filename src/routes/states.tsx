import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero, PageShell } from "@/components/site/PageBits";
import { NigeriaMap } from "@/components/site/NigeriaMap";

export const Route = createFileRoute("/states")({
  component: StatesPage,
  head: () => ({
    meta: [
      { title: "States Coverage — NGF Futures Lab" },
      { name: "description", content: "All 36 Nigerian states and the Federal Capital Territory, organised by geo-political zone, reporting through the NGF Futures Lab." },
      { property: "og:title", content: "States Coverage — NGF Futures Lab" },
      { property: "og:description", content: "36 states + FCT across six geo-political zones, reporting through the NGF Futures Lab." },
      { property: "og:url", content: "https://myadam.online/states" },
      { property: "og:image", content: "https://myadam.online/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://myadam.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://myadam.online/states" }],
  }),
});

const ZONES: Record<string, string[]> = {
  "North-West": ["Jigawa","Kaduna","Kano","Katsina","Kebbi","Sokoto","Zamfara"],
  "North-Central": ["Benue","Kogi","Kwara","Nasarawa","Niger","Plateau","FCT"],
  "North-East": ["Adamawa","Bauchi","Borno","Gombe","Taraba","Yobe"],
  "South-West": ["Ekiti","Lagos","Ogun","Ondo","Osun","Oyo"],
  "South-South": ["Akwa Ibom","Bayelsa","Cross River","Delta","Edo","Rivers"],
  "South-East": ["Abia","Anambra","Ebonyi","Enugu","Imo"],
};

function StatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageShell>
        <PageHero
          eyebrow="Coverage"
          title="36 states + FCT, across six zones."
          lede="Every state of the federation is part of the Futures Lab. State PRS units report through a secure workspace; aggregated views power the national picture."
        />
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <NigeriaMap className="h-auto w-full" ariaLabel="Map of Nigeria's six geo-political zones" />
            </div>
            <div className="space-y-8">
              {Object.entries(ZONES).map(([zone, states]) => (
                <div key={zone}>
                  <div className="text-xs font-semibold uppercase tracking-widest text-primary">{zone}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {states.map((s) => (
                      <span key={s} className="rounded-full border bg-background px-3 py-1 text-sm text-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageShell>
      <SiteFooter />
    </div>
  );
}
