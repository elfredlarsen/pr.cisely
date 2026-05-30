import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

const navItems = [
  { label: "Stopur", to: "/" as const },
  { label: "Oversigt", to: "/arkiv" as const },
  { label: "Indstillinger", to: "/indstillinger" as const },
];

const linkBase =
  "nav-link inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const linkActive = "text-foreground";

export function TopNav() {
  return (
    <nav
      aria-label="Hovednavigation"
      className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/90 px-8 backdrop-blur-md max-[640px]:px-4"
    >
      <Link
        to="/"
        aria-label="pr:cisely – til forsiden"
        className="inline-flex select-none items-center rounded-lg text-[26px] font-medium leading-none tracking-[-0.9px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background max-[640px]:text-[22px]"
      >
        <span>pr</span>
        <span
          aria-hidden="true"
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          :
        </span>
        <span>cisely</span>
      </Link>

      <ul className="flex items-center gap-1">
        {navItems.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className={linkBase}
              activeProps={{
                className: `${linkBase} ${linkActive}`,
                "data-active": "true",
              }}
              activeOptions={{ exact: true }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label="Log ud"
        className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-transparent px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background max-[640px]:px-2.5"
      >
        <LogOut
          className="h-[15px] w-[15px] opacity-60 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
        <span className="max-[640px]:hidden">Log ud</span>
      </button>
    </nav>
  );
}
