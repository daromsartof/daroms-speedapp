---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---
# État et logique

> Serveur = TanStack Query ; local persistant = @daroms/lib/storage ; global UI = Zustand, un store par feature, rare.

- Pas de `useEffect` pour charger des données : `useQuery`. Pas de copie de données serveur dans un state.
- Persistant simple : `storage.getBoolean/setBoolean`, `getJSON(key, schema)` ; store persistant : `persist` + `zustandStorage`.
- Fonctions pures dans `src/lib/<domaine>/` avec un test `*.test.ts` ; formats : `formatPrice`, `formatDate`, `formatRelative` ; jours : `dayKey`, `addDays`, `daysBetween`, `lastDays`, `streak`, `formatWeekday` (`@daroms/lib`, calcul calendaire sûr à l'heure d'été).
- Haptique : intégrée aux composants ; ailleurs `haptic('success')` (`@daroms/lib/haptics`).
- `any` interdit ; `unknown` + zod pour les données externes.
