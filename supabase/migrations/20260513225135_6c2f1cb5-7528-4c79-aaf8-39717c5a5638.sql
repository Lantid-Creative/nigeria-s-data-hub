
-- Saved scenarios
CREATE TABLE public.saved_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  shocks jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_shared boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss ngf all" ON public.saved_scenarios FOR ALL
  USING (public.has_role(auth.uid(), 'ngf_staff'))
  WITH CHECK (public.has_role(auth.uid(), 'ngf_staff'));
CREATE POLICY "ss authed read shared" ON public.saved_scenarios FOR SELECT
  USING (is_shared AND auth.role() = 'authenticated');
CREATE TRIGGER ss_updated BEFORE UPDATE ON public.saved_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Rate limit tracking (used by /api/public/*)
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  key text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, key, window_start)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rl ngf read" ON public.rate_limits FOR SELECT
  USING (public.has_role(auth.uid(), 'ngf_staff'));
CREATE INDEX rl_bucket_key_idx ON public.rate_limits (bucket, key, window_start DESC);

-- Digest log
CREATE TABLE public.digest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_type text NOT NULL,
  period_label text NOT NULL,
  summary text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  recipients_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.digest_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dl ngf read" ON public.digest_log FOR SELECT
  USING (public.has_role(auth.uid(), 'ngf_staff'));
CREATE POLICY "dl service insert" ON public.digest_log FOR INSERT
  WITH CHECK (true);

-- Schedule cron: weekly NGF digest (Mondays 07:00 UTC)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$ BEGIN
  PERFORM cron.unschedule('ngf-weekly-digest');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'ngf-weekly-digest',
  '0 7 * * 1',
  $$ SELECT net.http_post(
    url := 'https://project--3c3a0991-d7e3-4fb0-a364-81452811ad32.lovable.app/api/public/hooks/weekly-digest',
    headers := jsonb_build_object('Content-Type','application/json','apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoaGFkcXFyeGFib3BoZ2xoY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjQyNjMsImV4cCI6MjA5MzU0MDI2M30.eMGWCWdhAshbTMebkGwHP7OQzxRDDijChnnahO2ryys'),
    body := '{}'::jsonb
  ); $$
);

-- Schedule: nightly anomaly sweep (02:00 UTC)
DO $$ BEGIN
  PERFORM cron.unschedule('ngf-anomaly-sweep');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'ngf-anomaly-sweep',
  '0 2 * * *',
  $$ SELECT net.http_post(
    url := 'https://project--3c3a0991-d7e3-4fb0-a364-81452811ad32.lovable.app/api/public/hooks/anomaly-sweep',
    headers := jsonb_build_object('Content-Type','application/json','apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoaGFkcXFyeGFib3BoZ2xoY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjQyNjMsImV4cCI6MjA5MzU0MDI2M30.eMGWCWdhAshbTMebkGwHP7OQzxRDDijChnnahO2ryys'),
    body := '{}'::jsonb
  ); $$
);

-- Schedule: daily submission nudges (08:00 UTC)
DO $$ BEGIN
  PERFORM cron.unschedule('ngf-submission-nudges');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'ngf-submission-nudges',
  '0 8 * * *',
  $$ SELECT net.http_post(
    url := 'https://project--3c3a0991-d7e3-4fb0-a364-81452811ad32.lovable.app/api/public/hooks/submission-nudges',
    headers := jsonb_build_object('Content-Type','application/json','apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoaGFkcXFyeGFib3BoZ2xoY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjQyNjMsImV4cCI6MjA5MzU0MDI2M30.eMGWCWdhAshbTMebkGwHP7OQzxRDDijChnnahO2ryys'),
    body := '{}'::jsonb
  ); $$
);
