
- Categories are per-user (categories.user_id + RLS auth.uid()=user_id); new users get a copy of category_templates via handle_new_user. Why: changes must never affect other users.
- Category preferences (active, order, last chosen) live on profiles, not localStorage. Why: follow the user across devices.
- No role system: user_roles is deprecated (drop pending); access is purely per-user via RLS auth.uid(). Why: admin features removed.
