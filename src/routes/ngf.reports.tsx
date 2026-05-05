import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from "lucide-react";
import { useReports } from "@/lib/state-data";
import { AiInsightCard } from "@/components/platform/AiInsightCard";

export const Route = createFileRoute("/ngf/reports")({ component: Reports });

function Reports() {
  const { data: reports = [] } = useReports();
  const totalDownloads = (reports as any[]).reduce((a, r) => a + Number(r.downloads ?? 0), 0);

  return (
    <div className="space-y-6">
      <SectionHeader title="Reports & Briefs" description="Flagship publications, foresight notes and policy briefs" />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Published" value={reports.length} icon={FileText} accent="primary" />
        <StatCard label="Total Downloads" value={totalDownloads.toLocaleString()} icon={Download} accent="gold" />
        <StatCard label="Public" value={(reports as any[]).filter((r) => r.is_public).length} icon={Eye} accent="info" />
        <StatCard label="Internal" value={(reports as any[]).filter((r) => !r.is_public).length} icon={FileText} />
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Library</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {(reports as any[]).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="grid h-12 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{r.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{r.type}</Badge>
                  <span>{r.published_on}</span>
                  {r.pages && <><span>·</span><span>{r.pages} pages</span></>}
                  <span>·</span>
                  <span>{r.downloads} downloads</span>
                </div>
                {r.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>}
              </div>
              {r.file_url && (
                <Button asChild variant="outline" size="sm">
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" />Download</a>
                </Button>
              )}
            </div>
          ))}
          {!reports.length && <div className="p-8 text-center text-sm text-muted-foreground">No reports yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
