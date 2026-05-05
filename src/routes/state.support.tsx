import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
export const Route = createFileRoute("/state/support")({ component: () => (
  <div className="space-y-6"><SectionHeader title="Support" description="Contact the NGF Futures Lab team" />
  <Card className="shadow-soft"><CardContent className="p-8 text-sm text-muted-foreground">Email lab@ngf.org.ng or open a ticket.</CardContent></Card></div>
)});
