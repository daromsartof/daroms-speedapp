---
name: daroms-polish
description: Finition UX par l'agent daroms-designer - espacements, hiérarchie, états, accessibilité, haptique, micro-animations, mode sombre - puis application des corrections.
context: fork
background: false
model: sonnet
effort: medium
---

# /daroms-polish : finition

1. Lister les écrans (manifest `screens`) et prendre les captures : `bun daroms shot /<route> --capture` et `--dark --capture`. Garder les lignes `mesure` du rapport.
2. Mesures d'abord : corriger chaque mesure en défaut (compter ne se discute pas), sauf exception écrite dans `app.spec.md > Inspiration`.
3. Déléguer la revue à l'agent `daroms-designer` en lui donnant : chemins des captures, mesures restantes, `app.spec.md` (ton et `## Inspiration`), fichiers des écrans. Demander au plus 10 corrections classées par impact.
4. Appliquer les corrections (tokens, composants du catalogue, `transition`, `aria-label`, textes plus courts). Pas de nouvelle dépendance.
   Accessibilité : passer la liste de `ecc-accessibility`, traduite par `daroms-ecc` (libellés, contraste, cible 44 pt, état pas seulement en couleur).
5. Re-capturer les écrans modifiés ; vérifier clair et sombre, mesures toutes ok.
6. **Stop** : liste des corrections appliquées (une ligne chacune).
