---
title: Textes et langues
description: Afficher tout texte avec t('cle'), garder les mêmes clés en FR et EN, utiliser les textes du cœur et des modules, ajouter une langue.
---

Aucun texte affiché n'est écrit en dur : le hook `daroms-check-rules` refuse un texte dans le JSX, et `daroms doctor` vérifie que chaque langue a les mêmes clés.

## Écrire un texte

```json
// locales/fr.json
{ "books": { "title": "Livres", "count": "{{count}} livres" } }
```

```json
// locales/en.json
{ "books": { "title": "Books", "count": "{{count}} books" } }
```

```tsx
import { useT } from '@daroms/i18n'

const t = useT()
<Title>{t('books.title')}</Title>
<Caption>{t('books.count', { count: books.length })}</Caption>
```

`useT()` est typé par les clés de l'app : une clé absente est une erreur TypeScript.

## Règles des textes

- Mêmes clés dans chaque fichier de `locales/` (vérifié par `daroms doctor`).
- Ni emoji, ni tiret long dans les textes.
- Textes d'interface courts, en voix active ; un bouton dit ce qu'il fait (« Ajouter un livre »).

## Namespaces

| Namespace | Contenu | Accès |
|---|---|---|
| `app` (défaut) | `locales/*.json` de l'app | `useT()` |
| `daroms` | textes du cœur : boutons standard, états, erreurs, validation | `useDaromsT()`, ou clé préfixée `daroms:validation.email` |
| `<module>` | textes d'un module (`auth`, `payments`, `aiChat`...) | hook du module ; clé préfixée `aiChat:title` dans le manifest |

`useTranslateKey()` traduit une clé éventuellement préfixée (`daroms:validation.required`) : c'est ce qu'utilisent `FormField` et `ErrorState`.

## Langues

- Le manifest déclare `locales` (`fr`, `en`, `es`, `de`, `it`, `pt`) et `defaultLocale`.
- La langue de l'appareil est détectée (expo-localization) ; l'utilisateur peut la changer dans le module `settings`.
- Ajouter une langue : l'ajouter à `locales` dans `app.manifest.ts`, créer `locales/<iso>.json` avec toutes les clés, puis `bun daroms doctor`.
- Contrôle visuel dans une langue : `bun daroms shot /books --locale en`.

## Formats

Dates, nombres et prix suivent la langue : `formatDate`, `formatRelative`, `formatNumber`, `formatPrice`, `formatPercent`, `formatWeekday` de `@daroms/lib`. Voir [Paquets](/reference/paquets/#daromslib).
