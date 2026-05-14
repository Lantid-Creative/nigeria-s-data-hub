import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/audit";
import { toast } from "sonner";
import { useState } from "react";
import { ExternalLink, Sparkles, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { scorePressSentiment } from "@/lib/press.functions";

export const Route = createFileRoute("/ngf/press")({ component: Press });

function Press() {
  const qc = useQueryClient();
  const score = useServerFn(scorePressSentiment);
  const [scoring, setScoring] = useState(false);
  const [form, setForm] = useState({ headline: "", outlet: "", url: "", state_code: "", topic: "", sentiment: "neutral", published_at: "" });
  const [filter, setFilter] = useState("");

  const runAi = async () => {
    setScoring(true);
    try {
      const r: any = await score();
      toast.success(`AI scored ${r.updated}/${r.processed} clippings`);
      logEvent("press.ai_score", "press", null, r);
      qc.invalidateQueries({ queryKey: ["press"] });
    } catch (e: any) {
      toast.error(e?.message ?? "AI scoring failed");
    } finally {
      setScoring(false);
    }
  };

  const { data: rows = [] } = useQuery({
    queryKey: ["press"],
    queryFn: async () => {
      const { data, error } = await supabase.from("press_clippings").select("*").order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = async () => {
    if (!form.headline.trim()) return toast.error("Headline required");
    const payload: any = { ...form };
    payload.published_at = form.published_at || new Date().toISOString().slice(0, 10);
    payload.state_code = form.state_code || null;
    const { error } = await supabase.from("press_clippings").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Clipping added");
    logEvent("press.create", "press", null, { headline: form.headline });
    setForm({ headline: "", outlet: "", url: "", state_code: "", topic: "", sentiment: "neutral", published_at: "" });
    qc.invalidateQueries({ queryKey: ["press"] });
  };

  const remove = async (id: string) => {
    await supabase.from("press_clippings").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["press"] });
  };

  const filtered = rows.filter((r: any) => !filter || r.headline.toLowerCase().includes(filter.toLowerCase()) || r.outlet?.toLowerCase().includes(filter.toLowerCase()));
  const sentimentTone = (s: string) => s === "positive" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : s === "negative" ? "bg-destructive/10 text-destructive" : "bg-muted";

  return (
    <div className="space-y-6">
      <SectionHeader title="Press monitor" description="Media coverage tagged by state and topic" />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Add clipping</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2"><Label>Headline</Label><Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
          <div><Label>Outlet</Label><Input value={form.outlet} onChange={(e) => setForm({ ...form, outlet: e.target.value })} /></div>
          <div><Label>URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></div>
          <div><Label>State (optional)</Label><Input value={form.state_code} onChange={(e) => setForm({ ...form, state_code: e.target.value.toUpperCase() })} /></div>
          <div><Label>Topic</Label><Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></div>
          <div><Label>Date</Label><Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} /></div>
          <div><Label>Sentiment</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.sentiment} onChange={(e) => setForm({ ...form, sentiment: e.target.value })}>
              <option value="positive">positive</option><option value="neutral">neutral</option><option value="negative">negative</option>
            </select>
          </div>
          <div className="md:col-span-3"><Button onClick={create} className="bg-primary">Add</Button></div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Coverage feed</CardTitle>
          <Input className="max-w-xs" placeholder="Filter…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </CardHeader>
        <CardContent className="divide-y p-0">
          {filtered.map((r: any) => (
            <div key={r.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="font-medium">{r.headline}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{r.outlet}</span>
                  <span>·</span>
                  <span>{r.published_at}</span>
                  {r.state_code && <Badge variant="secondary" className="text-[10px]">{r.state_code}</Badge>}
                  {r.topic && <Badge variant="outline" className="text-[10px]">{r.topic}</Badge>}
                  <Badge className={sentimentTone(r.sentiment)}>{r.sentiment}</Badge>
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">link <ExternalLink className="h-3 w-3" /></a>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {!filtered.length && <div className="p-6 text-center text-sm text-muted-foreground">No coverage logged.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
