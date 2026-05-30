Gør de tre stopur-knapper bredere, så afstanden mellem dem bliver mindre.

**Ændring** i `src/components/stopwatch/Stopwatch.tsx` (`baseBtn`, linje 67-68):
- `w-44` → `w-56` (knapper bliver bredere og fylder mere af urets bredde).
- `h-14` bevares.
- `justify-between` bevares, så første/sidste knap stadig flugter med urets venstre/højre kant.

Ingen ændringer i farver, ikoner eller funktionalitet.