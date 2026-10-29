---
title: Variantes d'app
description: Les 6 variantes de départ de daroms new (blank, list-detail, tracker, ai-chat, social, shop) avec leurs modules, tables et écrans.
---

Une variante est une recette appliquée à la création (`daroms new <slug> --variant <nom>`) : modules activés avec leur configuration, tables générées, écrans générés. Elle vit dans `template/variants/<nom>/variant.json`. `/daroms-idea` choisit la variante dans `app.spec.md`.

| Variante | Pour | Modules | Tables | Écrans (onglets) |
|---|---|---|---|---|
| `blank` | partir de zéro | aucun | aucune | Accueil |
| `list-detail` | collection personnelle : notes, lieux, recettes | auth, settings | `items` (`title:text, notes:text?, favorite:bool=false`) | Éléments |
| `tracker` | habitudes, progrès : entrées datées, rappels | onboarding, auth, settings, push | `entries` (`label:text, value:numeric=1, done_on:date`) | Aujourd'hui, Progression |
| `ai-chat` | assistant IA avec abonnement | onboarding, auth, ai-chat, payments (`soft`), settings | aucune | Chat |
| `social` | réseau léger : publications, profils, fil | auth, push, settings | `posts` (`body:text, image_url:text?`) | Fil |
| `shop` | catalogue, panier, commandes | auth (`requireAuth: false`), settings, analytics | `products`, `orders` | Boutique, Commandes |

Notes des variantes :

- `social` : la lecture publique des posts demande une politique `select to authenticated using (true)` en plus de la RLS propriétaire, voir [Données et sécurité](/explications/donnees-et-securite/).
- `shop` : le catalogue est en lecture publique et les achats physiques passent par un paiement externe (Stripe) à ajouter en module ; les achats intégrés (`payments`) ne conviennent qu'aux biens numériques.

## Options utiles

```bash
bun daroms new carnet --variant list-detail --local        # tables sur l'appareil, sans Supabase
bun daroms new coach --variant tracker --modules analytics # modules en plus
```

Après la création, tout se modifie : `module add|remove`, `g table`, `g screen`. Voir [CLI, new](/reference/cli/#new).
