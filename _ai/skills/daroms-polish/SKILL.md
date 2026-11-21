---
name: daroms-polish
description: Finition UX par l'agent daroms-designer - grille notée sur 10, points critiques, espacements, hiérarchie, états, accessibilité, haptique, mode sombre - puis application des corrections, deux tours au plus.
context: fork
background: false
model: sonnet
effort: medium
---

# /daroms-polish : finition

1. Lister les écrans (manifest `screens`) et prendre les captures : `bun daroms shot /<route> --capture` et `--dark --capture`. Garder les lignes `mesure` du rapport.
2. Mesures d'abord : corriger chaque mesure en défaut (compter ne se discute pas), sauf exception écrite dans `app.spec.md > Inspiration`.
3. Déléguer la critique à l'agent `daroms-designer` en lui donnant : chemins des captures, mesures restantes, `app.spec.md` (ton et `## Inspiration`), fichiers des écrans. Il rend la grille notée, les points critiques et au plus 10 corrections classées par impact.
4. Appliquer chaque point critique et chaque correction à fort impact (tokens, composants du catalogue, `transition`, `aria-label`, textes plus courts) ; une meilleure solution qu'une correction proposée est permise, en disant pourquoi. Ne rien dégrader de ce qui était bien noté. Pas de nouvelle dépendance.
   Accessibilité : passer la liste de `ecc-accessibility`, traduite par `daroms-ecc` (libellés, contraste, cible 44 pt, état pas seulement en couleur).
5. Re-capturer les écrans modifiés ; vérifier clair et sombre, mesures toutes ok.
6. Second tour seulement si une note reste < 7 ou un point critique demeure : nouvelle critique des écrans modifiés, en donnant la critique précédente. Deux tours au plus.
7. **Stop** : notes avant -> après (une ligne par dimension), puis les corrections appliquées ou écartées (une ligne chacune, raison si écartée).
