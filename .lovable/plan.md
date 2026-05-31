Opdater fem tokens i `:root` i `src/styles.css` for at opfylde WCAG AA-kontrast på status-farver. Brand-gradienten (`#f64f59`, `#c471ed`, `#12c2e9`) og alt der bruger den (logo, favicon, `--brand-primary`, `--brand-gradient`, `--gradient-brand`, `.nav-link::after`, scrollbar) røres ikke.

## Ændringer i `src/styles.css` (`:root`)

- `--destructive`: `#ff5a7a` → `#c0344d`
- `--success`: `#3ec98a` → `#15803d`
- `--warning`: uændret (`#ffd23a`)
- `--warning-foreground`: `#ffffff` → `#1a1a1a` (mørk tekst på gul)
- `--info`: `#12c2e9` → `#0e7490` (kun brugt på Nulstil-knappen; brand-cyan i gradienten er hardcodet og uberørt)

Ingen andre filer, komponenter eller policies ændres.