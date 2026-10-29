---
name: daroms-new
description: Crée l'app depuis app.spec.md avec daroms new (template, sous-module core, brand.ts, manifest, modules, bundle id) puis lance l'aperçu avec QR.
disable-model-invocation: true
---

# /daroms-new : créer l'app

1. Lire `app.spec.md` : nom, slug, variante, ton, couleurs, modules.
2. Depuis le dossier parent des projets, lancer une seule commande :
   `bun <chemin-du-coeur>/cli/daroms.ts new <slug> --name "<Nom>" --variant <variante> --primary <#hex> --accent <#hex> --tone <ton> --radius <lg|full|md> --modules <a,b>` (+ `--local` si les données du cahier sont locales)
   (bundle id par défaut `com.daroms.<slug>` ; `--bundle` pour un autre). Copier `app.spec.md` dans la nouvelle app.
3. Dans l'app : `cp .env.example .env` ; demander à l'utilisateur l'URL et la clé publique Supabase (ne jamais lire `.env`), ou continuer sans backend.
4. `bun daroms doctor --quick` : doit être vert.
5. `bun daroms dev` (QR pour Expo Go, même Wi-Fi ou `--tunnel` ; `--dev-client` une fois un build de dev installé) ou `bun daroms shot /` pour un contrôle sans téléphone.
6. **Stop** : donner le chemin de l'app et la commande de lancement.
