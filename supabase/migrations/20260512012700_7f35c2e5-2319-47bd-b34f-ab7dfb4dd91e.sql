CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  organisation text,
  topic text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  handled boolean NOT NULL DEFAULT false
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit contact" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "ngf reads contact" ON public.contact_messages
  FOR SELECT USING (has_role(auth.uid(), 'ngf_staff'::app_role));

CREATE POLICY "ngf updates contact" ON public.contact_messages
  FOR UPDATE USING (has_role(auth.uid(), 'ngf_staff'::app_role))
  WITH CHECK (has_role(auth.uid(), 'ngf_staff'::app_role));

CREATE INDEX idx_contact_messages_created ON public.contact_messages (created_at DESC);