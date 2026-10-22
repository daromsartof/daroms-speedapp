---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "e2e/**"
---
# Tests

> Tests unitaires jest-expo à côté du code ; flows Maestro dans e2e/ ; pas de réseau dans les tests.

- Écran : `renderApp(<XScreen />, { config, locales: { fr } })` (`@daroms/app/testing`) ; `await` sur render et `fireEvent`.
- Données simulées : `jest.mock('./api', ...)` avec une variable préfixée `mock`.
- Fonctions pures `src/lib/` : test systématique.
- Maestro : `e2e/<flow>.yaml` (`appId: ${APP_ID}`), textes `'Texte FR|Text EN'`, champs par `id: 'field-<nom>'` (testID automatique de FormField) ;
  `bun daroms e2e` (build installé) ou `bun daroms e2e --go` (Expo Go, Metro lancé : `bun daroms dev --go`).
- Données de démo pour `shot` : `bun daroms shot /route --storage-file e2e/fixtures/demo.json`.
- Lancer : `bun daroms test [motif]`.
