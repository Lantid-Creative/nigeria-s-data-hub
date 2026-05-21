
CREATE TABLE IF NOT EXISTS public.indicator_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  min_value numeric,
  max_value numeric,
  max_yoy_delta_pct numeric,
  requires_evidence boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (indicator_id)
);

ALTER TABLE public.indicator_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ir authed read" ON public.indicator_rules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ir ngf all" ON public.indicator_rules
  FOR ALL USING (has_role(auth.uid(), 'ngf_staff'::app_role))
  WITH CHECK (has_role(auth.uid(), 'ngf_staff'::app_role));

ALTER TABLE public.survey_submissions
  ADD COLUMN IF NOT EXISTS flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_risk_score integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.survey_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_state ON public.survey_submissions(state_code);
