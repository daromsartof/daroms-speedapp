---
name: daroms-polish
description: Finition UX par l'agent daroms-designer - espacements, hiérarchie, états, accessibilité, haptique, micro-animations, mode sombre - puis application des corrections.
---

# /daroms-polish : finition

1. Lister les écrans (manifest `screens`) et prendre les captures : `bun daroms shot /<route> --capture` et `--dark --capture`.
2. Déléguer la revue à l'agent `daroms-designer` en lui donnant : chemins des captures, `app.spec.md` (ton), fichiers des écrans. Demander au plus 10 corrections classées par impact.
3. Appliquer les corrections (tokens, composants du catalogue, `transition`, `aria-label`, textes plus courts). Pas de nouvelle dépendance.
4. Re-capturer les écrans modifiés ; vérifier clair et sombre.
5. **Stop** : liste des corrections appliquées (une ligne chacune).
