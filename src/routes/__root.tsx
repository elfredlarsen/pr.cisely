
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ErrorComponentProps,
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { THEME_SCRIPT, useThemeSync } from "@/lib/theme";
import appCss from "../styles.css?url";

// Bemærk: den tidligere `useClearLegacyLocalStorage`-hook er fjernet bevidst.
// Den ryddede alle `precisely.*`-nøgler én gang per browser og var en latent
// risiko for at slette ikke-synkroniseret offline-kø ved næste deploy hvis en
// ny nøgle ved en fejl blev glemt i whitelisten. Legacy-oprydningen har for
// længst kørt på eksisterende klienter, så hooken er ikke længere nødvendig.



function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-card">
        <p className="text-6xl font-semibold text-brand">404</p>
        <h1 className="mt-4 text-xl font-semibold text-foreground">Siden findes ikke</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Linket er måske gammelt eller skrevet forkert. Dine registreringer er i sikkerhed — vælg, hvor du vil hen:
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button asChild size="lg">
            <Link to="/">Stopur</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/oversigt">Oversigt</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Tip: Den tidligere side "Arkiv" hedder nu "Oversigt".
        </p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-card">
        <h1 className="text-xl font-semibold text-foreground">Noget gik galt</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Siden kunne ikke indlæses. Prøv igen, eller gå til forsiden.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Prøv igen
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Til forsiden</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "pr:cisely" },
      { name: "description", content: "Præcis tidsregistrering." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "pr:cisely" },
      { property: "og:description", content: "Præcis tidsregistrering." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "theme-color", content: "#fafafa", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0f0f12", media: "(prefers-color-scheme: dark)" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "pr:cisely" },
      { name: "twitter:title", content: "pr:cisely" },
      { name: "twitter:description", content: "Præcis tidsregistrering." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fc0330de-dd91-456e-b274-a7fe2cdf26eb/id-preview-dedb565d--93e54db2-ec2a-4e2c-af3b-fbcd243b6b3a.lovable.app-1780266899708.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fc0330de-dd91-456e-b274-a7fe2cdf26eb/id-preview-dedb565d--93e54db2-ec2a-4e2c-af3b-fbcd243b6b3a.lovable.app-1780266899708.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useThemeSync();



  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}

