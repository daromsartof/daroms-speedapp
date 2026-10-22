---
paths:
  - "locales/**"
  - "src/**/*.tsx"
---
# Textes et langues

> Tout texte affiché passe par t('cle') ; clés identiques dans chaque langue ; ni emoji, ni tiret long.

- `const t = useT()` (`@daroms/i18n`) ; clés typées depuis `locales/fr.json` (namespace app).
- Organisation : `<feature>.<clé>` (`todos.emptyTitle`), onglets `tabs.<nom>`. Pluriels : `_one` / `_other`.
- Ajouter chaque clé en FR et EN dans le même changement (`bun daroms doctor` vérifie la parité).
- Textes courts, ton du cahier (`app.spec.md`). Interpolation : `t('x.count', { count })`.
- Textes du cœur (Réessayer, Annuler...) : déjà fournis par les composants ; messages zod = clés `daroms:validation.*`.
