---
name: daroms-skill-new
description: Crée un nouveau skill au bon endroit et au bon format - daroms-* dans le cœur (générique) ou app-* dans l'app (spécifique).
argument-hint: "<nom> <objectif>"
---

# /daroms-skill-new : nouveau skill

Demande : $ARGUMENTS

1. Décider la portée : utile à toutes les apps -> `daroms-<nom>` dans le dépôt cœur `_ai/skills/` ; propre à cette app -> `.claude/skills/app-<nom>/SKILL.md`.
2. Format : frontmatter `name`, `description` (ce que fait le skill et quand l'utiliser, une phrase), `argument-hint` si arguments, `disable-model-invocation: true` si effets externes (build, publication, envoi).
3. Corps : titre, étapes numérotées, décisions déjà prises, commandes `bun daroms` déterministes plutôt que du code, point d'arrêt **Stop** explicite. 40 lignes au plus.
4. Si le skill répète du code : proposer un générateur ou une commande CLI dans le cœur.
5. **Stop** : chemin du skill créé.
