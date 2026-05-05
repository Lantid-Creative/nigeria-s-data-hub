import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
const make = (title: string, desc: string) => () => (
  <div className="space-y-6">
    <SectionHeader title={title} description={desc} />
    <Card className="shadow-soft"><CardContent className="p-8 text-sm text-muted-foreground">Module under active development.</CardContent></Card>
  </div>
);
export const Route = createFileRoute("/state/indicators")({ component: make("Indicators", "Track your state's indicator performance over time") });
