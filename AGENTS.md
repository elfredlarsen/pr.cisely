
- Categories are per-user (categories.user_id + RLS auth.uid()=user_id); new users get a copy of category_templates via handle_new_user. Why: changes must never affect other users.
- No role system: user_roles/app_role dropped; access is purely per-user via RLS auth.uid(). Why: admin features removed.
- Category prefs live on categories (sort_order, hidden) and profiles.last_category_id (FK, ON DELETE SET NULL); never on profiles arrays or localStorage. Why: single source of truth, follows the user across devices.
- ER diagram lives in docs/er-diagram.md and must be updated with schema changes. Why: keep documentation in sync.
