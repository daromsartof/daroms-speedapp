---
name: daroms-polish
description: Finition UX par l'agent daroms-designer - grille notée sur 10 face aux références d'inspiration, élément signature par écran, points critiques, espacements, hiérarchie, états, accessibilité, mouvement, mode sombre - puis application des corrections, trois tours au plus, jusqu'à 8 sur 10.
context: fork
background: false
model: sonnet
effort: medium
---

# /daroms-polish : finition

1. Lister les écrans (manifest `screens`) et prendre les captures : `bun daroms shot /<route> --capture` et `--dark --capture`. Garder les lignes `mesure` du rapport.
2. Mesures d'abord : corriger chaque mesure en défaut (compter ne se discute pas), sauf exception écrite dans `app.spec.md > Inspiration`.
3. Déléguer la critique à l'agent `daroms-designer` en lui donnant : chemins des captures, chemins des images de `.daroms/inspiration/` (il les compare côte à côte), mesures restantes, `app.spec.md` (ton, direction, `## Inspiration`, `## Mouvement`), fichiers des écrans. Il rend la grille notée, l'élément signature de chaque écran (ou son absence), les points critiques et au plus 10 corrections classées par impact.
4. Appliquer chaque point critique et chaque correction à fort impact (tokens, composants du catalogue, `Hero`, `Illustration`, `Gradient`, `Reveal`, `transition`, `aria-label`, textes plus courts) ; un écran sans élément signature en reçoit un (illustration, héros en dégradé, chiffre mis en scène, carte en relief) ; une meilleure solution qu'une correction proposée est permise, en disant pourquoi. Ne rien dégrader de ce qui était bien noté. Pas de nouvelle dépendance.
   Accessibilité : passer la liste de `ecc-accessibility`, traduite par `daroms-ecc` (libellés, contraste, cible 44 pt, état pas seulement en couleur).
5. Re-capturer les écrans modifiés ; vérifier clair et sombre, mesures toutes ok.
6. Tour suivant tant qu'une note reste < 8 ou qu'un point critique demeure : nouvelle critique des écrans modifiés, en donnant la critique précédente. Trois tours au plus ; au-delà, lister ce qui bloque le 8 (souvent : contenu, illustration ou référence manquante).
7. **Stop** : notes avant -> après (une ligne par dimension), puis les corrections appliquées ou écartées (une ligne chacune, raison si écartée).
