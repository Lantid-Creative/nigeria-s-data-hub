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
