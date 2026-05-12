import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionHeader, StatCard } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Eye, Upload, Plus, Trash2 } from "lucide-react";
import { useReports } from "@/lib/state-data";
import { AiInsightCard } from "@/components/platform/AiInsightCard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/ngf/reports")({ component: Reports });

const REPORT_TYPES = ["Flagship", "Brief", "Foresight", "Toolkit", "Research", "Dataset"];

function Reports() {
  const { data: reports = [] } = useReports();
  const qc = useQueryClient();
  const totalDownloads = (reports as any[]).reduce((a, r) => a + Number(r.downloads ?? 0), 0);

  async function deleteReport(r: any) {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    if (r.file_url) {
      // attempt to parse path stored as "reports/<filename>"
      const path = r.file_url.startsWith("reports/") ? r.file_url.slice("reports/".length) : null;
      if (path) await supabase.storage.from("reports").remove([path]);
    }
    const { error } = await supabase.from("reports").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Report deleted");
    qc.invalidateQueries({ queryKey: ["reports"] });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Reports & Briefs"
        description="Flagship publications, foresight notes and policy briefs"
        action={<UploadReportDialog onDone={() => qc.invalidateQueries({ queryKey: ["reports"] })} />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Published" value={reports.length} icon={FileText} accent="primary" />
        <StatCard label="Total Downloads" value={totalDownloads.toLocaleString()} icon={Download} accent="gold" />
        <StatCard label="Public" value={(reports as any[]).filter((r) => r.is_public).length} icon={Eye} accent="info" />
        <StatCard label="Internal" value={(reports as any[]).filter((r) => !r.is_public).length} icon={FileText} />
      </div>

      <AiInsightCard
        mode="report"
        title="Editorial Digest"
        description="AI-curated themes, must-reads and gap analysis across the publication library."
        context={{
          reports: (reports as any[]).map((r) => ({ title: r.title, type: r.type, published_on: r.published_on, downloads: r.downloads, summary: r.summary })),
        }}
      />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Library</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {(reports as any[]).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="grid h-12 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-semibold">
                  {r.title}
                  {!r.is_public && <Badge variant="outline" className="text-[10px]">Internal</Badge>}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{r.type}</Badge>
                  <span>{r.published_on}</span>
                  {r.pages && <><span>·</span><span>{r.pages} pages</span></>}
                  <span>·</span>
                  <span>{r.downloads} downloads</span>
                </div>
                {r.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>}
              </div>
              <div className="flex gap-2">
                {r.file_url && <DownloadButton report={r} />}
                <Button size="sm" variant="ghost" onClick={() => deleteReport(r)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {!reports.length && <div className="p-8 text-center text-sm text-muted-foreground">No reports yet. Upload your first publication.</div>}
        </CardContent>
      </Card>
    </div>
  );
}

function DownloadButton({ report }: { report: any }) {
  const [busy, setBusy] = useState(false);
  async function open() {
    if (!report.file_url) return;
    setBusy(true);
    try {
      const path = report.file_url.startsWith("reports/") ? report.file_url.slice("reports/".length) : report.file_url;
      const { data, error } = await supabase.storage.from("reports").createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      // fall back to raw URL if it's already a full URL
      if (report.file_url.startsWith("http")) window.open(report.file_url, "_blank", "noopener,noreferrer");
      else toast.error(e.message ?? "Could not open file");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant="outline" size="sm" onClick={open} disabled={busy}>
      <Download className="mr-2 h-4 w-4" />Download
    </Button>
  );
}

function UploadReportDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    type: "Brief",
    summary: "",
    published_on: new Date().toISOString().slice(0, 10),
    pages: "",
    is_public: true,
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!form.title) return toast.error("Title is required");
    setSaving(true);
    try {
      let file_url: string | null = null;
      if (file) {
        if (file.size > 25 * 1024 * 1024) throw new Error("File must be under 25MB");
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from("reports").upload(path, file, {
          contentType: file.type || "application/pdf",
          upsert: false,
        });
        if (upErr) throw upErr;
        file_url = `reports/${path}`;
      }
      const { error } = await supabase.from("reports").insert({
        title: form.title,
        type: form.type,
        summary: form.summary || null,
        published_on: form.published_on,
        pages: form.pages ? Number(form.pages) : null,
        is_public: form.is_public,
        file_url,
      });
      if (error) throw error;
      toast.success("Report published");
      setOpen(false);
      setFile(null);
      setForm({ title: "", type: "Brief", summary: "", published_on: new Date().toISOString().slice(0, 10), pages: "", is_public: true });
      onDone();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary"><Plus className="mr-2 h-4 w-4" /> Upload report</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish a report</DialogTitle>
          <DialogDescription>Upload a PDF (or leave blank for a metadata-only entry).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REPORT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Published on</Label><Input type="date" value={form.published_on} onChange={(e) => setForm({ ...form, published_on: e.target.value })} /></div>
          </div>
          <div><Label>Summary</Label><Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Pages</Label><Input type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} /></div>
            <div className="flex items-end gap-2">
              <Switch checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
              <Label className="mb-2">Public (visible to all states)</Label>
            </div>
          </div>
          <div>
            <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> PDF file</Label>
            <Input type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file && <div className="mt-1 text-xs text-muted-foreground">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</div>}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving} className="bg-primary">{saving ? "Publishing…" : "Publish"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
