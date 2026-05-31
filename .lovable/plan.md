## Hvad bygges

To små, lavrisiko forbedringer. Ingen ændringer i database, auth eller backend-logik.

### 1. Tal-genveje til kategorivalg

Når stopuret afsluttes og **"Gem registrering"**-dialogen åbner, kan tasterne `1`–`9` vælge en kategori direkte.

- Mapper til de første 9 synlige (ikke-skjulte) kategorier i den rækkefølge brugeren ser dem i dialogens dropdown — typisk styret af `sort_order` og brugerens "aktive kategorier"-filter, så genvejene matcher det du faktisk har på listen.
- `0` (valgfrit) = ryd valg.
- Genveje virker **kun** når dialogen er åben og fokus ikke er i kommentar-feltet.
- Visuelt hint: lille tal-badge ved siden af hver kategori i dropdown'en (`1`, `2`, …).
- Genvejene listes i en lille "?" tooltip eller helptekst i dialogen.

Eksisterende stopur-genveje (mellemrum/N/A/Esc) røres ikke.

### 2. PWA-installation (manifest-only)

Gør appen installerbar via "Føj til hjemmeskærm" på iOS/Android og som desktop-app i Chrome/Edge. **Ingen service worker**, ingen offline-cache — undgår de problemer service workers giver i Lovable-preview og stale-cache hovedpine.

- `public/manifest.webmanifest` med navn, korte navn, ikoner, `theme_color`, `background_color`, `display: "standalone"`, `start_url: "/"`.
- Ikoner i 192px og 512px (PNG, genereres ud fra eksisterende `precisely-logo.svg`) + maskable-variant.
- Link i `__root.tsx` `<head>`: `<link rel="manifest" href="/manifest.webmanifest">` + Apple-specifikke tags (`apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`).
- Theme color matcher app-baggrunden så status-baren ser rigtig ud.

### Hvad sker der IKKE i denne omgang

- Ingen offline-tolerance for timer'en (gemt til en senere runde).
- Ingen 2FA.
- Ingen service worker (bevidst — kræver mere arbejde for at undgå stale cache).

## Filer

- **Ny**: `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable-512.png`.
- **Rediger**: `src/routes/__root.tsx` (manifest + Apple meta-tags i head), `src/components/oversigt/MeasurementDialog.tsx` (digit-keybinding + badge), evt. `src/hooks/use-categories.ts` hvis vi skal eksponere "synlig rækkefølge" pænt.

## Bemærk efter publicering

PWA-installation virker kun på den **publicerede** URL — ikke i Lovable's preview-iframe. Test ved at åbne den publicerede side på din telefon → "Føj til hjemmeskærm".
