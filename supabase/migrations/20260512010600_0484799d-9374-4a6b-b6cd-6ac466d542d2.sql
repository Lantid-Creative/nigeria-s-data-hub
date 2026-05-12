
-- Survey sections
CREATE TABLE public.survey_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sections_survey ON public.survey_sections(survey_id, sort_order);
ALTER TABLE public.survey_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sections read" ON public.survey_sections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ngf write sections" ON public.survey_sections FOR ALL USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));

-- Survey questions
CREATE TABLE public.survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.survey_sections(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  help_text text,
  question_type text NOT NULL DEFAULT 'number',
  options jsonb,
  unit text,
  required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_questions_section ON public.survey_questions(section_id, sort_order);
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions read" ON public.survey_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ngf write questions" ON public.survey_questions FOR ALL USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));

-- Submission review columns
ALTER TABLE public.survey_submissions
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_notes text;

-- NGF staff can update submissions (to mark approved/rejected)
CREATE POLICY "subs ngf update" ON public.survey_submissions
  FOR UPDATE USING (has_role(auth.uid(),'ngf_staff'))
  WITH CHECK (has_role(auth.uid(),'ngf_staff'));
