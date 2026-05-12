// Lovable AI powered insights endpoint
// Modes: prediction | automation | report | research
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  prediction:
    "You are a senior policy foresight analyst for the Nigeria Governors' Forum. Given scenario data and the current National Sub-national Resilience Index (SNRI), produce a concise predictive briefing: 3 likely outcomes, 3 leading indicators to watch, and 2 high-leverage policy moves. Use markdown with short sections and bullet points. Be specific to Nigerian sub-national governance.",
  automation:
    "You are an operations strategist for the NGF Secretariat. Given recent alerts and submission status, propose an automation playbook: triggers, recommended actions, owners, and SLA. Output a markdown table plus a short rationale. Keep it crisp and actionable.",
  report:
    "You are a publications editor for NGF. Summarize the report library into an executive digest: themes, top 3 must-reads with one-line takeaways, and 2 recommended next publications based on gaps. Use markdown.",
  research:
    "You are the head of the NGF Research Lab. Given the active research portfolio, produce: portfolio health (1-2 lines), risks/blockers, suggested next field studies (3, with hypothesis + method), and one syntheses opportunity. Markdown only.",
  briefing:
    "You are the chief of staff briefing the NGF Director-General. Given national SNRI, dimension averages, reporting status and live alerts, produce a 90-second executive briefing: headline (1 line), 3 key signals, 2 risks, 2 recommended decisions for this week. Markdown, terse.",
  snri:
    "You are a sub-national resilience analyst. Given the national SNRI trend and dimension-level performance, explain: what's driving the index, top 3 strongest and weakest dimensions, divergence across states, and 3 corrective policy levers. Markdown.",
  state_advisor:
    "You are a senior advisor to a Nigerian State Governor. Given the state's latest SNRI, dimension scores, peer rank, recent alerts and outstanding survey submissions, produce: 1-line state of play, top 3 priorities for the next 30 days, 2 quick wins, and 1 risk to escalate. Markdown, action-first.",
  benchmark:
    "You are a comparative governance analyst. Given the state's scores vs zonal and national peers, identify where the state leads, where it lags, and 3 peers to learn from (with the specific practice to study). Markdown.",
  survey_helper:
    "You are a data quality coach for state planning officers. Given a survey's open questions and the state's previous submissions, suggest plausible value ranges, common pitfalls, and a checklist before submitting. Markdown.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, context, model } = await req.json();
    const system = SYSTEM_PROMPTS[mode];
    if (!system) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMsg =
      typeof context === "string" ? context : "```json\n" + JSON.stringify(context, null, 2) + "\n```";

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-insights error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
