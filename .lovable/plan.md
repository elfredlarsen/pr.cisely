
## Filer der lægges ind

| Fil | Destination | Brug |
|---|---|---|
| `precisely-primary-light.svg` | `src/assets/precisely-logo.svg` | Logo i TopNav |
| `favicon-colon-32.svg` | `public/favicon.svg` | Browser-favicon |

De andre varianter (dark, monochrome, gradient-full, app-icon, favicon-16) springes over indtil de har et konkret brugssted (dark mode, PWA-manifest, hero-section).

## Ændringer

### `src/components/stopwatch/TopNav.tsx`
- Importér logo: `import logo from "@/assets/precisely-logo.svg";`
- Erstat gradient-tekst-span med `<img src={logo} alt="pr:cisely" className="h-7 w-auto" />`.

### `src/routes/__root.tsx`
- Tilføj favicon-link i `links`: `{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }`.

## Verifikation
- Logo vises som SVG i nav på alle sider.
- Browser-fanen viser gradient-kolon-favicon.
