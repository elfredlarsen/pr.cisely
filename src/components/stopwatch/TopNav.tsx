import { Link } from "@tanstack/react-router";
import { Timer, CalendarDays, Settings, HelpCircle, LogOut } from "lucide-react";

const items = [
  { label: "Stopur", icon: Timer, to: "/" as const },
  { label: "Oversigt", icon: CalendarDays, to: "/arkiv" as const },
  { label: "Indstillinger", icon: Settings, to: "/indstillinger" as const },
  { label: "Hjælp", icon: HelpCircle, to: null },
  { label: "Log ud", icon: LogOut, to: null },
];

export function TopNav() {
  return (
    <nav
      aria-label="Hovednavigation"
      className="w-full border-b border-border bg-card/60 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2">
        <li className="mr-4">
          <span
            className="font-sans text-lg font-semibold tracking-tight"
            style={{
              background: "var(--brand-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            pr:cisely
          </span>
        </li>
        {items.map(({ label, icon: Icon, to }) => {
          const className = [
            "inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "text-muted-foreground hover:bg-secondary hover:text-foreground",
          ].join(" ");
          return (
            <li key={label}>
              {to ? (
                <Link
                  to={to}
                  className={className}
                  activeProps={{ className: `${className} bg-secondary text-foreground` }}
                  activeOptions={{ exact: true }}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              ) : (
                <button type="button" className={className}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
