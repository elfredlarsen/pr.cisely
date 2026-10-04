# Trin 2: Forsiden fokuserer på stopuret

## Hvad ændres

- Under stopuret vises kun **de 5 nyeste registreringer fra i dag**. Listen ser ud og virker som i dag (samme ramme, baggrund og afstande som Oversigt, kan rettes og slettes).
- **Dagens samlede tid** står stadig øverst i listen og regnes ud fra **alle** dagens registreringer, ikke kun de fem.
- Har dagen mere end 5 registreringer, står der under listen: "Viser 5 af 12 · Se hele dagen i Oversigt" med link til Oversigt.
- Knappen "Tilføj registrering" bliver, hvor den er (den flyttes først i trin 4).
- Oversigt ændres ikke.

## Teknisk

- `MeasurementsTable.tsx`: ny valgfri prop `limit?: number` og `totalMs`-beregning på hele listen; render kun `measurements.slice(0, limit)` (nyeste først). Hvis `limit` overskrides, vises en linje med `<Link to="/arkiv">`.
- `_authenticated/index.tsx`: send `limit={5}`.
- Sorteringen bekræftes (nyeste først) før udsnittet tages.
- Opdatér projektnoten om at historikken på forsiden matcher Oversigt visuelt, men viser højst 5 rækker.
