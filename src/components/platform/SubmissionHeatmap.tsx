import { useMemo } from "react";

function cellColor(pct: number, status: string) {
  if (status === "approved") return "bg-emerald-500/85 text-white";
  if (status === "submitted") return "bg-emerald-400/70";
  if (pct >= 60) return "bg-gold/70";
  if (pct >= 20) return "bg-orange-400/70";
  if (pct > 0) return "bg-destructive/40";
  return "bg-muted text-muted-foreground";
}

export function SubmissionHeatmap({
  surveys,
  submissions,
  states,
}: {
  surveys: any[];
  submissions: any[];
  states: any[];
}) {
  const map = useMemo(() => {
    const m = new Map<string, any>();
    for (const s of submissions) m.set(`${s.state_code}::${s.survey_id}`, s);
    return m;
  }, [submissions]);

  const sorted = [...states].sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-[10px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-background p-1 text-left font-medium text-muted-foreground">State</th>
            {surveys.map((s: any) => (
              <th key={s.id} className="p-1 text-left font-medium text-muted-foreground" title={s.title}>
                {s.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((st: any) => (
            <tr key={st.code}>
              <td className="sticky left-0 z-10 whitespace-nowrap bg-background pr-2 font-medium">{st.code}</td>
              {surveys.map((sv: any) => {
                const sub = map.get(`${st.code}::${sv.id}`);
                const pct = sub?.completion_pct ?? 0;
                const status = sub?.status ?? "not_started";
                return (
                  <td key={sv.id}>
                    <div
                      title={`${st.name} · ${sv.code} — ${pct}% (${status})`}
                      className={`h-6 w-full min-w-[28px] rounded ${cellColor(pct, status)} grid place-items-center text-[9px] font-medium`}
                    >
                      {pct ? `${pct}` : ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500/85" /> Approved</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-400/70" /> Submitted</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gold/70" /> ≥60%</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-orange-400/70" /> 20–59%</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-destructive/40" /> &lt;20%</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted" /> Not started</span>
      </div>
    </div>
  );
}
