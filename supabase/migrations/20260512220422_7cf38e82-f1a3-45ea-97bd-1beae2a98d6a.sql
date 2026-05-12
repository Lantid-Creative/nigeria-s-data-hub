DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_briefings_date_scope_key'
  ) THEN
    ALTER TABLE public.ai_briefings
      ADD CONSTRAINT ai_briefings_date_scope_key UNIQUE (briefing_date, scope);
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;