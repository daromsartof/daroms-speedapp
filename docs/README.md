# Documentation Daroms Speed App

Site de documentation et vitrine du framework : Astro 7 + Starlight, en français. Publié sur https://daromsartof.github.io/daroms-speedapp/ (GitHub Pages, workflow `.github/workflows/docs.yml`).

## Lancer

```bash
cd docs
bun install
bun run dev      # génère les pages de référence puis http://localhost:4321/daroms-speedapp/
bun run check    # build complet + vérification des liens, ancres et fichiers pour agents
```

Adresse publique différente (domaine propre) : `SITE_URL=https://docs.exemple.fr BASE_PATH= bun run build`.

## Où est quoi

| Chemin | Contenu |
|---|---|
| `src/content/docs/` | pages en Markdown : `demarrer/`, `guides/`, `reference/`, `explications/`, `agents/` |
| `src/navigation.ts` | plan du site : barre latérale et ordre de `llms.txt` |
| `src/pages/index.astro`, `src/components/landing/` | vitrine (l'éditeur `brand.ts` importe l'algorithme de `packages/theme`) |
| `src/pages/llms.txt.ts`, `llms-full.txt.ts`, `[...slug].md.ts` | fichiers pour agents : index, doc complète, chaque page en Markdown |
| `scripts/sync-content.ts` | génère les pages tirées des sources (voir ci-dessous) |
| `scripts/check-agents.ts` | vérifie `dist/` après le build |

## Pages générées (ne pas modifier)

Créées à chaque `dev`/`build` depuis les sources du cœur, ignorées par git :

- `reference/composants.md` depuis `packages/ui/CATALOG.md`
- `reference/modules/*.md` depuis `modules/<slug>/README.md`, `module.json`, `config.ts`, `index.ts`
- `reference/regles.md` depuis `_ai/rules/` et `_ai/rules-ondemand/`
- `reference/skills.md` depuis `_ai/skills/*/SKILL.md`, `_ai/agents/`, `_ai/skills/vendor/README.md`

## Écrire une page

- Frontmatter `title` et `description` (une phrase : elle sert dans `llms.txt`).
- Liens internes absolus sans base : `[Ajouter une table](/guides/ajouter-une-table/)` ; la base est ajoutée au build.
- Markdown simple (tableaux, blocs de code, `:::note`) : la version `.md` servie aux agents reste lisible.
- Nouvelle page : l'ajouter dans `src/navigation.ts`.
