---
paths:
  - "app/**/*.tsx"
---
# Routes minces

> app/** ne contient que des réexportations d'écrans ; aucune logique, aucun JSX.

- Une route = une ligne : `export { default } from '@/features/<slug>/<Name>Screen'`.
- Layouts : `export { default } from '@/features/root/RootLayout'` ; écrans de module : `export { XScreen as default } from '@daroms/module-x'`.
- Créer une route : `bun daroms g screen <slug> [--tab --icon Nom]` (route + feature + i18n + test + manifest).
- Onglets : déclarés dans `app.manifest.ts > tabs` (nom, icône Lucide, clé de titre), pas dans le layout.
- Paramètres : `app/todo/[id].tsx` -> l'écran lit `useLocalSearchParams<{ id: string }>()`.
- Navigation : `useRouter()` ; liens typés (`router.push('/todo/42')`).
