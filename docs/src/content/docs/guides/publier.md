---
title: Publier
description: Builds EAS preview et production, soumission TestFlight et piste interne Google Play, mises à jour OTA, et la checklist de conformité.
---

## Avant le premier build

1. `bun daroms doctor` vert.
2. `manifest.store.privacyUrl` et `manifest.store.supportEmail` renseignés (requis par les stores).
3. `bunx eas-cli login` (une fois). Le projet EAS est créé au premier build et son identifiant rangé dans `manifest.eas.projectId`.

## Les trois profils

| Profil | Commande | Usage |
|---|---|---|
| `development` | `bun daroms build development` | client de dev, requis pour les modules natifs hors Expo Go (`payments`, `push`) ; puis `bun daroms dev --dev-client` |
| `preview` | `bun daroms build preview` | APK Android et build iOS ad hoc, installation interne par lien et QR |
| `production` | `bun daroms build production` | build signé pour les stores |

Option commune : `--platform ios|android|all` (défaut `all`).

## Soumettre

```bash
bun daroms build production
bun daroms submit              # dernier build production : TestFlight et piste interne Google Play
```

Avant chaque soumission, relire `.claude/rules-ondemand/daroms-store-compliance.md`. Les refus fréquents :

- inscription possible sans suppression du compte dans l'app (le module `auth` l'ajoute aux réglages) ;
- Google proposé sur iOS sans Sign in with Apple ;
- achat numérique hors achats intégrés, ou paywall sans bouton Restaurer, prix, période, CGU et confidentialité ;
- pas d'URL de confidentialité publique, ou étiquettes de confidentialité incohérentes avec les SDK ;
- permission demandée trop tôt, sans texte clair, ou inutilisée ;
- écran vide ou « bientôt » ; pas de compte de test dans les notes de revue.

## Mettre à jour sans store (OTA)

```bash
bun daroms update production --message "Corrige le tri des livres"
```

Uniquement JavaScript et assets. Un changement natif (module, plugin, permission) demande un nouveau build et une `version` incrémentée dans le manifest : la version runtime est celle de l'app.

:::caution[Sous-module core/]
EAS envoie l'arbre de travail : vérifier que `core/` est bien présent (`git submodule update --init`) avant un build.
:::

## Avec Claude

`/daroms-store` (fiche FR/EN, mots-clés, captures, confidentialité, via l'agent `daroms-store`), `/daroms-build`, `/daroms-submit`, `/daroms-update`. `/daroms-submit` ne se lance que sur demande explicite.
