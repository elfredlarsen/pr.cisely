## Stilet bekræftelses-toast øverst på skærmen

### Mål
"Registrering gemt" og lignende success-toasts skal vises som en grøn, centreret toast øverst på skærmen i 3 sekunder med fade-out og manuel luk-knap.

### Ændringer

**1. `src/components/ui/sonner.tsx`**
- Ændr `position` fra `"top-right"` til `"top-center"`.
- Sæt `duration={3000}` på Toaster (default 3 sek for alle toasts).
- Behold `closeButton` (kryds i højre side er allerede sonner-standard).
- Tilføj `classNames.success` der bruger grøn baggrund + hvid tekst + afrundede hjørner:
  - `bg-[#2a9d4a] text-white border-[#2a9d4a] rounded-lg`
  - Sørg for at `closeButton` på success-toasts også er læselig (hvid tekst, transparent baggrund).
- Behold fade-animation (sonner har indbygget fade-out ved auto-dismiss).
- Juster `style` width så centreret toast får passende bredde (fx 320px) i stedet for 280px.

**2. Ingen ændringer i `src/routes/index.tsx`**
- `toast.success("Registrering gemt")` bruges allerede — den nye `success`-styling vil automatisk gælde.

### Verifikation
- Gem en registrering → grøn toast vises centreret øverst, forsvinder efter 3 sek, kan lukkes manuelt med X.
- Andre `toast()`-kald (ikke success) bevarer standard udseende.
