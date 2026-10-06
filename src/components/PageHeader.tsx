import type { ReactNode } from "react";

/** Fælles sidebeholder og -overskrift, så alle sider har samme bredde og top. */
export const PAGE_CONTAINER = "mx-auto w-full max-w-[720px] flex-1 px-4 py-8 sm:px-6";

export function PageHeader({
  title,
  description,
  srOnly,
}: {
  title: string;
  description?: ReactNode;
  /** Kun for skærmlæsere – menuen viser allerede sidens navn. */
  srOnly?: boolean;
}) {
  if (srOnly) return <h1 className="sr-only">{title}</h1>;
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </header>
  );
}
