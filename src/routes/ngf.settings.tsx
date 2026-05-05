import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
export const Route = createFileRoute("/ngf/settings")({ component: () => (
  <div className="space-y-6">
    <SectionHeader title="Settings" description="Workspace, users and integrations" />
    <Card className="shadow-soft"><CardContent className="p-6 text-sm text-muted-foreground">Settings configuration coming soon.</CardContent></Card>
  </div>
)});
