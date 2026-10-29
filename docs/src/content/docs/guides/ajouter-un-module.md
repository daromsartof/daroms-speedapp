---
title: Ajouter un module
description: Activer un module du cœur (auth, onboarding, settings, payments, push, analytics, ai-chat, camera, maps), le configurer et faire les étapes hors code.
---

Un module est une fonctionnalité optionnelle complète : provider, écrans, migrations, edge functions, textes, configuration validée par zod. Rien n'est importé tant qu'il n'est pas activé.

## 1. Activer

```bash
bun daroms module list          # modules disponibles et actifs
bun daroms module add payments
```

`module add` ajoute les modules requis (`requires`), les routes, les migrations, les edge functions, les variables de `.env.example`, les textes d'app, la configuration par défaut dans `app.manifest.ts > modules`, régénère le registre `src/generated/modules.ts` et installe les dépendances natives (`expo install`). `--no-install` saute l'installation.

## 2. Configurer

La configuration vit dans le manifest et est validée au démarrage par `core/modules/<slug>/config.ts` :

```ts
// app.manifest.ts
modules: {
  auth: { providers: ['email', 'apple'], requireAuth: true },
  payments: { entitlement: 'pro', mode: 'soft' },
},
```

Chaque page module liste ses clés, schémas et valeurs par défaut :

| Module | Rôle | Étape hors code |
|---|---|---|
| [auth](/reference/modules/auth/) | e-mail, Apple, Google, profil, suppression de compte | fournisseurs dans Supabase Auth, `<scheme>://**` en URL de redirection, `functions deploy delete-account` |
| [onboarding](/reference/modules/onboarding/) | pages d'accueil au premier lancement | - |
| [settings](/reference/modules/settings/) | onglet Réglages (apparence, langue, haptique, sections des modules) | - |
| [payments](/reference/modules/payments/) | paywall RevenueCat, statut Pro | clés publiques RevenueCat dans `.env`, entitlement et offering |
| [push](/reference/modules/push/) | notifications Expo, jeton par utilisateur | build de dev, projet EAS, `functions deploy send-push` |
| [analytics](/reference/modules/analytics/) | événements par lots dans Supabase | - |
| [ai-chat](/reference/modules/ai-chat/) | chat Claude en streaming | `bunx supabase secrets set ANTHROPIC_API_KEY=...`, `functions deploy ai-chat` |
| [camera](/reference/modules/camera/) | photos vers Supabase Storage, `PhotoPicker` | - |
| [maps](/reference/modules/maps/) | carte, marqueurs, position, distances | `GOOGLE_MAPS_ANDROID_API_KEY` pour les builds Android |

## 3. Appliquer la base

Si le module a des migrations : `bun daroms db push`. Edge functions : `bunx supabase functions deploy <fonction>`.

## 4. Modules natifs hors Expo Go

`payments` (achats réels) et `push` ont besoin d'un build de développement :

```bash
bun daroms build development
bun daroms dev --dev-client
```

## Retirer

```bash
bun daroms module remove payments
```

Les migrations déjà appliquées restent dans la base.

## Avec Claude

`/daroms-module payments` active le module, règle le manifest selon `app.spec.md`, branche les écrans (ex. `<ProGate>`, `router.push('/paywall')`) et liste les étapes manuelles restantes.

Créer un nouveau module dans le cœur : [Développer le cœur](/guides/developper-le-coeur/).
