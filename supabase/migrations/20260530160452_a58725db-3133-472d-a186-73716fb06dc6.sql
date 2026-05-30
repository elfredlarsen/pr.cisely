CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'administrator'::app_role));