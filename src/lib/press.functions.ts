import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Score sentiment for press clippings using Lovable AI Gateway.
 * Updates clippings whose sentiment is null or 'neutral' (the default).
 * Caller must be ngf_staff (RLS enforces).
 */
export const scorePressSentiment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { data: rows, error } = await supabase
      .from("press_clippings")
      .select("id,headline,outlet,topic,sentiment")
      .or("sentiment.is.null,sentiment.eq.neutral")
      .limit(40);
    if (error) throw error;
    if (!rows?.length) return { processed: 0, updated: 0 };

    const items = rows.map((r: any, i: number) => ({
      idx: i, headline: r.headline, outlet: r.outlet ?? "", topic: r.topic ?? "",
    }));

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You classify Nigerian press headlines about state governments. For each item return one of: positive | neutral | negative. Reply with strict JSON: {\"results\":[{\"idx\":number,\"sentiment\":string}]}.",
          },
          { role: "user", content: JSON.stringify({ items }) },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) throw new Error(`AI gateway ${resp.status}`);
    const j = await resp.json();
    const content = j?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }
    const results: { idx: number; sentiment: string }[] = parsed.results ?? [];

    let updated = 0;
    for (const r of results) {
      const target = rows[r.idx];
      const s = String(r.sentiment).toLowerCase();
      if (!target || !["positive", "neutral", "negative"].includes(s)) continue;
      if (s === target.sentiment) continue;
      const { error: uerr } = await supabase
        .from("press_clippings").update({ sentiment: s }).eq("id", target.id);
      if (!uerr) updated++;
    }
    return { processed: rows.length, updated };
  });
