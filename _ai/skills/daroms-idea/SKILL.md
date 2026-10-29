---
name: daroms-idea
description: Brainstorm court qui transforme une idée d'app en cahier app.spec.md (cible, boucle principale, 3 à 6 écrans, données, modules, monétisation, nom, ton, variante).
argument-hint: "<idée>"
---

# /daroms-idea : de l'idée au cahier

Idée : $ARGUMENTS

1. Poser au plus 3 questions groupées (AskUserQuestion) seulement si une décision bloque : cible, monétisation, fonction principale. Sinon décider et l'écrire.
2. Rédiger `app.spec.md` (format ci-dessous), en français, sans emoji ni tiret long :
   - **Pitch** (1 phrase), **Cible** (1 persona), **Boucle principale** (déclencheur, action, récompense, retour).
   - **Écrans** (3 à 6) : tableau `Écran | Rôle | Données | États` ; nom en kebab-case (= route et feature).
   - **Données** : tableau `Table | Colonnes (nom:type) | RLS` au format de `bun daroms g table --fields` ; préciser **Supabase** (compte, synchro, partage) ou **local** (appareil seul, sans compte : `--local`).
   - **Modules** parmi `bun daroms module list` (auth, onboarding, settings, payments, push, analytics, ai-chat, camera, maps) avec leur config.
   - **Monétisation** (free, freemium, subscription) et ce qui est Pro.
   - **Nom** (3 propositions, choisir la 1re), **slug**, **ton** (playful, pro, minimal), couleur principale et accent (hex).
   - **Variante** de départ : blank, list-detail, tracker, ai-chat, social, shop.
3. Afficher le tableau des écrans et la ligne marque. **Stop** : attendre la validation avant `/daroms-new`.
