import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, clientKey } from "@/lib/rate-limit.server";

export const Route = createFileRoute("/api/public/hooks/weekly-digest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rl = await checkRateLimit({ bucket: "weekly-digest", key: clientKey(request), limit: 6, windowSec: 3600 });
        if (!rl.ok) return new Response("rate-limited", { status: 429 });

        const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
        const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;
        if (!SUPABASE_URL || !SERVICE_KEY) return new Response("missing-env", { status: 500 });
        const supa = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

        const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
        const [{ data: scores = [] }, { data: alerts = [] }, { data: subs = [] }, { data: commits = [] }, { data: risks = [] }] = await Promise.all([
          supa.from("state_scores").select("state_code, resilience_index").order("created_at", { ascending: false }).limit(120),
          supa.from("alerts").select("title,level,created_at").gte("created_at", weekAgo),
          supa.from("survey_submissions").select("status, completion_pct, state_code, updated_at").gte("updated_at", weekAgo),
          supa.from("commitments").select("state_code,title,status,target_date").lte("target_date", new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10)),
          supa.from("risk_register").select("title,probability,impact").gte("created_at", weekAgo),
        ]);

        const safe = <T,>(x: T[] | null) => x ?? [];
        const ctx = {
          period: `Week ending ${new Date().toISOString().slice(0, 10)}`,
          national_snri: safe(scores).length ? +(safe(scores).reduce((a: number, s: any) => a + Number(s.resilience_index ?? 0), 0) / safe(scores).length).toFixed(1) : 0,
          new_alerts: safe(alerts).length,
          high_alerts: safe(alerts).filter((a: any) => a.level === "high").length,
          recent_submissions: safe(subs).slice(0, 10),
          due_commitments: safe(commits).slice(0, 10),
          new_risks: safe(risks).slice(0, 5),
        };

        let summary = "Weekly digest";
        let bullets: string[] = [];
        if (LOVABLE_API_KEY) {
          const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "You are writing the NGF weekly executive digest. Output JSON {\"summary\":string, \"bullets\":string[]} — 6 short bullets covering top movers, overdue commitments, new risks, and one recommendation." },
                { role: "user", content: "```json\n" + JSON.stringify(ctx, null, 2) + "\n```" },
              ],
              response_format: { type: "json_object" },
            }),
          });
          if (r.ok) {
            const j = await r.json();
            try {
              const parsed = JSON.parse(j.choices?.[0]?.message?.content ?? "{}");
              summary = parsed.summary || summary;
              bullets = parsed.bullets || [];
            } catch { /* ignore */ }
          }
        }

        // Recipients = NGF staff
        const { data: staff } = await supa.from("user_roles").select("user_id").eq("role", "ngf_staff");
        const recipients = staff?.length ?? 0;

        await supa.from("digest_log").insert({
          digest_type: "weekly",
          period_label: ctx.period,
          summary,
          payload: { ctx, bullets },
          recipients_count: recipients,
        });

        // Drop an in-app alert so NGF staff see it on next login
        await supa.from("alerts").insert({
          title: `Weekly digest — ${ctx.period}`,
          body: summary + (bullets.length ? "\n\n• " + bullets.join("\n• ") : ""),
          level: "low",
          audience: "all",
        });

        return Response.json({ ok: true, recipients, bullets: bullets.length });
      },
    },
  },
});
