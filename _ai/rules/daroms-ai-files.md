---
paths:
  - ".claude/**"
  - "CLAUDE.md"
  - "app.spec.md"
---
# Fichiers IA

> Les fichiers daroms-* de .claude/ sont écrasés à chaque synchro ; ce qui est propre à l'app porte le préfixe app-.

- Règle propre à l'app : `.claude/rules/app-<sujet>.md` (frontmatter `paths:`, une ligne `> résumé`).
- Skill propre à l'app : `/daroms-skill-new` ; zones apprises : `.claude/context/app-zones.json` (`/daroms-learn`).
- `CLAUDE.md` de l'app reste court : importe le noyau et le digest, ajoute seulement les spécificités.
- `app.spec.md` est la source de vérité produit : le mettre à jour quand une décision change.
