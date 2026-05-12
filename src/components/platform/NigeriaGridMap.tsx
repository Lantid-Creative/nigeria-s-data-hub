import { Link } from "@tanstack/react-router";

// Approximate geographic grid for Nigeria's 36 states + FCT (6 rows × 8 cols).
// Cells are state codes; null = empty cell.
const GRID: (string | null)[][] = [
  [null, "SO", "ZA", "KT", "JI", "YO", "BO", null],
  [null, "KE", "KN", "KD", "BA", "GO", null, null],
  ["NI", "FC", "PL", "NA", "TA", null, null, null],
  ["KW", "OY", "KO", "BE", "EN", "EB", "CR", null],
  ["OG", "OS", "EK", "ON", "AN", "IM", "AB", null],
  [null, "LA", null, "ED", "DE", "BY", "RI", "AK"],
];

function tone(v: number) {
  if (v >= 75) return "bg-emerald-500/85 text-white";
  if (v >= 60) return "bg-emerald-400/70";
  if (v >= 50) return "bg-gold/70";
  if (v >= 40) return "bg-orange-400/70";
  return "bg-destructive/70 text-white";
}

export function NigeriaGridMap({ scores }: { scores: any[] }) {
  const byCode = new Map(scores.map((s: any) => [s.state_code, s]));
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-1.5">
        {GRID.flatMap((row, ri) =>
          row.map((code, ci) => {
            if (!code) return <div key={`${ri}-${ci}`} className="aspect-square" />;
            const s: any = byCode.get(code);
            const v = s ? Math.round(Number(s.resilience_index ?? 0)) : 0;
            const name = s?.states?.name ?? code;
            return (
              <Link
                key={code}
                to="/ngf/states"
                className={`group relative aspect-square rounded-md p-1.5 text-[10px] font-medium transition hover:scale-110 ${s ? tone(v) : "bg-muted text-muted-foreground"}`}
              >
                <div className="truncate">{code}</div>
                <div className="text-[9px] opacity-80">{s ? v : "—"}</div>
                <div className="pointer-events-none absolute -top-12 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] text-background group-hover:block">
                  {name} · SNRI {s ? v : "n/a"}
                </div>
              </Link>
            );
          })
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500/85" /> ≥75</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-400/70" /> 60–74</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gold/70" /> 50–59</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-orange-400/70" /> 40–49</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-destructive/70" /> &lt;40</span>
      </div>
    </div>
  );
}
