import { createFileRoute } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { TopNav } from "@/components/stopwatch/TopNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMeasurements } from "@/hooks/use-measurements";
import { categoryLabel } from "@/lib/categories";

export const Route = createFileRoute("/arkiv")({
  head: () => ({
    meta: [
      { title: "Arkiv · pr:cisely" },
      {
        name: "description",
        content: "Arkiv over skjulte registreringer i pr:cisely.",
      },
      { property: "og:title", content: "Arkiv · pr:cisely" },
      {
        property: "og:description",
        content: "Skjulte registreringer kan ses og gendannes herfra.",
      },
    ],
  }),
  component: ArkivPage,
});

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function fmtDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function ArkivPage() {
  const { hiddenAll, unhide } = useMeasurements();

  // Group by local date
  const groups = new Map<string, typeof hiddenAll>();
  for (const m of hiddenAll) {
    const key = fmtDate(m.endedAt);
    const arr = groups.get(key) ?? [];
    arr.push(m);
    groups.set(key, arr);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="mb-6 text-xl font-semibold text-foreground">Arkiv</h1>
        {hiddenAll.length === 0 ? (
          <p className="text-sm text-muted-foreground">Arkivet er tomt.</p>
        ) : (
          <div className="space-y-6">
            {Array.from(groups.entries()).map(([date, items]) => (
              <section key={date}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {date}
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Start</TableHead>
                      <TableHead className="w-24">Slut</TableHead>
                      <TableHead className="w-24">Varighed</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="w-12" aria-label="Handlinger" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono tabular-nums">
                          {fmtTime(m.startedAt)}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {fmtTime(m.endedAt)}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {fmtDuration(m.ms)}
                        </TableCell>
                        <TableCell>{categoryLabel(m.category)}</TableCell>
                        <TableCell className="text-right">
                          <button
                            type="button"
                            onClick={() => unhide(m.id)}
                            aria-label="Vis registrering igen"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
