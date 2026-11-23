---
name: daroms-idea
description: Brainstorm court qui transforme une idée d'app en cahier app.spec.md (cible, boucle principale, 3 à 6 écrans, données, modules, monétisation, nom, ton, direction artistique, variante) et écrit les textes de première impression (onboarding, accueil).
argument-hint: "<idée>"
---

# /daroms-idea : de l'idée au cahier

Idée : $ARGUMENTS

1. Poser au plus 3 questions groupées (AskUserQuestion) seulement si une décision bloque : cible, monétisation, fonction principale. Sinon décider et l'écrire.
2. Rédiger `app.spec.md` (format ci-dessous), en français, sans emoji ni tiret long :
   - **Pitch** (1 phrase), **Cible** (1 persona), **Boucle principale** (déclencheur, action, récompense, retour).
   - **Écrans** (3 à 6) : tableau `Écran | Rôle | Données | États` ; nom en kebab-case (= route et feature).
   - **Données** : tableau `Table | Colonnes (nom:type) | RLS` au format de `bun daroms g table --fields` ; préciser **Supabase** (compte, synchro, partage) ou **local** (appareil seul, sans compte : `--local`).
   - **Modules** parmi `bun daroms module list` (auth, onboarding, settings, payments, push, analytics, crash, ai-chat, camera, maps) avec leur config.
   - **Monétisation** (free, freemium, subscription) et ce qui est Pro.
   - **Nom** (3 propositions, choisir la 1re), **slug**, **ton** (playful, pro, minimal), **direction artistique** (clean : sobre, aplats ; editorial : titres à empattement Fraunces ; soft : relief doux, dégradé de marque, Plus Jakarta Sans ; vivid : dégradés francs, relief marqué, Sora), couleur principale et accent (hex), choisis pour que le dégradé principal vers accent raconte l'app.
   - **Variante** de départ : blank, list-detail, tracker, ai-chat, social, shop. Dans une app déjà créée (`app.manifest.ts`), reprendre la variante du manifest : tables, modules et marque du cahier s'ajoutent ensuite (`/daroms-data`, `/daroms-module`, `/daroms-brand`).
3. Première impression (elle se juge en 50 ms) : écrire `## Première impression` dans le cahier, puis dans l'app (si `app.manifest.ts` existe) :
   - onboarding, 3 pages : titre de 4 mots au plus, description de 9 mots au plus, un bénéfice concret par page (jamais « Bienvenue », « Rapide », « Pour vous ») ; une illustration par page parmi `welcome`, `growth`, `chat`, `secure`, `empty`, `success`, `calendar`, `focus`, `community`, `spark`, dans `app.manifest.ts > modules.onboarding.pages[].illustration` ;
   - textes dans `locales/fr.json` et `locales/en.json` : `onboarding.page1Title` .. `page3Description`, `home.welcome`, `home.intro` ;
   - `brand.ts > direction` d'après la direction choisie.
   `bun daroms doctor --quick` signale tout texte encore égal à celui du gabarit.
4. Afficher le tableau des écrans, la ligne marque et les 3 pages d'onboarding. **Stop** : attendre la validation (dans le parcours `/daroms-pilot` : `bun daroms steps ready 1 "<résumé>"` puis `/daroms-valider` de l'utilisateur ; hors app : `/daroms-new` crée l'app d'après le cahier).
