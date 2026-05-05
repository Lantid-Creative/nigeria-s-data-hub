import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, Eye, Sparkles } from "lucide-react";
import { REPORTS } from "@/lib/mock-data";

export const Route = createFileRoute("/ngf/reports")({
  component: Reports,
});

function Reports() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Reports & Briefs"
        description="Flagship publications, foresight notes and policy briefs"
        action={
          <div className="flex gap-2">
            <Button variant="outline"><Sparkles className="mr-2 h-4 w-4" />AI draft</Button>
            <Button className="bg-primary"><Plus className="mr-2 h-4 w-4" />New report</Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Published" value={REPORTS.length} icon={FileText} accent="primary" />
        <StatCard label="Total Downloads" value="24.6K" icon={Download} delta={18} accent="gold" />
        <StatCard label="In Drafting" value="8" icon={FileText} accent="info" />
        <StatCard label="Under Review" value="3" icon={Eye} />
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Featured: State of the States 2025</CardTitle></CardHeader>
        <CardContent>
          <div className="grid items-center gap-6 md:grid-cols-3">
            <div className="aspect-[3/4] rounded-lg gradient-hero p-5 text-primary-foreground shadow-elevated">
              <div className="text-[10px] uppercase tracking-widest opacity-70">Flagship Report</div>
              <div className="mt-2 font-display text-2xl">State of the States 2025</div>
              <div className="mt-auto pt-20 text-xs opacity-70">Nigeria Governors' Forum · December 2025</div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">
                The annual flagship synthesises performance, resilience and reform progress
                across all 36 sub-national governments. This edition introduces the Sub-National
                Resilience Index v2 and 12 forward-looking foresight scenarios.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border p-3"><div className="text-muted-foreground">Pages</div><div className="font-display text-lg">184</div></div>
                <div className="rounded-lg border p-3"><div className="text-muted-foreground">Downloads</div><div className="font-display text-lg">12.4K</div></div>
                <div className="rounded-lg border p-3"><div className="text-muted-foreground">Citations</div><div className="font-display text-lg">38</div></div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="bg-primary"><Download className="mr-2 h-4 w-4" />Download PDF</Button>
                <Button variant="outline">Read online</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Library</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {REPORTS.map((r) => (
            <div key={r.title} className="flex flex-wrap items-center gap-4 py-4">
              <div className="grid h-12 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{r.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{r.type}</Badge>
                  <span>{r.date}</span>
                  <span>·</span>
                  <span>{r.pages} pages</span>
                  <span>·</span>
                  <span>{r.downloads.toLocaleString()} downloads</span>
                </div>
              </div>
              <Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4" />Preview</Button>
              <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" />Download</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
