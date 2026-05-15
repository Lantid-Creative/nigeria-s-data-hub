import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero, PageShell, Prose } from "@/components/site/PageBits";

export const Route = createFileRoute("/methodology")({
  component: MethodologyPage,
  head: () => ({
    meta: [
      { title: "Methodology — NGF Futures Lab" },
      { name: "description", content: "How the NGF Futures Lab collects, validates and analyses sub-national data: indicator framework, weighting, peer review and reporting cycles." },
      { property: "og:title", content: "Methodology — NGF Futures Lab" },
      { property: "og:description", content: "Indicator framework, weighting, peer review and reporting cycles behind the SNRI and Lab outputs." },
      { property: "og:url", content: "https://myadam.online/methodology" },
      { property: "og:image", content: "https://myadam.online/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://myadam.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://myadam.online/methodology" }],
  }),
});

function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageShell>
        <PageHero
          eyebrow="Methodology"
          title="How we measure, analyse and forecast."
          lede="A transparent, peer-reviewed framework. Every indicator, weight and data source is documented and revisited each reporting cycle."
        />
        <Prose>
          <h2>Indicator framework</h2>
          <p>
            The Lab tracks 12 weighted indicators across 6 dimensions: fiscal health, human capital,
            health, education, climate, and security. Each indicator has a published definition, source
            of truth and update cadence.
          </p>
          <h2>Data flow</h2>
          <ul>
            <li>State PRS units submit periodic survey instruments through their secure workspace.</li>
            <li>Submissions pass automated validation and an analyst review.</li>
            <li>Approved data feeds composite indices, dashboards and policy briefs.</li>
            <li>Aggregated views are returned to states and published in the Library.</li>
          </ul>
          <h2>Weighting and scoring</h2>
          <p>
            Indicator weights are calibrated annually with a panel of state PRS leads and external
            reviewers. Scores are normalised to a 0–100 scale and translated into letter grades and
            peer ranks for ease of communication.
          </p>
          <h2>Peer review</h2>
          <p>
            Major releases — the State of Sub-National Resilience, the SNRI methodology paper and
            foresight studies — are externally reviewed before publication. Minor model updates are
            documented in the changelog of each instrument.
          </p>
          <h2>Versioning</h2>
          <p>
            The current SNRI methodology is v2 (2026). Historical data is restated under the latest
            methodology so trends remain comparable across cycles.
          </p>
        </Prose>
      </PageShell>
      <SiteFooter />
    </div>
  );
}
