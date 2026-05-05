import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReports } from "@/lib/state-data";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/state/knowledge")({ component: Knowledge });

function Knowledge() {
  const { data: reports = [] } = useReports();
  return (
    <div className="space-y-6">
      <SectionHeader title="Knowledge Hub" description="Briefs, reports, toolkits and training from the NGF Futures Lab" />
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r: any) => (
          <Card key={r.id} className="shadow-soft">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="font-display text-base">{r.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{r.summary}</p>
              </div>
              <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.type}</Badge>
                <span className="text-muted-foreground">{r.published_on} · {r.pages ?? "—"} pages</span>
              </div>
              <Button size="sm" variant="outline" asChild={!!r.file_url} disabled={!r.file_url}>
                {r.file_url ? <a href={r.file_url} target="_blank" rel="noreferrer"><Download className="mr-1 h-3 w-3" />Download</a> : <span><Download className="mr-1 h-3 w-3" />Download</span>}
              </Button>
            </CardContent>
          </Card>
        ))}
        {reports.length === 0 && (
          <div className="text-sm text-muted-foreground">No reports published yet.</div>
        )}
      </div>
    </div>
  );
}
