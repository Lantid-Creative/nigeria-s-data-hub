
-- Add body for multi-section reports
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS body jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS author_id uuid;

-- Add OCR / extracted text + indexing for evidence search
ALTER TABLE public.evidence_uploads ADD COLUMN IF NOT EXISTS extracted_text text;
ALTER TABLE public.evidence_uploads ADD COLUMN IF NOT EXISTS ocr_status text NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS evidence_text_search_idx
  ON public.evidence_uploads
  USING gin (to_tsvector('simple', coalesce(file_name,'') || ' ' || coalesce(extracted_text,'')));
