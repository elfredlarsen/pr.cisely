# Primært landmark på login-siden

## Problem
Lighthouse melder, at login-siden mangler et primært landmark. Siden har ikke noget hovedområde, som skærmlæsere kan hoppe direkte til.

## Ændring
- Det yderste område på login-siden får rollen som sidens hovedindhold.
- Udseende, tekster, knapper og dialogen "Glemt adgangskode" ændres ikke.

## Tekniske detaljer
- `src/routes/login.tsx`: det yderste `<div className="flex min-h-screen ...">` ændres til `<main>` med de samme klasser.
- Dialogen renderes i en portal uden for `<main>` og påvirkes derfor ikke.
- Bagefter kontrolleres det i testbrowseren, at login-siden har præcis ét `<main>`.
