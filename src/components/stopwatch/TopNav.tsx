import { Link, useNavigate } from "@tanstack/react-router";
import { Keyboard, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { openShortcuts } from "@/components/ShortcutsDialog";



const baseItems = [
  { label: "Stopur", to: "/" as const },
  { label: "Oversigt", to: "/arkiv" as const },
  { label: "Indstillinger", to: "/indstillinger" as const },
];

const linkBase =
  "nav-link inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const linkActive = "text-foreground";

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function TopNav() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [, setTheme] = useTheme();
  const toggleTheme = () =>
    setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.clear();
      toast.success("Logget ud");
      navigate({ to: "/login", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke logge ud");
    }
  };

  return (
    <nav
      aria-label="Hovednavigation"
      className="sticky top-0 z-40 grid h-16 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border/60 bg-background/90 px-8 backdrop-blur-md max-[640px]:px-3"
    >
      <Link
        to="/"
        aria-label="pr:cisely – til forsiden"
        className="inline-flex select-none items-center justify-self-start rounded-lg text-[26px] font-medium leading-none tracking-[-0.9px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background max-[640px]:text-[20px]"
      >
        <span>pr</span>
        <span
          aria-hidden="true"
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          :
        </span>
        <span className="max-[480px]:hidden">cisely</span>
      </Link>

      <ul className="flex items-center gap-1">
        {baseItems.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className={`${linkBase} max-[640px]:px-2 max-[640px]:text-xs`}
              activeProps={{
                className: `${linkBase} ${linkActive} max-[640px]:px-2 max-[640px]:text-xs`,
                "data-active": "true",
              }}
              activeOptions={{ exact: true }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-1 justify-self-end">
        <button
          type="button"
          onClick={openShortcuts}
          aria-label="Tastaturgenveje"
          title="Tastaturgenveje (?)"
          className={`${iconBtn} max-[640px]:hidden`}
        >
          <Keyboard className="h-[17px] w-[17px]" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Skift lyst/mørkt tema"
          title="Skift lyst/mørkt tema"
          className={iconBtn}
        >
          <Sun className="hidden h-[17px] w-[17px] dark:block" aria-hidden="true" />
          <Moon className="h-[17px] w-[17px] dark:hidden" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log ud"
          title="Log ud"
          className={`${iconBtn} w-auto gap-1.5 px-3 text-sm font-medium max-[640px]:w-9 max-[640px]:px-0`}
        >
          <LogOut className="h-[16px] w-[16px]" aria-hidden="true" />
          <span className="max-[640px]:hidden">Log ud</span>
        </button>
      </div>

    </nav>

  );
}
