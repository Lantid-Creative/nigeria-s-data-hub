import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, clientKey } from "@/lib/rate-limit.server";

export const Route = createFileRoute("/api/public/hooks/anomaly-sweep")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rl = await checkRateLimit({ bucket: "anomaly-sweep", key: clientKey(request), limit: 6, windowSec: 3600 });
        if (!rl.ok) return new Response("rate-limited", { status: 429 });

        const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
        const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;
        if (!SUPABASE_URL || !SERVICE_KEY) return new Response("missing-env", { status: 500 });
        const supa = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

        const { data: scores = [] } = await supa.from("state_scores")
          .select("state_code, resilience_index, economic, fiscal, human_capital, climate, governance, security, social, created_at")
          .order("created_at", { ascending: false }).limit(200);

        if (!scores?.length) return Response.json({ ok: true, anomalies: 0, note: "no scores" });

        let anomalies: Array<{ state: string; dimension: string; magnitude: number; cause: string }> = [];
        if (LOVABLE_API_KEY) {
          const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "Detect anomalies in Nigerian state resilience scores. Output JSON {\"anomalies\":[{\"state\":string,\"dimension\":string,\"magnitude\":number,\"cause\":string}]} with up to 5 entries." },
                { role: "user", content: "```json\n" + JSON.stringify(scores.slice(0, 60), null, 2) + "\n```" },
              ],
              response_format: { type: "json_object" },
            }),
          });
          if (r.ok) {
            const j = await r.json();
            try { anomalies = JSON.parse(j.choices?.[0]?.message?.content ?? "{}").anomalies ?? []; } catch { /* ignore */ }
          }
        }

        // Write each as an alert
        for (const a of anomalies) {
          await supa.from("alerts").insert({
            title: `Anomaly — ${a.state} ${a.dimension}`,
            body: `${a.cause} (magnitude ${a.magnitude})`,
            level: Math.abs(a.magnitude) >= 10 ? "high" : "medium",
            audience: "all",
          });
        }

        return Response.json({ ok: true, anomalies: anomalies.length });
      },
    },
  },
});
