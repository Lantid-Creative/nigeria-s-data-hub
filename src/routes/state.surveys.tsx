import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SURVEY_INSTRUMENTS } from "@/lib/mock-data";
import { CheckCircle2, ChevronRight, Clock, Save, Send, Upload } from "lucide-react";

export const Route = createFileRoute("/state/surveys")({
  component: Surveys,
});

const sections = [
  { id: 1, title: "State Profile & Demographics", q: 12, status: "complete" },
  { id: 2, title: "Fiscal Indicators", q: 18, status: "complete" },
  { id: 3, title: "Human Capital & Social", q: 22, status: "in-progress" },
  { id: 4, title: "Infrastructure & Services", q: 16, status: "pending" },
  { id: 5, title: "Climate & Environment", q: 14, status: "pending" },
  { id: 6, title: "Security & Conflict", q: 12, status: "pending" },
  { id: 7, title: "Innovation & Digital Economy", q: 18, status: "pending" },
  { id: 8, title: "Governance & Institutions", q: 12, status: "pending" },
];

function Surveys() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Survey Engine"
        description="Submit periodic indicators directly to the NGF Futures Lab"
        action={
          <div className="flex gap-2">
            <Button variant="outline"><Save className="mr-2 h-4 w-4" />Save draft</Button>
            <Button className="bg-primary"><Send className="mr-2 h-4 w-4" />Submit for validation</Button>
          </div>
        }
      />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({SURVEY_INSTRUMENTS.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {SURVEY_INSTRUMENTS.map((s, i) => (
            <Card key={s.id} className={`shadow-soft ${i === 0 ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
              <CardContent className="flex flex-wrap items-center gap-4 p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{s.title}</span>
                    <Badge variant="outline" className="text-[10px]">{s.id}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.sections} sections · {s.questions} questions · Due {s.dueDate}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={s.responseRate} className="h-1.5 max-w-xs" />
                    <span className="text-xs text-muted-foreground">{s.responseRate}% complete</span>
                  </div>
                </div>
                <Button variant={i === 0 ? "default" : "outline"} className={i === 0 ? "bg-primary" : ""}>
                  {i === 0 ? "Continue" : "Open"} <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="submitted" className="mt-6 text-sm text-muted-foreground">No submissions in current cycle.</TabsContent>
        <TabsContent value="archive" className="mt-6 text-sm text-muted-foreground">2024–2025 archive available.</TabsContent>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Section nav */}
        <Card className="shadow-soft lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-display text-lg">Quarterly Core Indicators</CardTitle>
            <p className="text-xs text-muted-foreground">Q1-2026-CORE · 8 sections</p>
          </CardHeader>
          <CardContent className="space-y-1">
            {sections.map((s) => (
              <button key={s.id} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition
                ${s.status === "in-progress" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                <span className="flex items-center gap-2">
                  {s.status === "complete" ? <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" /> :
                   s.status === "in-progress" ? <Clock className="h-4 w-4" /> :
                   <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
                  {s.title}
                </span>
                <span className="text-xs text-muted-foreground">{s.q}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="shadow-soft lg:col-span-8">
          <CardHeader>
            <CardTitle className="font-display text-lg">Section 3 · Human Capital & Social</CardTitle>
            <p className="text-xs text-muted-foreground">22 questions · last saved 4 minutes ago</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>3.1 Total enrolled in basic education</Label>
                <Input placeholder="e.g. 2,450,000" defaultValue="2,481,302" />
              </div>
              <div>
                <Label>3.2 Out-of-school children (estimate)</Label>
                <Input placeholder="e.g. 320,000" defaultValue="287,540" />
              </div>
              <div>
                <Label>3.3 Maternal mortality (per 100k)</Label>
                <Input defaultValue="412" />
              </div>
              <div>
                <Label>3.4 Health workers per 10k</Label>
                <Input defaultValue="14.2" />
              </div>
              <div>
                <Label>3.5 Primary data source</Label>
                <Select defaultValue="state">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="state">State Bureau of Statistics</SelectItem>
                    <SelectItem value="nbs">NBS</SelectItem>
                    <SelectItem value="undp">UNDP / Partners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>3.6 Reporting period</Label>
                <Input defaultValue="Q4 2025" />
              </div>
            </div>

            <div>
              <Label>3.7 Notes & contextual narrative</Label>
              <Textarea rows={4} placeholder="Provide narrative context for the indicators above…" />
            </div>

            <div>
              <Label>Supporting evidence</Label>
              <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/40 p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <div className="mt-2 text-sm">Drop files or <span className="text-primary underline">browse</span></div>
                  <div className="text-xs text-muted-foreground">PDF, XLSX, CSV up to 25MB</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t pt-4">
              <Button variant="ghost">← Previous section</Button>
              <Button className="bg-primary">Next: Infrastructure & Services →</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
