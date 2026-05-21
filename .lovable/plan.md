# MyAdam / NGF Data → Insight System — Master Plan

This plan covers the full loop: **State data collection → validation → scoring → NGF analytics → AI insight + research depth → publishing**. It builds on what already exists (state portal, NGF command centre, SNRI scoring, AI Insight Cards, choropleth, scenario builder) and fills the missing pieces.

---

## 1. The Data Model (what we collect)

Three layers of evidence per state, per reporting cycle (Q1/Q2/Q3/Q4 or annual):

**A. Quantitative indicators** (numbers, ratios, %)
- 7 SNRI dimensions: Economic, Fiscal, Social, Security, Climate, Human Capital, Governance.
- Each dimension has ~5–10 indicators (e.g., IGR per capita, debt/GDP, OOSC rate, U5MR, flood risk index, etc.) — already seeded in `indicators` table.
- Each indicator has: value, unit, period, source, evidence file, confidence (self-reported / verified / modeled).

**B. Qualitative narrative** (free text + structured)
- Per dimension: "What changed this cycle?", "Biggest risk", "Flagship reform", "Ask of NGF".
- Per commitment: progress %, status, blockers, next milestone.

**C. Evidence attachments** (PDFs, images, datasets)
- Budget docs, audit reports, project photos, MoUs, gazettes.
- Stored in `evidence` bucket with signed URLs, indexed against the question.

---

## 2. The State Submission Flow (the form they fill)

A guided **wizard** under `/state/indicators` (replaces the current flat page):

```text
Step 1  Welcome + cycle context  →  shows due date, % complete, last cycle's score
Step 2  Dimension picker          →  7 cards, color-coded by completion
Step 3  Indicator entry (per dim) →  number input + unit + period + source dropdown
                                       + "Upload evidence" + "Add note"
                                       + auto-validation (range check, YoY delta flag)
Step 4  Narrative                 →  4 structured prompts per dimension
Step 5  Commitments review        →  update progress on prior commitments
Step 6  Review & submit           →  diff vs last cycle, completeness score,
                                       AI pre-flight check ("3 outliers detected")
Step 7  Submit for NGF review     →  status → 'submitted', triggers reviewer queue
```

Key UX rules:
- **Autosave every field** to `survey_submissions.payload` (jsonb).
- **Inline AI helper** ("Survey Helper" mode already exists) — suggests sources, flags inconsistencies.
- **Evidence preview** — PDF/image lightbox with signed URLs (TanStack server fn).
- **Mobile-friendly** — DGs and PSs often fill on tablets.

---

## 3. Validation & Review (NGF side)

After submit:

1. **Automated checks** (server fn on submit)
   - Range bounds (e.g., literacy 0–100).
   - YoY delta > 30% → flag.
   - Missing evidence on high-weight indicators → flag.
   - Cross-indicator coherence (e.g., debt up + IGR down + capex up → flag).

2. **NGF reviewer queue** (`/ngf/inbox`)
   - Each submission → row with completeness, flag count, AI risk score.
   - Reviewer opens → sees state's answers + evidence + diff vs last cycle.
   - Actions: Approve / Request revision (with `reviewer_feedback`) / Override value.

3. **Scoring trigger** — on approve, recompute `state_scores` for that cycle.

---

## 4. Scoring → SNRI (already exists, formalize)

- Each indicator normalized 0–100 (min-max across 36 states).
- Dimension score = weighted mean of its indicators.
- SNRI = weighted mean of 7 dimensions (weights configurable in `/ngf/snri`).
- Persist in `state_scores`. Recompute on every approved submission.

---

## 5. NGF Insight Surface (what admin sees)

Already built — this confirms how each piece is fed by the loop:

| Surface | Data source | AI mode |
|---|---|---|
| `/ngf` overview | `state_scores` + choropleth | `briefing` |
| `/ngf/diff` | two cycles of `state_scores` | `narrative` |
| `/ngf/states` | per-state drill | `state_advisor` |
| `/ngf/analytics` | indicator-level trends | `ask_data` |
| `/ngf/risks` | `risk_register` + auto-flags from validation | `anomaly` |
| `/ngf/foresight` + `/ngf/scenarios` | `scenarios` + `saved_scenarios` | `prediction` |
| `/ngf/horizon` | `horizon_signals` | `hotspot` |
| `/ngf/press` | `press_clippings` | sentiment AI |
| `/ngf/grants` | `grants_registry` kanban | — |
| `/ngf/engagement` | `governor_engagement` timeline | — |
| `/ngf/research` | `research_projects` + ask-data | `research` |
| `/ngf/briefing` | aggregates everything | `briefing` (daily cron) |

---

## 6. Research Depth (what's still missing)

This is the gap the user is pointing at — going from "dashboard" to "research".

**Build:**

1. **Ask-Data v2** (`/ngf/askdata`)
   - Free-text question → server fn translates to SQL against indicator history → table + chart + AI narrative.
   - "Why did Kano's fiscal score drop in Q2?" → returns indicators that moved, evidence links, press clippings, commitment status.

2. **Deep-Dive Report Builder** (`/ngf/reports` + new `/ngf/reports/new`)
   - Pick: states, dimensions, cycles, lens (compare / trend / rank).
   - Generates a multi-page report (charts + AI narrative per section) → save to `reports` table → publishable to public site.

3. **Indicator Explorer**
   - One indicator across 36 states × N cycles → small-multiples chart + outlier callouts.

4. **Evidence Search**
   - Full-text search across `evidence_uploads` filenames + extracted text (Lovable AI OCR on upload).

5. **Cohort Analysis**
   - Group states by zone, GDP tier, party — compare SNRI movement.

---

## 7. Automation Loop

- **Daily cron** → `daily-briefing` (exists) → writes `ai_briefings`.
- **Weekly cron** → `weekly-digest` (exists) → email NGF leadership.
- **On submission** → anomaly sweep → flag risks → notify reviewer.
- **On approval** → recompute scores → invalidate caches → push alert to subscribed states.
- **Submission nudges** (exists) → escalate by week to cycle close.

---

## 8. What's Already Built vs. To Build

**Already in place**
- Tables, RLS, roles, auth, scoring, choropleth, scenarios, kanban grants, diff view, press sentiment, AI Insight Cards (14 modes), 4 cron hooks, public ticker, SEO.

**To build (in order)**
1. **Indicator entry wizard** (Section 2) — replaces flat `/state/indicators`.
2. **Validation engine** (Section 3) — server fn `validateSubmission` + reviewer queue enhancements.
3. **Evidence preview with signed URLs** (Section 2).
4. **Ask-Data v2 SQL synthesis** (Section 6.1).
5. **Deep-Dive Report Builder** (Section 6.2).
6. **Indicator Explorer + Cohort Analysis** (Section 6.3–6.5).
7. **OCR on evidence upload** (Section 6.4) — Lovable AI vision.

---

## 9. Technical Notes

- All new server logic = `createServerFn` in `src/lib/*.functions.ts` (not edge functions).
- Wizard state = local + autosave to `survey_submissions.payload` jsonb.
- AI calls go through existing `ai-insights` edge function (already deployed) or new `createServerFn` wrappers around Lovable AI Gateway.
- Validation rules live in a new `indicator_rules` table (min, max, expected_yoy_delta) — seedable per indicator.
- Reports generated server-side as HTML → printable / PDF via browser; stored URL in `reports.file_url`.

---

## 10. Suggested Build Order (if you say "do it")

**Phase 1 — Close the data-in loop** (highest leverage)
- Indicator wizard, validation engine, evidence preview, reviewer queue v2.

**Phase 2 — Research depth**
- Ask-Data v2, Indicator Explorer, Cohort Analysis.

**Phase 3 — Output**
- Deep-Dive Report Builder, OCR evidence search, auto-publish to public site.

Tell me **"do Phase 1"** (or all) and I'll build it.
