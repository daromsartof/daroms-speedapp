---
title: Ajouter un écran
description: Créer un écran complet avec daroms g screen (route mince, feature, i18n, test, manifest), le remplir avec @daroms/ui et le vérifier.
---

## 1. Générer

```bash
bun daroms g screen books --tab --icon BookOpen --title "Livres" --title-en "Books"
```

| Créé ou modifié | Rôle |
|---|---|
| `app/(tabs)/books.tsx` | route mince : `export { default } from '@/features/books/BooksScreen'` |
| `src/features/books/BooksScreen.tsx` | l'écran, déjà branché sur `QueryView` (4 états) |
| `src/features/books/hooks.ts`, `api.ts`, `schema.ts` | logique, données, schémas zod |
| `src/features/books/__tests__/BooksScreen.test.tsx` | test de rendu |
| `locales/fr.json`, `locales/en.json` | clés `books.title`, `books.emptyTitle`, `books.emptyDescription` |
| `app.manifest.ts` | écran ajouté à `screens`, onglet ajouté à `tabs` (avec `--tab`) |

Options : `--tab` (onglet), `--icon NomLucide` (icône d'onglet et d'état vide), `--route chemin` (défaut `(tabs)/<nom>` avec `--tab`, sinon `<nom>`), `--force` (réécrit). Feature sans route : `bun daroms g feature <nom>`.

## 2. Brancher les données

Si l'écran affiche une table, la créer d'abord ([Ajouter une table](/guides/ajouter-une-table/)) : l'écran se branche sur `useBooks()`.

```ts
// src/features/books/hooks.ts
import { useBooks } from './api'

export function useBooksScreen() {
  const query = useBooks()
  return { query }
}
```

## 3. Remplir avec @daroms/ui

Lire le [catalogue](/reference/composants/) et composer. Les 4 états (chargement, vide, erreur avec réessai, données) sont gérés par `QueryView` ou `List` :

```tsx
import { useT } from '@daroms/i18n'
import { Header, List, ListItem, Screen } from '@daroms/ui'
import { BookOpen } from '@daroms/ui/icons'
import { useCallback } from 'react'

import { useBooksScreen } from './hooks'
import type { Book } from './schema'

export default function BooksScreen() {
  const t = useT()
  const { query } = useBooksScreen()
  const renderItem = useCallback(({ item }: { item: Book }) => <ListItem title={item.title} subtitle={item.author ?? undefined} chevron />, [])
  return (
    <Screen scroll={false} header={<Header title={t('books.title')} large />}>
      <List
        data={query.data}
        loading={query.isPending}
        error={query.error}
        onRetry={query.refetch}
        empty={{ icon: BookOpen, title: t('books.emptyTitle') }}
        renderItem={renderItem}
      />
    </Screen>
  )
}
```

Ce que les hooks refusent ici : couleur hex, `p={14}`, `StyleSheet.create`, texte en dur dans le JSX, import de Supabase. Voir [les règles](/reference/regles/).

## 4. Vérifier

```bash
bun daroms shot /books           # erreurs, débordements, capture si utile
bun daroms shot /books --dark    # mode sombre
bun daroms test books            # test de la feature
```

Détail : [Vérifier](/guides/verifier/).

## Avec Claude

```text
/daroms-screen books --tab --icon BookOpen
```

Le skill lit le wireframe de l'écran dans `app.spec.md`, lance `g screen`, remplit l'écran, ajoute les textes FR/EN, écrit le test et contrôle le rendu clair et sombre.
