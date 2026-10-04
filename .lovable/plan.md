# Ryd op i Oversigt

## Hvad ændres

1. **Adressen hedder /oversigt** — Siden får adressen `/oversigt`, så den matcher navnet i menuen. Gamle links og bogmærker til `/arkiv` sender automatisk videre til `/oversigt`.
2. **Kun én knap til at tilføje tid** — Når en dag er tom, står der kun "Ingen registreringer denne dag" og den samme "Tilføj registrering"-knap som altid nederst. Den ekstra knap "Tilføj tid for denne dag" i den tomme boks fjernes.
3. **Datovælgeren står i midten** — `[ < ] Dato [ > ]` står altid præcis centreret. "I dag"-knappen vises centreret lige under datoen, kun når du kigger på en anden dag. Genvejsteksten rykker ned under den.

## Teknisk

- Flyt `src/routes/_authenticated/arkiv.tsx` til `src/routes/_authenticated/oversigt.tsx` (`createFileRoute("/_authenticated/oversigt")`).
- Ny `src/routes/_authenticated/arkiv.tsx` med `beforeLoad: () => { throw redirect({ to: "/oversigt", replace: true }) }`.
- Opdatér links i `TopNav.tsx` og `MeasurementsTable.tsx` til `/oversigt`.
- Tom tilstand: fjern knappen i boksen; bevar ikon og tekst.
- `DateNavigator.tsx`: ydre `flex flex-col items-center`; pile + dato i én centreret række; "I dag"-knap i egen række under, med fast plads (fx `min-h-9`) så siden ikke hopper når knappen vises/forsvinder.
- Afprøv i testbrowser: `/arkiv` sender videre, tom dag, I dag-knappens placering på desktop og mobil.
