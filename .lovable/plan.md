# Danske skærmlæsertekster

## Fundet ved gennemsøgning
Alle `aria-label`-, `sr-only`- og `title`-tekster i appens egne sider og komponenter er allerede på dansk. Der er ingen `alt`-tekster. Der er kun engelske skærmlæsertekster tre steder:

1. **Lukkeknappen i dialoger** (`src/components/ui/dialog.tsx` linje 49): den skjulte tekst "Close".
2. **Lukkeknappen på beskederne** nederst på skærmen: beskedsystemet læser den som "Close toast".
3. **Området med beskederne**: beskedsystemet kalder det "Notifications".

## Ændringer
- `src/components/ui/dialog.tsx`: "Close" bliver til "Luk".
- `src/components/ui/sonner.tsx`:
  - `toastOptions.closeButtonAriaLabel = "Luk besked"`
  - `containerAriaLabel = "Beskeder"`

Kun de skjulte tekster ændres. Udseende, layout og funktion er de samme.

## Kontrol
I testbrowseren åbnes en dialog og en besked. Derefter tjekkes det, at lukkeknapperne hedder "Luk" og "Luk besked", og at området med beskederne hedder "Beskeder".
