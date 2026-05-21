import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Loader2, Sparkles, Eye, FileCheck2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EvidencePreview } from "@/components/platform/EvidencePreview";

export const Route = createFileRoute("/ngf/evidence")({ component: EvidenceSearch });

function EvidenceSearch() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("_all");
  const [ocrStatus, setOcrStatus] = useState<string>("_all");
  const [preview, setPreview] = useState<{ path: string; name: string } | null>(null);
  const [ocrId, setOcrId] = useState<string | null>(null);


  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["evidence-search"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence_uploads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: states = [] } = useQuery({
    queryKey: ["states-min"],
    queryFn: async () => (await supabase.from("states").select("code,name").order("name")).data ?? [],
  });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows as any[]).filter((r) => {
      if (stateFilter !== "_all" && r.state_code !== stateFilter) return false;
      if (ocrStatus !== "_all" && r.ocr_status !== ocrStatus) return false;
      if (!needle) return true;
      return (
        (r.file_name ?? "").toLowerCase().includes(needle) ||
        (r.extracted_text ?? "").toLowerCase().includes(needle) ||
        (r.question_code ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, stateFilter, ocrStatus]);

  function snippet(text: string | null, needle: string) {
    if (!text) return null;
    if (!needle) return text.slice(0, 180) + (text.length > 180 ? "…" : "");
    const idx = text.toLowerCase().indexOf(needle.toLowerCase());
    if (idx < 0) return text.slice(0, 180) + (text.length > 180 ? "…" : "");
    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + needle.length + 120);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  }

  async function runOcr(row: any) {
    setOcrId(row.id);
    try {
      const { data: signed, error: sErr } = await supabase.storage
        .from("evidence").createSignedUrl(row.file_path, 600);
      if (sErr || !signed?.signedUrl) throw sErr ?? new Error("Could not sign URL");

      const lower = (row.file_name ?? "").toLowerCase();
      const isImage = /\.(png|jpe?g|webp|gif)$/i.test(lower);
      if (!isImage) {
        toast.message("OCR currently supports images. For PDFs, attach an excerpt screenshot or use the preview.");
        await supabase.from("evidence_uploads")
          .update({ ocr_status: "unsupported" }).eq("id", row.id);
        qc.invalidateQueries({ queryKey: ["evidence-search"] });
        return;
      }

      const prompt = `Extract all readable text from this document image verbatim. Preserve structure (headings, lists, tables as plain rows). Return only the text.`;
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: {
          mode: "narrative",
          context: { instruction: prompt, image_url: signed.signedUrl, file_name: row.file_name },
        },
      });
      if (error) throw error;
      const text = (data as any)?.content ?? "";
      await supabase.from("evidence_uploads")
        .update({ extracted_text: text, ocr_status: text ? "done" : "empty" })
        .eq("id", row.id);
      toast.success("OCR complete");
      qc.invalidateQueries({ queryKey: ["evidence-search"] });
    } catch (e: any) {
      toast.error(e?.message ?? "OCR failed");
    } finally {
      setOcrId(null);
    }
  }

  const totals = useMemo(() => {
    const all = rows as any[];
    return {
      total: all.length,
      indexed: all.filter((r) => r.ocr_status === "done").length,
      pending: all.filter((r) => r.ocr_status === "pending").length,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Evidence Search"
        description="Full-text search across all state-submitted evidence. Run OCR on images to make scanned documents searchable."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Files" value={totals.total} icon={FileText} />
        <StatCard label="OCR indexed" value={totals.indexed} icon={FileCheck2} accent="info" />
        <StatCard label="Pending OCR" value={totals.pending} icon={Clock} accent="gold" />
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-4 w-4" />Search the evidence library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search filenames, OCR text, question codes…" />
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All states</SelectItem>
                {(states as any[]).map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={ocrStatus} onValueChange={setOcrStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Any OCR status</SelectItem>
                <SelectItem value="done">Indexed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unsupported">Unsupported</SelectItem>
                <SelectItem value="empty">Empty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No evidence matches.</div>
          ) : (
            <div className="divide-y rounded-md border">
              {filtered.map((r: any) => (
                <div key={r.id} className="p-4 flex items-start gap-3">
                  <FileText className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{r.file_name}</span>
                      <Badge variant="outline" className="text-xs">{r.state_code}</Badge>
                      {r.question_code && <Badge variant="secondary" className="text-xs">{r.question_code}</Badge>}
                      <Badge variant={r.ocr_status === "done" ? "default" : "outline"} className="text-xs">
                        {r.ocr_status}
                      </Badge>
                    </div>
                    {r.extracted_text && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
                        {snippet(r.extracted_text, q)}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()} · {r.size_bytes ? `${Math.round(r.size_bytes / 1024)} KB` : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setPreviewPath(r.file_path)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => runOcr(r)} disabled={ocrId === r.id}>
                      {ocrId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EvidencePreview path={previewPath} onClose={() => setPreviewPath(null)} />
    </div>
  );
}
