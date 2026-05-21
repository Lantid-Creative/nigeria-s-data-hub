import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Sparkles, Loader2, Save, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/ngf/reports/new")({ component: NewReport });

type Section = {
  id: string;
  title: string;
  state_code?: string;
  dimension?: string;
  prompt: string;
  body: string;
  loading?: boolean;
};

const DIMENSIONS = ["economic", "fiscal", "social", "security", "climate", "human_capital", "governance"];
const REPORT_TYPES = ["Flagship", "Brief", "Foresight", "Toolkit", "Research", "Dataset"];

function uid() { return Math.random().toString(36).slice(2, 10); }

function NewReport() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Brief");
  const [summary, setSummary] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    { id: uid(), title: "Executive Summary", prompt: "", body: "" },
  ]);

  const { data: states = [] } = useQuery({
    queryKey: ["states-min"],
    queryFn: async () => {
      const { data } = await supabase.from("states").select("code,name").order("name");
      return data ?? [];
    },
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["scores-latest-rb"],
    queryFn: async () => {
      const { data } = await supabase.from("state_scores").select("*").order("created_at", { ascending: false }).limit(500);
      return data ?? [];
    },
  });

  function updateSection(id: string, patch: Partial<Section>) {
    setSections((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function addSection() {
    setSections((s) => [...s, { id: uid(), title: `Section ${s.length + 1}`, prompt: "", body: "" }]);
  }
  function removeSection(id: string) {
    setSections((s) => s.filter((x) => x.id !== id));
  }

  async function generateSection(sec: Section) {
    updateSection(sec.id, { loading: true });
    try {
      const ctx: any = {
        section_title: sec.title,
        report_title: title,
        report_type: type,
        prompt: sec.prompt || "Write a substantive deep-dive section using the provided context.",
      };
      if (sec.state_code) {
        ctx.state_code = sec.state_code;
        ctx.state_scores = (scores as any[]).filter((r) => r.state_code === sec.state_code).slice(0, 4);
      }
      if (sec.dimension) {
        ctx.dimension = sec.dimension;
        ctx.dimension_scores = (scores as any[])
          .map((r) => ({ state: r.state_code, value: r[sec.dimension!] }))
          .filter((r) => r.value != null);
      }
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: { mode: "narrative", context: ctx },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      updateSection(sec.id, { body: (data as any)?.content ?? "", loading: false });
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
      updateSection(sec.id, { loading: false });
    }
  }

  async function saveReport(publish: boolean) {
    if (!title.trim()) return toast.error("Title required");
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const payload = {
        title,
        type,
        summary: summary || sections[0]?.body?.slice(0, 240) || null,
        published_on: new Date().toISOString().slice(0, 10),
        pages: sections.length,
        is_public: publish && isPublic,
        body: sections.map(({ loading: _l, ...s }) => s) as any,
        author_id: userRes?.user?.id ?? null,
      };
      const { data, error } = await supabase.from("reports").insert(payload).select("id").single();
      if (error) throw error;
      toast.success(publish ? "Report published" : "Draft saved");
      navigate({ to: "/ngf/reports" });
      return data;
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Deep-Dive Report Builder"
          description="Compose multi-section briefings with AI-assisted narrative grounded in live state data."
        />
        <Button asChild variant="ghost" size="sm">
          <Link to="/ngf/reports"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Report metadata</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="State of Sub-national Resilience — Q2 2026" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={isPublic ? "public" : "internal"} onValueChange={(v) => setIsPublic(v === "public")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public when published</SelectItem>
                <SelectItem value="internal">Internal only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Executive summary (optional — first section used if blank)</Label>
            <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sections.map((sec, i) => (
          <Card key={sec.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline">§ {i + 1}</Badge>
                <Input
                  className="border-0 shadow-none text-lg font-semibold h-auto px-0 focus-visible:ring-0"
                  value={sec.title}
                  onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeSection(sec.id)} disabled={sections.length === 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">State context (optional)</Label>
                  <Select value={sec.state_code ?? "_none"} onValueChange={(v) => updateSection(sec.id, { state_code: v === "_none" ? undefined : v })}>
                    <SelectTrigger><SelectValue placeholder="National" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">National (all states)</SelectItem>
                      {(states as any[]).map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Dimension focus (optional)</Label>
                  <Select value={sec.dimension ?? "_none"} onValueChange={(v) => updateSection(sec.id, { dimension: v === "_none" ? undefined : v })}>
                    <SelectTrigger><SelectValue placeholder="All dimensions" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">All dimensions</SelectItem>
                      {DIMENSIONS.map((d) => <SelectItem key={d} value={d}>{d.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Author prompt (what should this section cover?)</Label>
                <Textarea
                  rows={2}
                  value={sec.prompt}
                  placeholder="e.g. Explain the fiscal pressure on Kano in light of falling FAAC and rising debt service."
                  onChange={(e) => updateSection(sec.id, { prompt: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Button size="sm" variant="secondary" onClick={() => generateSection(sec)} disabled={sec.loading}>
                  {sec.loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate with AI
                </Button>
                <span className="text-xs text-muted-foreground">{sec.body.length} chars</span>
              </div>
              <Textarea
                rows={8}
                value={sec.body}
                onChange={(e) => updateSection(sec.id, { body: e.target.value })}
                placeholder="AI output appears here — edit freely."
              />
              {sec.body && (
                <div className="rounded-md border bg-muted/30 p-4 prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{sec.body}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" onClick={addSection} className="w-full">
          <Plus className="h-4 w-4 mr-2" />Add section
        </Button>
      </div>

      <div className="flex items-center justify-end gap-2 sticky bottom-4">
        <Button variant="outline" onClick={() => saveReport(false)} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />Save draft
        </Button>
        <Button onClick={() => saveReport(true)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Publish
        </Button>
      </div>
    </div>
  );
}
