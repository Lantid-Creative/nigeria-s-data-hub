
-- Commitments
CREATE TABLE public.commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL,
  cycle_id uuid REFERENCES public.reporting_cycles(id) ON DELETE SET NULL,
  dimension_code text,
  title text NOT NULL,
  description text,
  target_date date,
  status text NOT NULL DEFAULT 'on_track', -- on_track | at_risk | missed | done
  progress integer NOT NULL DEFAULT 0,
  owner text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commitments ngf all" ON public.commitments FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "commitments state read" ON public.commitments FOR SELECT TO public USING (state_code = current_state_code());
CREATE POLICY "commitments state write" ON public.commitments FOR INSERT TO public WITH CHECK (state_code = current_state_code());
CREATE POLICY "commitments state update" ON public.commitments FOR UPDATE TO public USING (state_code = current_state_code());

-- Support tickets
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open', -- open | in_progress | resolved | closed
  priority text NOT NULL DEFAULT 'normal',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tix ngf all" ON public.support_tickets FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "tix state read" ON public.support_tickets FOR SELECT TO public USING (state_code = current_state_code());
CREATE POLICY "tix state insert" ON public.support_tickets FOR INSERT TO public WITH CHECK (state_code = current_state_code());

CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid,
  author_role text NOT NULL, -- state | ngf
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tmsg ngf all" ON public.ticket_messages FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "tmsg state read" ON public.ticket_messages FOR SELECT TO public USING (
  EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.state_code = current_state_code())
);
CREATE POLICY "tmsg state insert" ON public.ticket_messages FOR INSERT TO public WITH CHECK (
  EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.state_code = current_state_code())
);

-- Evidence uploads
CREATE TABLE public.evidence_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL,
  cycle_id uuid REFERENCES public.reporting_cycles(id) ON DELETE SET NULL,
  question_code text,
  file_path text NOT NULL,
  file_name text NOT NULL,
  size_bytes integer,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.evidence_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ev ngf read" ON public.evidence_uploads FOR SELECT TO public USING (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "ev state read" ON public.evidence_uploads FOR SELECT TO public USING (state_code = current_state_code());
CREATE POLICY "ev state insert" ON public.evidence_uploads FOR INSERT TO public WITH CHECK (state_code = current_state_code());
CREATE POLICY "ev state delete" ON public.evidence_uploads FOR DELETE TO public USING (state_code = current_state_code());

-- Reviewer feedback
CREATE TABLE public.reviewer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.survey_submissions(id) ON DELETE CASCADE,
  state_code text NOT NULL,
  question_code text,
  reviewer_id uuid,
  body text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviewer_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fb ngf all" ON public.reviewer_feedback FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "fb state read" ON public.reviewer_feedback FOR SELECT TO public USING (state_code = current_state_code());
CREATE POLICY "fb state resolve" ON public.reviewer_feedback FOR UPDATE TO public USING (state_code = current_state_code());

-- Risk register
CREATE TABLE public.risk_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  probability integer NOT NULL DEFAULT 3, -- 1..5
  impact integer NOT NULL DEFAULT 3, -- 1..5
  trend text DEFAULT 'stable',
  state_code text,
  dimension_code text,
  description text,
  mitigation text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_register ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risk ngf all" ON public.risk_register FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "risk authed read" ON public.risk_register FOR SELECT TO public USING (auth.role() = 'authenticated');

-- Horizon scan
CREATE TABLE public.horizon_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source_url text,
  signal_type text DEFAULT 'weak',
  dimension_code text,
  summary text,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.horizon_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hs ngf all" ON public.horizon_signals FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "hs read" ON public.horizon_signals FOR SELECT TO public USING (auth.role() = 'authenticated');

-- Grants
CREATE TABLE public.grants_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor text NOT NULL,
  program text NOT NULL,
  amount_usd numeric,
  start_date date,
  end_date date,
  state_code text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.grants_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gr ngf all" ON public.grants_registry FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));

-- Governor engagement
CREATE TABLE public.governor_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL,
  event_type text NOT NULL, -- meeting | call | letter | commitment
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  summary text,
  responsiveness integer DEFAULT 3, -- 1..5
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.governor_engagement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ge ngf all" ON public.governor_engagement FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));

-- Press
CREATE TABLE public.press_clippings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  outlet text,
  url text,
  state_code text,
  topic text,
  sentiment text DEFAULT 'neutral',
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.press_clippings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pc ngf all" ON public.press_clippings FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));

-- Publish queue
CREATE TABLE public.publish_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_type text NOT NULL, -- report | alert | scenario | dataset
  artifact_id text,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected | scheduled | published
  scheduled_for timestamptz,
  approver_id uuid,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.publish_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pq ngf all" ON public.publish_queue FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));

-- Nudges
CREATE TABLE public.state_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL,
  cycle_id uuid REFERENCES public.reporting_cycles(id) ON DELETE SET NULL,
  message text NOT NULL,
  channel text DEFAULT 'inapp',
  sent_by uuid,
  sent_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.state_nudges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "n ngf all" ON public.state_nudges FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "n state read" ON public.state_nudges FOR SELECT TO public USING (state_code = current_state_code());

-- Report download log
CREATE TABLE public.report_downloads_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  state_code text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.report_downloads_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rdl ngf read" ON public.report_downloads_log FOR SELECT TO public USING (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "rdl authed insert" ON public.report_downloads_log FOR INSERT TO authenticated WITH CHECK (true);

-- AI briefings cache
CREATE TABLE public.ai_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL, -- national | state:XX
  briefing_date date NOT NULL DEFAULT CURRENT_DATE,
  bullets jsonb NOT NULL DEFAULT '[]',
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(scope, briefing_date)
);
ALTER TABLE public.ai_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ab ngf all" ON public.ai_briefings FOR ALL TO public USING (has_role(auth.uid(),'ngf_staff')) WITH CHECK (has_role(auth.uid(),'ngf_staff'));
CREATE POLICY "ab authed read" ON public.ai_briefings FOR SELECT TO public USING (auth.role() = 'authenticated');

-- Triggers updated_at
CREATE TRIGGER tg_commitments_updated BEFORE UPDATE ON public.commitments FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_tickets_updated BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Storage bucket evidence (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence','evidence', false) ON CONFLICT DO NOTHING;
CREATE POLICY "ev bucket state read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='evidence' AND (storage.foldername(name))[1] = current_state_code());
CREATE POLICY "ev bucket state write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='evidence' AND (storage.foldername(name))[1] = current_state_code());
CREATE POLICY "ev bucket state delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='evidence' AND (storage.foldername(name))[1] = current_state_code());
CREATE POLICY "ev bucket ngf read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='evidence' AND has_role(auth.uid(),'ngf_staff'));
