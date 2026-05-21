// Client-side validation engine for state survey submissions.
// Mirrors the rules in `indicator_rules` and applies simple checks
// across a payload keyed by indicator/question code.

export type ValidationFlag = {
  code: string;
  label: string;
  severity: "info" | "warn" | "error";
  message: string;
};

export type IndicatorRule = {
  indicator_id: string;
  min_value: number | null;
  max_value: number | null;
  max_yoy_delta_pct: number | null;
  requires_evidence: boolean;
};

export type IndicatorLike = {
  id: string;
  name: string;
  direction: string | null;
  dimension_code: string;
};

/**
 * Validate a draft payload against indicators + rules + prior-cycle values.
 * Payload is `{ [indicatorCode]: number | string }`.
 * priorValues is `{ [indicatorCode]: number }` (last cycle).
 * evidenceCodes is the set of question codes that have at least one upload.
 */
export function validatePayload(opts: {
  payload: Record<string, unknown>;
  indicators: IndicatorLike[];
  rules: IndicatorRule[];
  priorValues?: Record<string, number>;
  evidenceCodes?: Set<string>;
}): ValidationFlag[] {
  const { payload, indicators, rules, priorValues = {}, evidenceCodes = new Set() } = opts;
  const ruleByInd = new Map(rules.map((r) => [r.indicator_id, r]));
  const flags: ValidationFlag[] = [];

  for (const ind of indicators) {
    const raw = payload[ind.id] ?? payload[ind.name];
    if (raw === undefined || raw === "" || raw === null) continue;
    const num = Number(raw);
    if (Number.isNaN(num)) continue;
    const rule = ruleByInd.get(ind.id);

    if (rule?.min_value != null && num < rule.min_value) {
      flags.push({
        code: ind.id,
        label: ind.name,
        severity: "error",
        message: `Value ${num} is below allowed minimum (${rule.min_value}).`,
      });
    }
    if (rule?.max_value != null && num > rule.max_value) {
      flags.push({
        code: ind.id,
        label: ind.name,
        severity: "error",
        message: `Value ${num} exceeds allowed maximum (${rule.max_value}).`,
      });
    }

    const prior = priorValues[ind.id];
    const cap = rule?.max_yoy_delta_pct ?? 30;
    if (prior != null && prior !== 0) {
      const delta = Math.abs(((num - prior) / prior) * 100);
      if (delta > cap) {
        flags.push({
          code: ind.id,
          label: ind.name,
          severity: "warn",
          message: `Year-on-year change of ${delta.toFixed(0)}% exceeds expected ${cap}%.`,
        });
      }
    }

    if (rule?.requires_evidence && !evidenceCodes.has(ind.id)) {
      flags.push({
        code: ind.id,
        label: ind.name,
        severity: "warn",
        message: "Evidence file required for this indicator.",
      });
    }
  }

  return flags;
}

export function riskScore(flags: ValidationFlag[]): number {
  // 0 (clean) .. 100 (very risky)
  let s = 0;
  for (const f of flags) s += f.severity === "error" ? 25 : f.severity === "warn" ? 10 : 3;
  return Math.min(100, s);
}

export function severityColor(sev: ValidationFlag["severity"]): string {
  return sev === "error"
    ? "text-destructive"
    : sev === "warn"
    ? "text-[color:var(--warning,oklch(0.7_0.18_70))]"
    : "text-muted-foreground";
}
