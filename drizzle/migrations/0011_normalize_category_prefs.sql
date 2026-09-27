ALTER TABLE public.profiles ADD COLUMN last_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Rækkefølge: kategorier i category_order først (i den orden), resten bagefter efter nuværende sort_order
UPDATE public.categories c SET sort_order = s.rn
FROM (
  SELECT c2.id, (row_number() OVER (PARTITION BY c2.user_id ORDER BY
    CASE WHEN array_position(p.category_order, c2.value) IS NULL THEN 1 ELSE 0 END,
    array_position(p.category_order, c2.value), c2.sort_order, c2.value) - 1)::int AS rn
  FROM public.categories c2 JOIN public.profiles p ON p.id = c2.user_id
  WHERE p.category_order IS NOT NULL AND cardinality(p.category_order) > 0
) s WHERE s.id = c.id;

-- Skjulte: kategorier ikke med i active_categories
UPDATE public.categories c SET hidden = NOT (c.value = ANY(p.active_categories))
FROM public.profiles p
WHERE p.id = c.user_id AND p.active_categories IS NOT NULL AND cardinality(p.active_categories) > 0;

-- Senest valgte
UPDATE public.profiles p SET last_category_id = c.id
FROM public.categories c
WHERE c.user_id = p.id AND c.value = p.last_category;

COMMENT ON COLUMN public.profiles.category_order IS 'DEPRECATED: replaced by categories.sort_order';
COMMENT ON COLUMN public.profiles.active_categories IS 'DEPRECATED: replaced by categories.hidden';
COMMENT ON COLUMN public.profiles.last_category IS 'DEPRECATED: replaced by last_category_id';

ALTER TABLE public.measurements ADD CONSTRAINT measurements_ms_nonnegative CHECK (ms >= 0);
ALTER TABLE public.measurements ADD CONSTRAINT measurements_end_after_start CHECK (ended_at >= started_at);