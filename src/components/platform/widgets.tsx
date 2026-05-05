import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

export function StatCard({
  label, value, icon: Icon, delta, deltaLabel, accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: number;
  deltaLabel?: string;
  accent?: "primary" | "gold" | "info" | "destructive";
}) {
  const tone =
    accent === "gold" ? "bg-gold/15 text-gold-foreground" :
    accent === "info" ? "bg-[color:var(--info)]/15 text-[color:var(--info)]" :
    accent === "destructive" ? "bg-destructive/10 text-destructive" :
    "bg-primary/10 text-primary";

  const positive = (delta ?? 0) >= 0;

  return (
    <Card className="shadow-soft">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-3xl text-foreground">{value}</div>
          {delta !== undefined && (
            <div className={cn("mt-1 inline-flex items-center gap-1 text-xs",
              positive ? "text-[color:var(--success)]" : "text-destructive")}>
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? "+" : ""}{delta}%
              {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-lg", tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionHeader({
  title, description, action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl text-foreground md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageBackground({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}
