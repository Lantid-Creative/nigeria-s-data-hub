import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero, PageShell, Prose } from "@/components/site/PageBits";

export const Route = createFileRoute("/legal/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Use — NGF Futures Lab" },
      { name: "description", content: "Terms governing use of the NGF Futures Lab platform and publications." },
      { property: "og:title", content: "Terms of Use — NGF Futures Lab" },
      { property: "og:description", content: "Terms governing use of the NGF Futures Lab platform and publications." },
      { property: "og:url", content: "https://myadam.online/legal/terms" },
      { property: "og:image", content: "https://myadam.online/og-image.jpg" },
      { name: "twitter:image", content: "https://myadam.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://myadam.online/legal/terms" }],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageShell>
        <PageHero eyebrow="Legal" title="Terms of Use" lede="Terms governing use of the NGF Futures Lab platform and publications." />
        <Prose>
          <h2>Access</h2>
          <p>Access to the state workspace is restricted to users credentialed by the NGF Secretariat. Public sections of this site are open without registration.</p>
          <h2>Use of content</h2>
          <p>Reports and briefs published by the Lab may be cited with attribution to the NGF Futures Lab. Republication requires prior written consent.</p>
          <h2>Disclaimer</h2>
          <p>The Lab strives for accuracy but provides content "as is". Decisions taken on the basis of Lab outputs remain the responsibility of the user.</p>
          <p className="text-xs">Last updated: April 2026.</p>
        </Prose>
      </PageShell>
      <SiteFooter />
    </div>
  );
}
