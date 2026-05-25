import { createFileRoute } from "@tanstack/react-router";
import { Stopwatch } from "@/components/stopwatch/Stopwatch";
import { TopNav } from "@/components/stopwatch/TopNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "pr:cisely · Stopur" },
      {
        name: "description",
        content:
          "Stopur til præcis tidsregistrering med pr:cisely — start, pause og fortsæt din måling.",
      },
      { property: "og:title", content: "pr:cisely · Stopur" },
      {
        property: "og:description",
        content: "Præcis tidsregistrering med et enkelt og hurtigt stopur.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#stopur-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:shadow"
      >
        Spring til hovedindhold
      </a>
      <TopNav />
      <main id="stopur-main" className="flex flex-1 items-center justify-center">
        <Stopwatch />
      </main>
    </div>
  );
}
