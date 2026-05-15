import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero, PageShell, Prose } from "@/components/site/PageBits";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — NGF Futures Lab" },
      { name: "description", content: "How the NGF Futures Lab collects, uses and protects personal data." },
      { property: "og:title", content: "Privacy Policy — NGF Futures Lab" },
      { property: "og:description", content: "How the NGF Futures Lab collects, uses and protects personal data." },
      { property: "og:url", content: "https://myadam.online/legal/privacy" },
      { property: "og:image", content: "https://myadam.online/og-image.jpg" },
      { name: "twitter:image", content: "https://myadam.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://myadam.online/legal/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageShell>
        <PageHero eyebrow="Legal" title="Privacy Policy" lede="How we collect, use and protect personal data on the NGF Futures Lab." />
        <Prose>
          <p>This policy explains how the NGF Secretariat handles personal data collected through the Futures Lab platform.</p>
          <h2>Data we collect</h2>
          <p>Account information for state PRS users (name, role, state, contact email), and survey submissions made on behalf of state governments.</p>
          <h2>Use of data</h2>
          <p>Data is used to operate the platform, generate aggregated indicators, and communicate with state focal points.</p>
          <h2>Sharing</h2>
          <p>Identifiable state submissions remain accessible only to the relevant state and authorised Secretariat analysts. Aggregated, anonymised data may be published.</p>
          <h2>Retention</h2>
          <p>Personal data is retained for the duration of the user's role as a state focal point and for up to 24 months thereafter.</p>
          <h2>Your rights</h2>
          <p>Contact <a href="mailto:lab@nggovernorsforum.org">lab@nggovernorsforum.org</a> to request access, correction or deletion of your personal data.</p>
          <p className="text-xs">Last updated: April 2026.</p>
        </Prose>
      </PageShell>
      <SiteFooter />
    </div>
  );
}
