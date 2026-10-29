---
title: Manifest
description: Tous les champs de app.manifest.ts (validé par zod), leurs types et valeurs par défaut, et comment ils pilotent la configuration Expo et l'app.
---

`app.manifest.ts` décrit l'app : identité, langues, écrans, onglets, modules, monétisation, services. Il est validé par zod (`defineManifest`), lu par `app.config.ts` au build et par `getManifest()` au runtime. La CLI le réécrit (`g screen`, `module add`) : garder sa forme simple.

```ts
import { defineManifest } from '@daroms/lib/manifest-schema'

export default defineManifest({
  name: 'Lecture',
  slug: 'lecture',
  bundleId: 'com.daroms.lecture',
  version: '1.0.0',
  variant: 'tracker',
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  screens: ['home', 'books'],
  tabs: [
    { name: 'index', icon: 'House', titleKey: 'tabs.home' },
    { name: 'books', icon: 'BookOpen', titleKey: 'books.title' },
  ],
  modules: { onboarding: {}, settings: {} },
  monetization: { model: 'free' },
  store: { supportEmail: 'aide@exemple.fr', privacyUrl: 'https://exemple.fr/confidentialite' },
})
```

## Champs

| Champ | Type | Défaut | Rôle |
|---|---|---|---|
| `name` | texte, 1 à 30 caractères | requis | nom affiché |
| `slug` | `[a-z0-9-]+` | requis | identifiant Expo, dossier |
| `bundleId` | `com.exemple.app` | requis | identifiant iOS et Android |
| `version` | semver `1.2.3` | `1.0.0` | version de l'app et version runtime OTA |
| `scheme` | texte | slug | schéma de liens profonds |
| `variant` | `blank`, `list-detail`, `social`, `tracker`, `ai-chat`, `shop` | `blank` | variante de départ |
| `locales` | liste de `fr`, `en`, `es`, `de`, `it`, `pt` | `['fr', 'en']` | langues ; un fichier `locales/<iso>.json` par langue |
| `defaultLocale` | une des langues | `fr` | langue de repli |
| `orientation` | `portrait`, `landscape`, `default` | `portrait` | orientation |
| `screens` | liste de noms de features | `[]` | écrans attendus (vérifiés par `doctor`) |
| `tabs` | `{ name, icon, titleKey }[]` | `[]` | onglets : route dans `app/(tabs)/`, icône Lucide, clé i18n du titre |
| `modules` | `{ <slug>: config }` | `{}` | modules actifs et leur config (validée par chaque module) |
| `monetization` | `{ model, entitlement, trialDays }` | `free`, `pro`, `0` | `free`, `freemium`, `subscription`, `paid` |
| `supabase.projectRef` | texte | - | projet Supabase lié (`db push`, `db types`) |
| `eas.projectId`, `eas.owner` | texte | - | projet EAS (écrit au premier build) |
| `store` | `{ category, supportEmail, privacyUrl, termsUrl }` | - | fiche store ; `supportEmail` et `privacyUrl` requis pour soumettre |

## Ce que le manifest pilote

- **Configuration Expo** : `app.config.ts` appelle `withDaroms(ctx, { manifest, brand })` : nom, identifiants, schéma, orientation, icônes, splash, plugins des modules actifs (`core/modules/<slug>/plugin.ts`) et manifest injecté dans `extra`.
- **Navigation** : `TabsLayout` construit les onglets depuis `tabs` ; les modules ajoutent leurs routes et leurs gates.
- **Modules** : le registre `src/generated/modules.ts` n'importe que les modules de `modules`.
- **Runtime** : `getManifest()` de `@daroms/lib/manifest` relit le manifest validé (tests : `setManifestForTests`).

La marque est dans un fichier à part : [brand.ts](/reference/marque/).
