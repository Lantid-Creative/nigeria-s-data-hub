import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Public, anonymous-safe snapshot for the live SNRI ticker on the landing page.
 * Returns minimal non-sensitive columns: state code, name, latest resilience_index.
 */
export const getPublicSnriSnapshot = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("state_scores")
      .select("state_code, resilience_index, created_at, states(name)")
      .order("created_at", { ascending: false })
      .limit(400);
    if (error) throw error;
    // pick latest per state
    const byCode = new Map<string, any>();
    for (const r of (data ?? []) as any[]) {
      if (!byCode.has(r.state_code)) byCode.set(r.state_code, r);
    }
    const rows = Array.from(byCode.values()).map((r) => ({
      code: r.state_code,
      name: r.states?.name ?? r.state_code,
      snri: Math.round(Number(r.resilience_index ?? 0)),
    })).sort((a, b) => b.snri - a.snri);
    const national = rows.length
      ? +(rows.reduce((a, r) => a + r.snri, 0) / rows.length).toFixed(1)
      : 0;
    return { national, rows };
  }
);
