# Référence des règles

Noyau : `_ai/CLAUDE.core.md` (toujours chargé). Détail : `_ai/rules/` (chargé selon les fichiers), `_ai/rules-ondemand/` (à la demande). Résumé une ligne par règle : `_ai/digest.md`.

| Règle | Vérifiée par |
|---|---|
| Routes minces (`app/**` = réexports) | ESLint, hook check-rules |
| Couleurs : tokens seulement | ESLint, hook, typage Tamagui (`somewhat-strict`) |
| Pas de nombre magique de style, `StyleSheet`, style inline | ESLint, hook |
| Supabase seulement dans `features/x/api.ts` | ESLint, hook |
| `any` interdit | ESLint, hook |
| Textes via `t()`, sans emoji ni tiret long, clés FR = EN | ESLint, hook, doctor |
| Pas de librairie UI ni d'icônes tierces | ESLint, hook |
| Imports absolus `@/`, `~/` | ESLint |
| Fichiers <= 200 lignes | ESLint, hook |
| RLS sur chaque table, pas de `service_role` dans l'app | générateur, agent daroms-reviewer |
| 4 états par écran | générateur, QueryView/List, agent reviewer |
| `.env` jamais lu | permissions deny, hook deny-env |
