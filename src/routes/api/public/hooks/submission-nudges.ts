import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, clientKey } from "@/lib/rate-limit.server";

export const Route = createFileRoute("/api/public/hooks/submission-nudges")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rl = await checkRateLimit({ bucket: "submission-nudges", key: clientKey(request), limit: 6, windowSec: 3600 });
        if (!rl.ok) return new Response("rate-limited", { status: 429 });

        const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
        const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        if (!SUPABASE_URL || !SERVICE_KEY) return new Response("missing-env", { status: 500 });
        const supa = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

        const today = new Date(); today.setUTCHours(0, 0, 0, 0);
        const target = new Date(today.getTime() + 7 * 86400_000).toISOString().slice(0, 10);

        // Find surveys due in the next 7 days
        const { data: surveys = [] } = await supa.from("surveys").select("id,code,title,due_date").lte("due_date", target).gte("due_date", today.toISOString().slice(0, 10));
        const { data: subs = [] } = await supa.from("survey_submissions").select("survey_id,state_code,status,completion_pct");
        const { data: states = [] } = await supa.from("states").select("code");

        let nudges = 0;
        for (const sv of surveys ?? []) {
          const dueIn = Math.ceil((new Date(sv.due_date as string).getTime() - today.getTime()) / 86400_000);
          for (const st of states ?? []) {
            const sub = (subs ?? []).find((x: any) => x.survey_id === sv.id && x.state_code === st.code);
            if (sub && (sub.status === "submitted" || sub.status === "approved")) continue;
            const completion = sub?.completion_pct ?? 0;
            const message = `Reminder: "${sv.title}" closes in ${dueIn} day${dueIn === 1 ? "" : "s"} (${sv.due_date}). Current progress: ${completion}%.`;
            await supa.from("state_nudges").insert({
              state_code: st.code, cycle_id: null, channel: "inapp", message,
            });
            await supa.from("alerts").insert({
              title: `Survey closing soon — ${sv.code}`,
              body: message,
              level: dueIn <= 2 ? "high" : "medium",
              audience: "state",
              state_code: st.code,
            });
            nudges += 1;
          }
        }

        return Response.json({ ok: true, nudges });
      },
    },
  },
});
