import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicSnriSnapshot } from "@/lib/public.functions";

function tone(v: number) {
  if (v >= 70) return "text-emerald-300";
  if (v >= 55) return "text-amber-300";
  return "text-rose-300";
}

export function SnriTicker() {
  const fetcher = useServerFn(getPublicSnriSnapshot);
  const { data } = useQuery({
    queryKey: ["public-snri"],
    queryFn: () => fetcher(),
    refetchInterval: 60_000,
  });

  const rows = data?.rows ?? [];
  if (!rows.length) return null;

  // duplicate for seamless marquee
  const loop = [...rows, ...rows];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-foreground py-2 text-background">
      <div className="flex items-center gap-3 px-4">
        <span className="shrink-0 rounded-sm bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
          Live SNRI
        </span>
        <span className="shrink-0 text-xs text-background/70">
          National avg{" "}
          <span className="font-display text-base text-background">{data?.national ?? "—"}</span>
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex min-w-max animate-[snri-scroll_60s_linear_infinite] gap-6 whitespace-nowrap">
            {loop.map((r, i) => (
              <span key={`${r.code}-${i}`} className="text-xs">
                <span className="font-mono font-semibold">{r.code}</span>{" "}
                <span className={`font-display ${tone(r.snri)}`}>{r.snri}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes snri-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
