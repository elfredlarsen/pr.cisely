CREATE TABLE public.category_templates (
  value text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.category_templates TO service_role;
ALTER TABLE public.category_templates ENABLE ROW LEVEL SECURITY;
INSERT INTO public.category_templates (value, label, sort_order)
  SELECT value, label, sort_order FROM public.categories WHERE hidden = false;

ALTER TABLE public.categories ADD COLUMN user_id uuid;
ALTER TABLE public.profiles ADD COLUMN last_category text;

DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid='public.categories'::regclass AND contype='u' LOOP
    EXECUTE format('ALTER TABLE public.categories DROP CONSTRAINT %I', r.conname);
  END LOOP;
  FOR r IN SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='categories' AND indexdef ILIKE '%UNIQUE%' AND indexname <> 'categories_pkey' LOOP
    EXECUTE format('DROP INDEX public.%I', r.indexname);
  END LOOP;
END $$;

INSERT INTO public.categories (value, label, sort_order, hidden, user_id)
  SELECT c.value, c.label, c.sort_order, c.hidden, p.id
  FROM public.categories c CROSS JOIN public.profiles p
  WHERE c.user_id IS NULL;
DELETE FROM public.categories WHERE user_id IS NULL;

ALTER TABLE public.categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.categories ADD CONSTRAINT categories_user_value_key UNIQUE (user_id, value);
CREATE INDEX categories_user_id_idx ON public.categories(user_id);

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated can view categories" ON public.categories;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
CREATE POLICY "Users view own categories" ON public.categories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own categories" ON public.categories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own categories" ON public.categories FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  insert into public.categories (value, label, sort_order, hidden, user_id)
    select value, label, sort_order, false, new.id from public.category_templates;
  return new;
end;
$function$;

DELETE FROM public.user_roles WHERE role = 'administrator';
COMMENT ON FUNCTION public.has_role(uuid, public.app_role) IS 'DEPRECATED: administrator role removed';