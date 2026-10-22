# Module analytics

Analytique légère et souveraine : événements envoyés par lots dans Supabase (`analytics_events`, écriture seule).

- Activer : `bun daroms module add analytics`.
- Code : `track('todo_created', { source: 'sheet' })` ; les écrans sont suivis automatiquement.
- Lecture : requêtes SQL dans le tableau de bord Supabase (aucune lecture depuis l'app).
- Config : `sink` (`supabase` | `console`), `flushIntervalMs`, `screens`.
