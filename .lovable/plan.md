## Plan: Tilføj testdata til begge brugere

Indsæt realistiske stopur-målinger for de sidste 14 dage til begge eksisterende brugere (`elfredlarsen@gmail.com` og `coslarsen@gmail.com`), så historik, oversigt, arkiv og skjul/vis-funktionerne kan demonstreres.

### Hvad indsættes

Per bruger, per hverdag (mandag–fredag, sidste 14 dage = ca. 10 hverdage):
- **4–7 målinger om dagen** fordelt på arbejdsdagen kl. 8:30–16:00
- **Varigheder** mellem 3 min og 95 min — realistisk variation
- **Kategorier** trækkes vægtet fra de eksisterende 12, så `Arbejdstager`, `Studerende`, `EU-familiemedlem`, `Biometri` og `EU-vejledning` optræder ofte, mens resten optræder spredt
- **Kommentarer** på ca. 30 % af målingerne (korte, fx "telefonisk opfølgning", "dokumentation modtaget")
- **Skjulte målinger**: ca. 10 % markeres `hidden = true`, spredt ud over perioden — så skjul/vis kan testes
- Et par weekend-målinger (lørdag) for variation

I alt ca. **50–70 målinger per bruger** (~100–140 rækker samlet).

### Sådan gøres det

- Genereres deterministisk via en SQL `INSERT ... SELECT` med `generate_series` + et fast seed, så `ms` præcis matcher `ended_at - started_at` (overholder Zods ±2s-tjek hvis nogen senere editerer dem via serverfn)
- `user_id` sættes eksplicit til hver af de to bruger-ID'er
- Kører via `supabase--insert`-værktøjet (data-ændring, ingen skemaændring)
- Ingen kodeændringer i frontend/backend — kun data

### Bagefter

Du kan logge ind som hver bruger og se:
- Historik på `/` med dagens målinger
- Oversigt/arkiv på `/arkiv` med 14 dages data fordelt på kategorier
- Skjulte målinger i indstillinger
- Retention/oprydning på ældre data hvis du sætter `retention_days` lavt
