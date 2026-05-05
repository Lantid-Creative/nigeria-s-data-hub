import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SURVEY_INSTRUMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/ngf/surveys")({ component: () => (
  <div className="space-y-6">
    <SectionHeader title="Survey Engine" description="Design instruments, manage cycles and validate state submissions" />
    <div className="grid gap-4 md:grid-cols-2">
      {SURVEY_INSTRUMENTS.map((s) => (
        <Card key={s.id} className="shadow-soft"><CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div><div className="text-xs text-muted-foreground">{s.id}</div><div className="font-semibold">{s.title}</div></div>
            <Badge>{s.responseRate}%</Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{s.sections} sections · {s.questions} questions · Due {s.dueDate}</div>
        </CardContent></Card>
      ))}
    </div>
  </div>
)});
