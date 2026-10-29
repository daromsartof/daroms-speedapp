---
title: Formulaires
description: Construire un formulaire avec FormField, react-hook-form et zod, avec messages d'erreur traduits et envoi par une mutation TanStack Query.
---

Un formulaire daroms = un schéma zod, `useForm` avec `zodResolver`, des `FormField`, et une mutation de `api.ts`.

## Exemple complet

```tsx
// src/features/books/components/BookForm.tsx
import { useT } from '@daroms/i18n'
import { zRequired } from '@daroms/lib/zod'
import { Button, FormField, notify, YStack } from '@daroms/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateBook } from '../api'

const schema = z.object({
  title: zRequired,
  pages: z.coerce.number<string>().int().positive('daroms:validation.positive'),
})
type Values = z.input<typeof schema>

export function BookForm({ onDone }: { onDone: () => void }) {
  const t = useT()
  const create = useCreateBook()
  const form = useForm<Values, unknown, z.output<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { title: '', pages: '' } })
  const submit = form.handleSubmit((values) =>
    create.mutate(values, {
      onSuccess: () => {
        notify.success(t('books.saved'))
        onDone()
      },
    }),
  )
  return (
    <YStack gap="stack">
      <FormField control={form.control} name="title" label={t('books.fields.title')} />
      <FormField control={form.control} name="pages" label={t('books.fields.pages')} keyboardType="number-pad" />
      <Button fullWidth loading={create.isPending} onPress={() => void submit()}>
        {t('books.add')}
      </Button>
    </YStack>
  )
}
```

## Ce qu'il faut savoir

- **Messages d'erreur = clés i18n.** Un message zod est traduit par `FormField` : `'daroms:validation.required'` (textes du cœur) ou une clé de l'app (`'books.errors.title'`).
- **Schémas prêts** dans `@daroms/lib/zod` : `zEmail`, `zPassword` (8 caractères min.), `zRequired`, `zUuid`, `zUrl`, `zIsoDate`, `zMoney`, `zPositiveInt`, `zRow` (champs communs des lignes).
- **Sortie transformée.** `FormField` accepte un formulaire dont la sortie zod diffère de l'entrée : un champ nombre se saisit en texte (`z.coerce.number<string>()`, défaut `''`) et sort en nombre. Typer `useForm<z.input<...>, unknown, z.output<...>>`.
- **Clavier.** Les props d'`Input` passent par `FormField` : `keyboardType`, `secureTextEntry`, `autoComplete`, `autoCapitalize`. Écran avec formulaire : `<Screen keyboard>`.
- **Tests e2e.** Chaque champ porte `testID="field-<name>"` pour Maestro.
- **Dans une feuille.** Formulaire de création dans `<Sheet open onOpenChange title>` ; fermer dans `onSuccess`.
- **Erreur serveur.** `create.error` est une `AppError` : `notify.error(...)` ou `<ErrorState error={create.error} />`.
