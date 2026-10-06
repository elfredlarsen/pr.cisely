import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Keyboard, LogOut, Moon, MoreHorizontal, Settings, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { openShortcuts } from "@/components/ShortcutsDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const tabs = [
  { label: "Stopur", to: "/" as const },
  { label: "Oversigt", to: "/oversigt" as const },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const tabBase = `inline-flex min-h-10 min-w-[96px] items-center justify-center rounded-lg px-4 text-[15px] font-medium text-muted-foreground transition-all hover:text-foreground max-[400px]:min-w-[80px] max-[400px]:px-3 ${focusRing}`;
const tabActive = "bg-background font-semibold text-foreground shadow-sm hover:text-foreground";

const menuItem = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 ${focusRing}`;

export function TopNav() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [, setTheme] = useTheme();
  const [open, setOpen] = useState(false);

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
      className="sticky top-0 z-40 grid h-16 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl backdrop-saturate-150 max-[640px]:px-3"
    >
      <Link
        to="/"
        aria-label="pr:cisely – til forsiden"
        className={`inline-flex select-none items-center justify-self-start rounded-lg text-[24px] font-medium leading-none tracking-[-0.9px] text-foreground max-[640px]:text-[20px] ${focusRing}`}
      >
        <span>pr</span>
        <span
          aria-hidden="true"
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          :
        </span>
        <span className="max-[520px]:hidden">cisely</span>
      </Link>

      <ul className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/70 p-1">
        {tabs.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className={tabBase}
              activeProps={{ className: `${tabBase} ${tabActive}`, "aria-current": "page" }}
              activeOptions={{ exact: true }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="justify-self-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            aria-label="Flere valg"
            title="Flere valg"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground data-[state=open]:bg-foreground/5 data-[state=open]:text-foreground ${focusRing}`}
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-60 rounded-xl p-1.5">
            <Link to="/indstillinger" className={menuItem} onClick={() => setOpen(false)}>
              <Settings className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Indstillinger
            </Link>
            <button
              type="button"
              className={menuItem}
              onClick={() => {
                setOpen(false);
                openShortcuts();
              }}
            >
              <Keyboard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Tastaturgenveje
              <kbd className="ml-auto rounded border border-border px-1.5 text-xs text-muted-foreground">?</kbd>
            </button>
            <button type="button" className={menuItem} onClick={toggleTheme}>
              <Sun className="hidden h-4 w-4 text-muted-foreground dark:block" aria-hidden="true" />
              <Moon className="h-4 w-4 text-muted-foreground dark:hidden" aria-hidden="true" />
              <span className="dark:hidden">Mørkt tema</span>
              <span className="hidden dark:inline">Lyst tema</span>
            </button>
            <div className="my-1 h-px bg-border" role="separator" />
            <button
              type="button"
              className={`${menuItem} text-destructive hover:bg-destructive/10`}
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log ud
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
