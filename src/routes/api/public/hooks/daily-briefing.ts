import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/hooks/daily-briefing")({
  server: {
    handlers: {
      POST: async () => {
        const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
        const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;
        if (!SUPABASE_URL || !SERVICE_KEY || !LOVABLE_API_KEY) {
          return new Response(JSON.stringify({ error: "missing-env" }), { status: 500 });
        }

        const supa = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

        const [{ data: scores = [] }, { data: alerts = [] }, { data: subs = [] }] = await Promise.all([
          supa.from("state_scores").select("state_code, resilience_index, economic, fiscal, human_capital, climate, governance, security, social").order("created_at", { ascending: false }).limit(36),
          supa.from("alerts").select("title,level,audience,created_at").order("created_at", { ascending: false }).limit(20),
          supa.from("survey_submissions").select("status, completion_pct"),
        ]);

        const safeScores = scores ?? [];
        const safeAlerts = alerts ?? [];
        const safeSubs = subs ?? [];
        const nationalSnri = safeScores.length
          ? +(safeScores.reduce((a: number, s: any) => a + Number(s.resilience_index ?? 0), 0) / safeScores.length).toFixed(1)
          : 0;
        const reporting = new Set(safeSubs.filter((s: any) => s.status !== "not_started").map((s: any) => s.state_code)).size;

        const ctx = {
          national_snri: nationalSnri,
          states_reporting: reporting,
          high_alerts: safeAlerts.filter((a: any) => a.level === "high").length,
          recent_alerts: safeAlerts.slice(0, 8),
          top_scores: safeScores.slice(0, 5),
          bottom_scores: [...safeScores].sort((a: any, b: any) => Number(a.resilience_index) - Number(b.resilience_index)).slice(0, 5),
        };

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are the chief of staff briefing the NGF Director-General. Output JSON: {\"summary\":string, \"bullets\":string[]} with 5 short bullets." },
              { role: "user", content: "```json\n" + JSON.stringify(ctx, null, 2) + "\n```" },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (!aiResp.ok) {
          const txt = await aiResp.text();
          return new Response(JSON.stringify({ error: "ai-failed", detail: txt }), { status: 502 });
        }
        const aiJson = await aiResp.json();
        let parsed = { summary: "", bullets: [] as string[] };
        try { parsed = JSON.parse(aiJson.choices?.[0]?.message?.content ?? "{}"); } catch { /* ignore */ }

        const today = new Date().toISOString().slice(0, 10);
        const { error } = await supa.from("ai_briefings").upsert({
          briefing_date: today,
          scope: "national",
          summary: parsed.summary || "",
          bullets: parsed.bullets || [],
        }, { onConflict: "briefing_date,scope" } as any);

        return Response.json({ ok: true, date: today, error: error?.message ?? null });
      },
    },
  },
});
