## Ændring
I `src/components/indstillinger/CategoriesSection.tsx`: Øg højden på top- og bund-fade-overlays fra `h-6` (24px) til `h-10` (40px), så den delvist synlige række fader markant ud mod kortets baggrund og scroll-hintet bliver tydeligere.

- Top: `h-6` → `h-10`
- Bund: `h-6` → `h-10`

Ingen anden adfærd ændres — gradienterne vises stadig kun når der faktisk er noget at scrolle til.

## Verifikation
- På `/indstillinger`: den 8. række ("Selvstændig erhvervsdrivende") fader nu kraftigere ud i bunden af listen.
- Scroll til bunden → bund-fade forsvinder. Scroll tilbage → top-fade dukker op med samme styrke.