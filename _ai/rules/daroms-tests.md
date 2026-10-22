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
- Maestro : `e2e/<flow>.yaml` (`appId` = bundleId), sélection par texte visible ; lancer `bun daroms e2e`.
- Lancer : `bun daroms test [motif]`.
