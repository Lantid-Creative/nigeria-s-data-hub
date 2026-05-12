// Lovable AI powered insights endpoint
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  prediction:
    "You are a senior policy foresight analyst for the Nigeria Governors' Forum. Given scenario data and the current National Sub-national Resilience Index (SNRI), produce a concise predictive briefing: 3 likely outcomes, 3 leading indicators to watch, and 2 high-leverage policy moves. Use markdown.",
  automation:
    "You are an operations strategist for the NGF Secretariat. Given recent alerts and submission status, propose an automation playbook: triggers, recommended actions, owners, and SLA. Output a markdown table plus a short rationale.",
  report:
    "You are a publications editor for NGF. Summarize the report library into an executive digest: themes, top 3 must-reads with one-line takeaways, and 2 recommended next publications. Markdown.",
  research:
    "You are the head of the NGF Research Lab. Given the active research portfolio, produce: portfolio health, risks/blockers, suggested next field studies (3, with hypothesis + method), and one synthesis opportunity. Markdown.",
  briefing:
    "You are the chief of staff briefing the NGF Director-General. Produce a 90-second executive briefing: headline (1 line), 3 key signals, 2 risks, 2 recommended decisions for this week. Markdown, terse.",
  snri:
    "You are a sub-national resilience analyst. Explain what's driving the SNRI, top 3 strongest and weakest dimensions, divergence across states, and 3 corrective policy levers. Markdown.",
  state_advisor:
    "You are a senior advisor to a Nigerian State Governor. Produce: 1-line state of play, top 3 priorities for the next 30 days, 2 quick wins, and 1 risk to escalate. Markdown.",
  benchmark:
    "You are a comparative governance analyst. Identify where the state leads, where it lags, and 3 peers to learn from with the specific practice to study. Markdown.",
  survey_helper:
    "You are a data quality coach for state planning officers. Suggest plausible value ranges, common pitfalls, and a checklist before submitting. Markdown.",
  anomaly:
    "You are a data anomaly analyst for NGF. Given recent state score movements and submission patterns, flag the top 5 most unusual signals (state, dimension, magnitude, plausible cause, suggested follow-up). Markdown table.",
  narrative:
    "You are a policy report writer for NGF. Given a state's scores and dimension breakdown, draft a 200-word state profile narrative covering: status, drivers, risks, and outlook. Markdown.",
  ask_data:
    "You are an analyst answering natural-language questions about Nigeria's sub-national resilience data. Use only the JSON context provided; if the answer is not derivable, say so plainly. Be specific, cite numbers, and keep it under 200 words. Markdown.",
  hotspot:
    "You are a national risk monitor for NGF. Given the latest scores per state, identify hotspot states (lowest performers, sharpest declines), the dimensions driving the issue, and 2 immediate recommended interventions. Markdown.",
  pilot_advisor:
    "You are an innovation strategist for NGF. Given a list of innovation pilots and state contexts, recommend which pilots are best candidates for replication, in which states, and why. Markdown.",
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
