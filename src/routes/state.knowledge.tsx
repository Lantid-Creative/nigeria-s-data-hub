import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useReports } from "@/lib/state-data";
import { Download, FileText, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/state/knowledge")({ component: Knowledge });

function Knowledge() {
  const { data: reports = [] } = useReports();
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");
  const qc = useQueryClient();

  const types = useMemo(() => {
    const s = new Set<string>();
    (reports as any[]).forEach((r) => r.type && s.add(r.type));
    return ["all", ...Array.from(s)];
  }, [reports]);

  const filtered = useMemo(() => {
    return (reports as any[]).filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (!q) return true;
      const hay = `${r.title} ${r.summary ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [reports, q, type]);

  async function downloadReport(r: any) {
    if (!r.file_url) return toast.info("No file attached");
    try {
      const path = r.file_url.startsWith("reports/") ? r.file_url.slice("reports/".length) : r.file_url;
      if (r.file_url.startsWith("http")) {
        window.open(r.file_url, "_blank", "noopener,noreferrer");
      } else {
        const { data, error } = await supabase.storage.from("reports").createSignedUrl(path, 60);
        if (error) throw error;
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      }
      await supabase.rpc("increment_report_downloads", { _report_id: r.id });
      qc.invalidateQueries({ queryKey: ["reports"] });
    } catch (e: any) {
      toast.error(e.message ?? "Could not open file");
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Knowledge Hub" description="Briefs, reports, toolkits and training from the NGF Futures Lab" />

      <Card className="shadow-soft">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search reports…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {types.map((t) => (
              <Button key={t} size="sm" variant={t === type ? "default" : "outline"} className={t === type ? "bg-primary" : ""} onClick={() => setType(t)}>
                {t === "all" ? "All" : t}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((r: any) => (
          <Card key={r.id} className="shadow-soft">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="font-display text-base">{r.title}</CardTitle>
                {r.summary && <p className="mt-1 text-xs text-muted-foreground">{r.summary}</p>}
              </div>
              <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.type}</Badge>
                <span className="text-muted-foreground">{r.published_on} · {r.pages ?? "—"} pages · {r.downloads} downloads</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => downloadReport(r)} disabled={!r.file_url}>
                <Download className="mr-1 h-3 w-3" />Download
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            No reports match your search.
          </div>
        )}
      </div>
    </div>
  );
}
