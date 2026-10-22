---
paths:
  - "src/features/**/*Screen.tsx"
  - "src/features/**/components/**"
---
# Écrans

> Chaque écran gère 4 états (chargement, vide, erreur + réessayer, données) et reste sous 200 lignes.

- Squelette : `<Screen header={<Header title={t('x.title')} back|large />} onRefresh refreshing>` puis contenu.
- 4 états : `QueryView query={q} empty={{...}}` (ou `List data loading error onRetry empty`) ; jamais d'état oublié.
- Formulaire : `useForm({ resolver: zodResolver(schema) })` + `FormField control name label` ;
  soumission `onPress={() => void form.handleSubmit(onValid)()}` ; bouton `loading={mutation.isPending}`.
- Pied fixe (action principale) : `Screen footer={<Button fullWidth>...}`. Clavier : `Screen keyboard`.
- Retour utilisateur : `notify.success|error(t('...'))` ; confirmation destructive : `Dialog destructive`.
- Feuilles : `Sheet open onOpenChange title` pour créer/éditer sans changer d'écran.
- Découper dès ~150 lignes : `components/XItem.tsx` (mémoïsé), logique dans `hooks.ts`.
- Vérifier : `bun daroms shot /route` (puis `--dark`).
