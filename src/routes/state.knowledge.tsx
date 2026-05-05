import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
export const Route = createFileRoute("/state/knowledge")({ component: () => (
  <div className="space-y-6"><SectionHeader title="Knowledge Hub" description="Briefs, training and toolkits from the NGF Futures Lab" />
  <Card className="shadow-soft"><CardContent className="p-8 text-sm text-muted-foreground">Module under active development.</CardContent></Card></div>
)});
