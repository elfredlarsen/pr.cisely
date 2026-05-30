import { Link } from "@tanstack/react-router";
import logo from "@/assets/precisely-logo.svg";

const navItems = [
  { label: "Stopur", to: "/" as const },
  { label: "Oversigt", to: "/arkiv" as const },
  { label: "Indstillinger", to: "/indstillinger" as const },
];

const itemClass = [
  "relative inline-flex items-center px-1 py-1.5 text-sm font-medium tracking-wide transition-colors",
  "text-muted-foreground hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
].join(" ");

const activeItemClass =
  "text-foreground after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:rounded-full";

export function TopNav() {
  return (
    <nav
      aria-label="Hovednavigation"
      className="sticky top-0 z-40 w-full border-b border-border bg-background"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-2">
        <div className="justify-self-start">
          <Link
            to="/"
            aria-label="pr:cisely – til forsiden"
            className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <img src={logo} alt="pr:cisely" className="h-5 w-auto" />
          </Link>
        </div>

        <ul className="flex items-center gap-10 justify-self-center">
          {navItems.map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                className={itemClass}
                activeProps={{ className: `${itemClass} ${activeItemClass}` }}
                activeOptions={{ exact: true }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="justify-self-end">
          <button
            type="button"
            className="inline-flex items-center px-1 py-1.5 text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            Log ud
          </button>
        </div>
      </div>
    </nav>
  );
}
