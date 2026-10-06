CREATE TABLE public.mtime_entries (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  day date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day, category_id)
);
GRANT SELECT, INSERT, DELETE ON public.mtime_entries TO authenticated;
GRANT ALL ON public.mtime_entries TO service_role;
ALTER TABLE public.mtime_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.mtime_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.mtime_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.categories c WHERE c.id = category_id AND c.user_id = auth.uid()));
CREATE POLICY "own delete" ON public.mtime_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);