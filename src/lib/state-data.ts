import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useStateCode() {
  const { stateCode } = useAuth();
  return stateCode ?? "KD";
}

export function useStateRow(code: string) {
  return useQuery({
    queryKey: ["state", code],
    queryFn: async () => {
      const { data, error } = await supabase.from("states").select("*").eq("code", code).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCurrentCycle() {
  return useQuery({
    queryKey: ["current-cycle"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reporting_cycles").select("*").eq("is_current", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAllCycles() {
  return useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reporting_cycles").select("*").order("starts_on");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useStateScores(code: string) {
  return useQuery({
    queryKey: ["state-scores", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_scores")
        .select("*, reporting_cycles(code,label,starts_on,is_current)")
        .eq("state_code", code)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllStatesLatestScores() {
  return useQuery({
    queryKey: ["all-states-scores"],
    queryFn: async () => {
      const { data: cycle } = await supabase.from("reporting_cycles").select("id").eq("is_current", true).maybeSingle();
      if (!cycle) return [];
      const { data, error } = await supabase
        .from("state_scores")
        .select("*, states(name,zone_code)")
        .eq("cycle_id", cycle.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDimensions() {
  return useQuery({
    queryKey: ["dimensions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dimensions").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useIndicators() {
  return useQuery({
    queryKey: ["indicators"],
    queryFn: async () => {
      const { data, error } = await supabase.from("indicators").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSurveys() {
  return useQuery({
    queryKey: ["surveys"],
    queryFn: async () => {
      const { data, error } = await supabase.from("surveys").select("*").order("due_date");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSurveyStructure(surveyId: string | undefined) {
  return useQuery({
    queryKey: ["survey-structure", surveyId],
    enabled: !!surveyId,
    queryFn: async () => {
      const { data: sections, error: e1 } = await supabase
        .from("survey_sections").select("*").eq("survey_id", surveyId!).order("sort_order");
      if (e1) throw e1;
      const ids = (sections ?? []).map((s) => s.id);
      if (!ids.length) return [];
      const { data: questions, error: e2 } = await supabase
        .from("survey_questions").select("*").in("section_id", ids).order("sort_order");
      if (e2) throw e2;
      return (sections ?? []).map((s) => ({
        ...s,
        questions: (questions ?? []).filter((q) => q.section_id === s.id),
      }));
    },
  });
}

export function useStateSubmissions(code: string) {
  return useQuery({
    queryKey: ["submissions", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_submissions")
        .select("*, surveys(code,title,due_date,sections,questions)")
        .eq("state_code", code);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAlerts(code: string | null) {
  return useQuery({
    queryKey: ["alerts", code],
    queryFn: async () => {
      const { data, error } = await supabase.from("alerts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAlertReads() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["alert-reads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("alert_reads").select("alert_id");
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.alert_id));
    },
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("is_public", true)
        .order("published_on", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

const DIM_KEY: Record<string, "economic" | "fiscal" | "human_capital" | "climate" | "governance" | "security" | "social"> = {
  ECON: "economic",
  FISC: "fiscal",
  HUMAN: "human_capital",
  CLIM: "climate",
  GOV: "governance",
  SEC: "security",
  SOC: "social",
};

export function scoreFor(score: any, dimCode: string): number | null {
  const k = DIM_KEY[dimCode];
  if (!k || !score) return null;
  const v = score[k];
  return v == null ? null : Number(v);
}

// ---------- NGF (admin) hooks ----------

export function useAllStates() {
  return useQuery({
    queryKey: ["states-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("states").select("*, zones(name)").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("zones").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useScenarios() {
  return useQuery({
    queryKey: ["scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("scenarios").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useResearchProjects() {
  return useQuery({
    queryKey: ["research"],
    queryFn: async () => {
      const { data, error } = await supabase.from("research_projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInnovationPilots() {
  return useQuery({
    queryKey: ["pilots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("innovation_pilots").select("*, states(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllSubmissions() {
  return useQuery({
    queryKey: ["all-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_submissions")
        .select("*, surveys(code,title,due_date), states(name,zone_code)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useNationalSnriTrend() {
  // Avg resilience_index per cycle across all states
  return useQuery({
    queryKey: ["snri-trend"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_scores")
        .select("resilience_index, reporting_cycles(code,label,starts_on)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const groups = new Map<string, { period: string; sum: number; n: number; sort: string }>();
      for (const row of (data ?? []) as any[]) {
        const c = row.reporting_cycles;
        if (!c) continue;
        const key = c.code;
        const g = groups.get(key) ?? { period: c.label, sum: 0, n: 0, sort: c.starts_on };
        g.sum += Number(row.resilience_index ?? 0);
        g.n += 1;
        groups.set(key, g);
      }
      return Array.from(groups.values())
        .sort((a, b) => a.sort.localeCompare(b.sort))
        .map((g) => ({ period: g.period, index: +(g.sum / Math.max(g.n, 1)).toFixed(1) }));
    },
  });
}

export type ScoreRow = {
  state_code: string;
  resilience_index: number | null;
  fiscal: number | null;
  human_capital: number | null;
  climate: number | null;
  security: number | null;
  economic: number | null;
  governance: number | null;
  social: number | null;
  states?: { name: string; zone_code: string } | null;
};
