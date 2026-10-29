# Tutoriel : ton app en un jour

Objectif : partir d'une idée le matin et installer l'app sur un téléphone le soir, en laissant Claude faire le répétitif.

## Prérequis (une fois)

- Node >= 22.18, Bun >= 1.3, Python 3, Git ; Android Studio (émulateur) ou Xcode (simulateur) facultatifs.
- Comptes : Expo (EAS), Supabase ; Apple Developer et Google Play pour publier.
- Le cœur : `git clone https://github.com/daromsartof/Daroms-Speed-App.git daroms-speed-app && cd daroms-speed-app && bun install`.
- Commande globale facultative : `bun link` dans le cœur, puis `daroms` partout.

## Matin : cadrer et créer (1 h)

1. Ouvrir Claude Code dans le dossier des projets et lancer `/daroms-day Une app pour suivre ses habitudes de lecture`.
2. **Cadrage** (`/daroms-idea`) : Claude écrit `app.spec.md` (cible, boucle principale, 3 à 6 écrans, tables, modules, monétisation, nom, ton). Relire et valider.
3. **Création** (`/daroms-new`) : une commande crée l'app complète :
   ```
   bun ../daroms-speed-app/cli/daroms.ts new lecture --name "Lecture" --variant tracker --primary "#0F766E" --accent "#F59E0B" --tone minimal
   ```
   Template, sous-module `core/`, `brand.ts`, `app.manifest.ts`, modules, icônes générées, dépendances, couche IA (`.claude/`), commit initial.
4. `cd lecture && cp .env.example .env` (URL et clé publique Supabase), puis `bun daroms dev` : scanner le QR.

## Midi : marque, design, données (2 h)

5. **Marque** (`/daroms-brand`) : 5 valeurs dans `brand.ts`, icône SVG, `bun daroms assets`. Vérifier `/_dev/kitchen-sink` en clair et en sombre.
6. **Design** (`/daroms-design`) : wireframes texte par écran dans `app.spec.md`, uniquement avec les composants du [catalogue](../packages/ui/CATALOG.md).
7. **Données** (`/daroms-data`) : `bun daroms g table books --fields "title:text, author:text?, pages:int=0"` crée la migration avec RLS, le schéma zod, les hooks `useBooks`, `useCreateBook`... puis `bun daroms db push`.

## Après-midi : écrans et modules (3 h)

8. **Écrans** (`/daroms-screen books --tab --icon BookOpen`) : route mince, feature, 4 états, textes FR/EN, test ; Claude remplit avec `@daroms/ui` et vérifie avec `bun daroms shot /books`.
9. **Modules** (`/daroms-module payments`) : paywall RevenueCat, statut Pro, restauration ; idem `push`, `ai-chat`, `analytics`, `camera` (photos vers Supabase Storage), `maps` (carte, position).
10. **Vérification** (`/daroms-check`) puis **finition** (`/daroms-polish`) : revue visuelle par l'agent designer.

## Soir : publier (1 h)

11. **Fiche store** (`/daroms-store`) : titres, mots-clés, descriptions FR/EN, captures, politique de confidentialité.
12. **Build** (`/daroms-build preview`) : installation interne par QR ; puis `production` et `/daroms-submit` (TestFlight, piste interne).
13. **Bilan** : `/daroms-learn` (zones de contexte), `/daroms-commit`, et `.claude/stats.jsonl` donne le coût en tokens de chaque étape, à faire baisser à l'app suivante.
