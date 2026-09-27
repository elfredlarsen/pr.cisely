# Roadmap

- [x] Fjern offline-køen; fejl i gem-vinduet; ryd precisely.offline-queue.v1
- [ ] Fjern measurements.hidden — venter: skal køres af brugeren i SQL-editoren (værktøjet må ikke slette kolonner)
- [x] Erstat measurements.category med category_id (FK, samme bruger, ON DELETE RESTRICT) + backfill (gammel kolonne slettes sammen med hidden)
- [x] Opdatér koden til category_id
