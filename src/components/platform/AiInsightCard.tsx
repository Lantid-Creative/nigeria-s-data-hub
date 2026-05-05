import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "prediction" | "automation" | "report" | "research";

export function AiInsightCard({
  mode,
  title,
  description,
  context,
  autoRun = false,
}: {
  mode: Mode;
  title: string;
  description?: string;
  context: any;
  autoRun?: boolean;
}) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: { mode, context },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setContent((data as any)?.content ?? "");
      setHasRun(true);
    } catch (e: any) {
      toast.error(e?.message ?? "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  // auto run on first mount when context is ready
  if (autoRun && !hasRun && !loading && context) {
    // fire-and-forget; guarded by hasRun
    void run();
  }

  return (
    <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
            <Badge variant="outline" className="ml-1 text-[10px]">AI</Badge>
          </CardTitle>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        <Button size="sm" variant="outline" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : hasRun ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          <span className="ml-1.5">{loading ? "Thinking…" : hasRun ? "Regenerate" : "Generate"}</span>
        </Button>
      </CardHeader>
      <CardContent>
        {!content && !loading && (
          <p className="text-sm text-muted-foreground">Click <span className="font-medium">Generate</span> for an AI briefing based on the latest data.</p>
        )}
        {loading && !content && (
          <div className="space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        )}
        {content && (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
