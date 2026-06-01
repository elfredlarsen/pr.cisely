## Ændring

Opdater knapfarverne i `src/components/stopwatch/Stopwatch.tsx` så de matcher det nye farveskema:

| Knap | Nuværende | Ny farve |
|---|---|---|
| Start / Fortsæt | `bg-success` | `#0e7d35` (grøn) |
| Afslut | `#b91c1c` | `#dc2626` (rød) |
| Pause | `#7c3aed` | `#db2777` (magenta) |
| Nulstil | `#0e7490` | `#2563eb` (blå) |

## Teknisk

I `Stopwatch.tsx` opdateres de fire klassekonstanter:

```ts
const startBtn  = `${baseBtn} bg-[#0e7d35] text-white`;
const resumeBtn = `${baseBtn} bg-[#0e7d35] text-white`;
const finishBtn = `${baseBtn} bg-[#dc2626] text-white`;
const pauseBtn  = `${baseBtn} bg-[#db2777] text-white`;
const resetBtn  = `${baseBtn} bg-[#2563eb] text-white`;
```

Ingen andre filer ændres. Hover/active-effekter (`brightness-110` / `brightness-90`) på `baseBtn` bevares og virker med de nye farver.

## Verifikation

På `/` startes stopuret og knapperne kontrolleres visuelt i alle tre tilstande (idle, running, paused).
