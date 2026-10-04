import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: "Stopur",
    items: [
      ["Mellemrum", "Start, pause og fortsæt"],
      ["A", "Afslut og gem"],
      ["N", "Nulstil (kan fortrydes)"],
    ],
  },
  {
    title: "Gem registrering",
    items: [
      ["1–9", "Vælg kategori"],
      ["Enter", "Gem"],
    ],
  },
  {
    title: "Oversigt",
    items: [
      ["←  →", "Forrige / næste dag"],
      ["T", "Gå til i dag"],
    ],
  },
  { title: "Generelt", items: [["?", "Vis denne oversigt"]] },
];

const OPEN_EVENT = "precisely:open-shortcuts";

export function openShortcuts() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "?") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("input, textarea, select, [contenteditable=true]") || t.closest("[role=dialog]"))) return;
      e.preventDefault();
      setOpen(true);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" aria-hidden="true" />
            Tastaturgenveje
          </DialogTitle>
          <DialogDescription>Genvejene virker ikke, mens du skriver i et felt.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {g.title}
              </h3>
              <dl className="divide-y divide-border rounded-lg border border-border">
                {g.items.map(([k, d]) => (
                  <div key={k} className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
                    <dt className="text-foreground">{d}</dt>
                    <dd>
                      <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                        {k}
                      </kbd>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
