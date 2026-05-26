# Ensret tekst- og ikonfarver på knapper

## Mål
Gøre tekst- og ikonfarver ensartede på alle stopur-knapper ved at vælge én farve, der passer til alle knapper.

## Løsning
Skift `success-foreground`, `warning-foreground` og `info-foreground` fra mørk tekst (`#1a1a1a`) til hvid (`#ffffff`).

Hvid tekst og ikoner giver et rent, ensartet udtryk på alle farvede knapper og matcher allerede den eksisterende `destructive`-knap (Afslut), som allerede har hvid tekst.

## Ændring
Fil: `src/styles.css`

| Token                  | Før        | Efter      |
|------------------------|------------|------------|
| `--success-foreground` | `#1a1a1a`  | `#ffffff`  |
| `--warning-foreground` | `#1a1a1a`  | `#ffffff`  |
| `--info-foreground`    | `#1a1a1a`  | `#ffffff`  |

Der kræves ingen ændringer i komponenter – knapperne bruger allerede tokens som `text-success-foreground`, `text-warning-foreground` osv.