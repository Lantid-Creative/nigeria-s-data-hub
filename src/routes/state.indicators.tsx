import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDimensions, useIndicators, useStateCode, useStateScores, scoreFor } from "@/lib/state-data";
import { ArrowDown, ArrowUp } from "lucide-react";

export const Route = createFileRoute("/state/indicators")({ component: Indicators });

function Indicators() {
  const code = useStateCode();
  const { data: dims = [] } = useDimensions();
  const { data: inds = [] } = useIndicators();
  const { data: scores = [] } = useStateScores(code);
  const latest = scores[scores.length - 1];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Indicators"
        description="Track all 48 indicators across the 7 SNRi resilience dimensions"
      />

      <Tabs defaultValue={dims[0]?.code ?? "ECON"}>
        <TabsList className="flex-wrap">
          {dims.map((d: any) => (
            <TabsTrigger key={d.code} value={d.code}>
              {d.name.replace(/ Resilience.*/, "").replace("& Environmental", "").replace("Governance & Institutional", "Governance")}
            </TabsTrigger>
          ))}
        </TabsList>

        {dims.map((d: any) => {
          const dimInds = inds.filter((i: any) => i.dimension_code === d.code);
          const dimScore = latest ? scoreFor(latest, d.code) : null;
          return (
            <TabsContent key={d.code} value={d.code} className="mt-6 space-y-4">
              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-lg">{d.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{d.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Dimension score</div>
                    <div className="font-display text-3xl text-primary">{dimScore?.toFixed(0) ?? "—"}</div>
                  </div>
                </CardHeader>
                <CardContent className="divide-y p-0">
                  {dimInds.map((i: any) => (
                    <div key={i.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{i.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {i.sub_component ?? "—"}{i.source ? ` · ${i.source}` : ""}
                        </div>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        {i.direction === "+" ? <ArrowUp className="h-3 w-3 text-[color:var(--success)]" /> : <ArrowDown className="h-3 w-3 text-destructive" />}
                        {i.direction === "+" ? "Higher better" : "Lower better"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
