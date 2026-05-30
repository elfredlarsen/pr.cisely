## Ændringer

### 1. Tabel tættere på knapperne

I `src/routes/index.tsx`: skift wrapperens `pt-6` til `pt-2` (behold `pb-8`) så historik-kortet rykker tæt op under Start/Afslut-knapperne.

### 2. Scrollbar skal kun vises ved hover

I `src/styles.css` reserverer `.scrollbar-purple::-webkit-scrollbar { width: 6px }` altid 6px gutter, så på browsere/OS hvor scrollbar-tracket vises (Chrome på Windows, macOS med "Always show"), ses der hele tiden en tom 6px-stribe. Fix: gør scrollbaren fuldstændig skjult som default og vis den først ved hover på containeren.

```css
.scrollbar-purple { scrollbar-width: none; }
.scrollbar-purple::-webkit-scrollbar { width: 0; height: 0; }

.scrollbar-purple:hover { scrollbar-width: thin; scrollbar-color: #c471ed transparent; }
.scrollbar-purple:hover::-webkit-scrollbar { width: 6px; height: 6px; }
.scrollbar-purple:hover::-webkit-scrollbar-thumb {
  background-color: #c471ed;
  border-radius: 9999px;
}
.scrollbar-purple:hover::-webkit-scrollbar-thumb:hover { background-color: #b35ee0; }
.scrollbar-purple::-webkit-scrollbar-track { background: transparent; }
```

## Verifikation

- `/`: historik-kortet sidder tættere på knapperne.
- Ingen synlig scrollbar i historikken ved indlæsning; hover over listen viser den lilla scrollbar.
- Scroll-funktionalitet virker stadig.