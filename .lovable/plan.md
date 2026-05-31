# WCAG AA-kontrast på primærknapper

## Mål
Hvid tekst på primær skal opnå mindst 4.5:1. Nuværende `#c471ed` mod hvid giver ~2.6:1 (fejler AA). Ny værdi `#9333ea` mod hvid giver ~5.4:1 ✓.

## Ændringer

### `src/styles.css`
- Linje 51: `--primary: #c471ed;` → `--primary: #9333ea;`
- Linje 69: `--ring: #c471ed;` → `--ring: #9333ea;`

### `DESIGN.md`
- Linje 20: opdater "Primær accentfarve (knapper, fokus, aktiv tilstand)" fra `#c471ed (lilla)` til `#9333ea (lilla)`.

## Urørt
- `--brand-primary`, `--brand-gradient`, `--gradient-brand` (linje 71–72, 132)
- `.nav-link::after`-gradient (linje 147)
- Scrollbar-styling (linje 117, 124) — bruger `#c471ed` men er ikke nævnt af brugeren og er ikke tekst-på-baggrund, så lades urørt jf. "ingen andre ændringer".
- Logo, favicon
- DESIGN.md linje 16 ("Lilla: #c471ed" under brand-paletten) — beskriver brand-gradienten, ikke primær-accenten.

## Verifikation
Kontrast `#9333ea` (L≈0.146) mod `#ffffff` (L=1): `(1+0.05)/(0.146+0.05) ≈ 5.36:1` ≥ 4.5:1 ✓.
