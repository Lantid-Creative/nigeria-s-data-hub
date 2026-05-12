import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/audit";
import { toast } from "sonner";
import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";

export const Route = createFileRoute("/ngf/horizon")({ component: Horizon });

function Horizon() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", source_url: "", signal_type: "weak", dimension_code: "", summary: "" });

  const { data: rows = [] } = useQuery({
    queryKey: ["horizon"],
    queryFn: async () => {
      const { data, error } = await supabase.from("horizon_signals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    const { error } = await supabase.from("horizon_signals").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Signal added");
    logEvent("horizon.create", "signal", null, { title: form.title });
    setForm({ title: "", source_url: "", signal_type: "weak", dimension_code: "", summary: "" });
    qc.invalidateQueries({ queryKey: ["horizon"] });
  };

  const remove = async (id: string) => {
    await supabase.from("horizon_signals").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["horizon"] });
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Horizon scan" description="Weak signals, emerging trends and futures inputs" />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Add signal</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Source URL</Label><Input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} /></div>
          <div><Label>Signal type</Label><Input value={form.signal_type} onChange={(e) => setForm({ ...form, signal_type: e.target.value })} placeholder="weak · trend · disruption" /></div>
          <div><Label>Dimension code</Label><Input value={form.dimension_code} onChange={(e) => setForm({ ...form, dimension_code: e.target.value })} placeholder="ECON · CLIM …" /></div>
          <div className="md:col-span-2"><Label>Summary</Label><Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
          <div className="md:col-span-2"><Button onClick={create} className="bg-primary">Add signal</Button></div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r: any) => (
          <Card key={r.id} className="shadow-soft">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{r.title}</div>
                <Badge variant="outline">{r.signal_type}</Badge>
              </div>
              {r.summary && <p className="text-sm text-muted-foreground">{r.summary}</p>}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {r.dimension_code && <Badge variant="secondary">{r.dimension_code}</Badge>}
                {r.source_url && <a href={r.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">source <ExternalLink className="h-3 w-3" /></a>}
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <div className="md:col-span-2 rounded-lg border p-6 text-center text-sm text-muted-foreground">No signals captured.</div>}
      </div>
    </div>
  );
}
