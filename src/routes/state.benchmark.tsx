import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
const make = (t: string, d: string) => () => (
  <div className="space-y-6">
    <SectionHeader title={t} description={d} />
    <Card className="shadow-soft"><CardContent className="p-8 text-sm text-muted-foreground">Module under active development.</CardContent></Card>
  </div>
);
export const Route = createFileRoute("/state/benchmark")({ component: make("Peer Benchmarking", "Compare against peer states and zonal averages") });
