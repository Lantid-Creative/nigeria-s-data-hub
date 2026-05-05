import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero, PageShell, Prose } from "@/components/site/PageBits";

export const Route = createFileRoute("/legal/data")({
  component: DataPolicyPage,
  head: () => ({
    meta: [
      { title: "Data Policy — NGF Futures Lab" },
      { name: "description", content: "How the Lab governs state-reported data: ownership, access, publication and security." },
    ],
  }),
});

function DataPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageShell>
        <PageHero eyebrow="Legal" title="Data Policy" lede="How the Lab governs state-reported data: ownership, access, publication and security." />
        <Prose>
          <h2>Ownership</h2>
          <p>Data submitted by a state remains the property of that state. The Secretariat acts as custodian for the purpose of comparative analysis.</p>
          <h2>Access tiers</h2>
          <ul>
            <li><strong>State-only:</strong> raw submissions visible only to the originating state and authorised analysts.</li>
            <li><strong>Aggregated:</strong> zonal and national aggregates available to all states.</li>
            <li><strong>Public:</strong> indices and indicators released through the Library.</li>
          </ul>
          <h2>Security</h2>
          <p>Data is encrypted in transit and at rest. Access is logged. Independent reviews are conducted annually.</p>
          <h2>Publication</h2>
          <p>State-attributed scores are published only after review with the relevant state PRS unit.</p>
          <p className="text-xs">Last updated: April 2026.</p>
        </Prose>
      </PageShell>
      <SiteFooter />
    </div>
  );
}
