## Mål

Visuelt verificere at antals-tallene `(N)` er fjernet fra kategorioverskrifter både på forsiden (`/`) og i oversigten (`/arkiv`), og at spacing/typografi stadig ser korrekt ud.

## Trin

1. `navigate_to_sandbox` til `/` ved nuværende viewport (933×696).
2. `screenshot` af kategorilisten på forsiden — bekræft at der kun står formateret tid efter kategorinavnet, intet `(N)`.
3. `navigate_to_url` til `/arkiv`.
4. `screenshot` af kategorilisten i oversigten — samme kontrol.
5. Rapportér resultat. Hvis der findes rester af `(N)` eller spacing ser skæv ud, noter det og foreslå rettelse (kræver skift til build mode).

## Bemærkning

Kræver at brugeren er logget ind i preview. Hvis login-skærm dukker op, stopper jeg og beder brugeren logge ind.
