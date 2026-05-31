UI'et bruger allerede semantiske tokens (`bg-destructive`, `bg-success`, `bg-warning`, `bg-info`) overalt — knapper, dialoger, fejlbeskeder og badges får automatisk de nye farver. Det eneste sted statusfarverne stadig ignoreres er sonner-toasts, som i dag tvinges til neutral `bg-background`. Det retter jeg, så feedback bliver visuelt konsistent med resten af UI'et.

## Ændring i `src/components/ui/sonner.tsx`

Fjern `!bg-background !text-foreground !border-border` overrides på `success` og tilføj tilsvarende klasser for `error`, `warning` og `info`, så de fire toast-typer bruger status-tokens:

- `success`: `bg-success text-success-foreground border-success`
- `error`: `bg-destructive text-destructive-foreground border-destructive`
- `warning`: `bg-warning text-warning-foreground border-warning` (gul med mørk tekst — matcher det opdaterede `--warning-foreground`)
- `info`: `bg-info text-info-foreground border-info`

`description` og `closeButton` opdateres så de bliver læsbare på den farvede baggrund (fx `text-current/80` på description, gennemsigtig closeButton der arver farve).

Standard `toast` (uden type) beholder neutral baggrund.

Ingen andre filer ændres. Brand-gradient, primær-knap og alle andre tokens er uberørte.
