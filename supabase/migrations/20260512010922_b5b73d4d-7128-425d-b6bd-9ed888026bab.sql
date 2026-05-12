
-- Reports storage bucket (private; signed URLs used for delivery)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Read: any authenticated user
CREATE POLICY "reports read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'reports');

-- NGF staff: upload
CREATE POLICY "reports ngf insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reports' AND public.has_role(auth.uid(), 'ngf_staff'));

-- NGF staff: update
CREATE POLICY "reports ngf update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'reports' AND public.has_role(auth.uid(), 'ngf_staff'));

-- NGF staff: delete
CREATE POLICY "reports ngf delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'reports' AND public.has_role(auth.uid(), 'ngf_staff'));

-- Atomic download counter
CREATE OR REPLACE FUNCTION public.increment_report_downloads(_report_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.reports SET downloads = downloads + 1 WHERE id = _report_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_report_downloads(uuid) TO authenticated;
