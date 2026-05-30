## Problem

Hele historik-kortet ligger i en ydre scroll-container, så når listen er lang scroller hele kortet (med "Historik"-bjælken og tabelheaderen) i stedet for kun rækkerne. Du vil have "Historik"-bjælken og tabelheaderen fastlåst og kun rækkerne scrollende.

## Løsning

I `src/components/stopwatch/MeasurementsTable.tsx`:

- Lad `section` og selve `Collapsible`-kortet fylde hele højden (`h-full min-h-0 flex flex-col`) i stedet for at lægge kortet i en scrollende wrapper.
- Fjern `overflow-y-auto` og `scrollbar-purple` fra den ydre wrapper.
- Flyt scroll-containeren ind i `CollapsibleContent`: wrap `MeasurementsList` i `<div className="scrollbar-purple flex-1 min-h-0 overflow-y-auto border-t border-border px-2 pb-2">`.
- Giv `CollapsibleContent` `data-[state=open]:flex-1 data-[state=open]:min-h-0 data-[state=open]:flex data-[state=open]:flex-col` så den udvider sig til den resterende plads når den er åben.
- Fjern det tidligere `!overflow-visible` workaround — sticky table-header virker nu inde i den nye indre scroll-container.
- Tom-tilstand beholder samme look; bare ingen scroll nødvendig.

## Konsekvenser

- "Historik"-trigger-bjælken bliver stående øverst i kortet — den scroller ikke længere ud af syne.
- Tabel-headeren (Start / Slut / Varighed / Kategori) bliver stående via `sticky top-0` i den nye scroll-container.
- Kun rækkerne scroller.
- Radix' åbn/luk-højdeanimation deaktiveres for dette kort (vi tvinger højden til flex-1 når åben), så det folder ud/ind uden glat animation — men uden hop.

## Verifikation

- `/` med mange målinger: "Historik"-bjælken og kolonneoverskrifterne står stille; kun rækkerne scroller.
- Fold ind/ud virker stadig; ingen visuelt hop.
- Scrollbar er stadig skjult indtil hover.