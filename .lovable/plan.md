Plan: Gør Historik-tabellen visuelt identisk med Oversigt-tabellen, men behold historikkens opacity

1. Ret kolonnebredden i den fælles tabel
- Tilpas `MeasurementsList`, så handlingskolonnen som standard har samme smalle bredde som i Oversigt.
- Fjern den brede `w-36`-kolonne i Historik, som skaber det tomme område markeret på screenshot’et.

2. Flyt “Ryd historik” ud af tabelkolonnen
- Lad tabelheaderens sidste kolonne igen kun være til slet-ikonerne, ligesom i Oversigt.
- Placer “Ryd historik” som en kompakt knap over/ved siden af tabellen i historik-containeren, så den ikke ændrer tabellens layout.

3. Bevar Historik-specifik opførsel
- Behold `opacity-75` på historiksektionen.
- Behold scroll, sticky header, tooltip og bulk-slet-dialog.
- Behold samme delte række-UI, sortering, kategori-dropdown, kommentar-række og slet-dialog som i Oversigt.

4. Verificering
- Tjek `/` og `/arkiv` visuelt efter ændringen.
- Bekræft at kolonnerne matcher, at slet-ikonkolonnen ikke efterlader ekstra luft, og at historikken stadig har opacity.