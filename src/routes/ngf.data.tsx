import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";

export const Route = createFileRoute("/ngf/data")({ component: () => (
  <div className="space-y-6">
    <SectionHeader title="Data Hub" description="Datasets, pipelines and integrations powering the Lab" />
    <div className="grid gap-4 md:grid-cols-3">
      {["NBS Macro", "State PRS Submissions", "Climate (NIMET)", "Fiscal (FAAC)", "Security (NSCDC)", "Health (NHMIS)"].map((d) => (
        <Card key={d} className="shadow-soft"><CardContent className="p-5">
          <div className="flex items-center gap-2"><Database className="h-4 w-4 text-primary" /><span className="font-semibold">{d}</span></div>
          <div className="mt-2 text-xs text-muted-foreground">Updated daily · 36 states</div>
        </CardContent></Card>
      ))}
    </div>
  </div>
)});
