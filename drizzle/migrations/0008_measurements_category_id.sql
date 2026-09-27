ALTER TABLE public.categories ADD CONSTRAINT categories_id_user_id_key UNIQUE (id, user_id);
ALTER TABLE public.measurements ADD COLUMN category_id uuid;
UPDATE public.measurements m SET category_id = c.id FROM public.categories c WHERE c.user_id = m.user_id AND c.value = m.category;
ALTER TABLE public.measurements ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE public.measurements ADD CONSTRAINT measurements_category_same_user_fkey FOREIGN KEY (category_id, user_id) REFERENCES public.categories (id, user_id) ON DELETE RESTRICT;
CREATE INDEX measurements_category_id_idx ON public.measurements (category_id);
ALTER TABLE public.measurements ALTER COLUMN category DROP NOT NULL;
COMMENT ON COLUMN public.measurements.category IS 'DEPRECATED: replaced by category_id';
COMMENT ON COLUMN public.measurements.hidden IS 'DEPRECATED: hide feature removed; safe to drop';