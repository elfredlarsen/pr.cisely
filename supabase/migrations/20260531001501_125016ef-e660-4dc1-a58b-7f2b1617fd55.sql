ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS retention_days smallint NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_retention_days_positive;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_retention_days_positive
  CHECK (retention_days IS NULL OR retention_days > 0);