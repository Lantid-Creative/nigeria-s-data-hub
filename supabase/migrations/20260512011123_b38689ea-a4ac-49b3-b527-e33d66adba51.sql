
CREATE TABLE public.alert_reads (
  user_id uuid NOT NULL,
  alert_id uuid NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, alert_id)
);
ALTER TABLE public.alert_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reads self read" ON public.alert_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reads self insert" ON public.alert_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reads self delete" ON public.alert_reads FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_reads;
