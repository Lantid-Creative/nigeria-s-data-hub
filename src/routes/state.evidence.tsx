import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStateCode } from "@/lib/state-data";
import { logEvent } from "@/lib/audit";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/state/evidence")({ component: Evidence });

function Evidence() {
  const code = useStateCode();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [questionCode, setQuestionCode] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: rows = [] } = useQuery({
    queryKey: ["evidence", code],
    queryFn: async () => {
      const { data, error } = await supabase.from("evidence_uploads").select("*").eq("state_code", code).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Pick a file");
    setBusy(true);
    try {
      const path = `${code}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("evidence").upload(path, file);
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("evidence_uploads").insert({
        state_code: code, file_path: path, file_name: file.name,
        size_bytes: file.size, question_code: questionCode || null,
      });
      if (insErr) throw insErr;
      toast.success("Uploaded");
      logEvent("evidence.upload", "evidence", null, { state: code, file: file.name });
      if (fileRef.current) fileRef.current.value = "";
      setQuestionCode("");
      qc.invalidateQueries({ queryKey: ["evidence", code] });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  const download = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("evidence").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    const a = document.createElement("a");
    a.href = data.signedUrl; a.download = name; a.click();
  };

  const remove = async (id: string, path: string) => {
    await supabase.storage.from("evidence").remove([path]);
    await supabase.from("evidence_uploads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["evidence", code] });
    logEvent("evidence.delete", "evidence", id, {});
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Evidence vault" description="Attach supporting documents to your survey responses." />
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Upload</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2"><Label>File</Label><Input ref={fileRef} type="file" /></div>
          <div><Label>Question code (optional)</Label><Input value={questionCode} onChange={(e) => setQuestionCode(e.target.value)} placeholder="e.g. ECON_GDP" /></div>
          <div className="md:col-span-3"><Button onClick={upload} disabled={busy} className="bg-primary"><Upload className="mr-2 h-4 w-4" />{busy ? "Uploading…" : "Upload"}</Button></div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Files ({rows.length})</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {rows.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{r.file_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.question_code ? `${r.question_code} · ` : ""}{Math.round((r.size_bytes ?? 0) / 1024)} KB · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => download(r.file_path, r.file_name)}>Download</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id, r.file_path)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {!rows.length && <div className="p-6 text-center text-sm text-muted-foreground">No files yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
