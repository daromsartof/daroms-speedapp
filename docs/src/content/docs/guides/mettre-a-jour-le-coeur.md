---
title: Mettre à jour le cœur
description: Passer une app à une nouvelle version du cœur daroms (sous-module core/), resynchroniser la couche IA et vérifier.
---

Le cœur est un sous-module git : une app reste sur sa version tant qu'on ne la change pas.

```bash
cd core && git fetch --tags && git checkout v0.2.0 && cd ..
bun install
bun daroms sync-ai        # règles, skills, hooks à jour dans .claude/
bun daroms doctor
git add core && git commit -m "chore(core): passe à v0.2.0"
```

- Lire `core/CHANGELOG.md` avant : les ruptures n'arrivent qu'en version majeure.
- Les fichiers `app-*` de `.claude/` ne sont jamais touchés ; les `daroms-*` sont écrasés.
- `daroms-sync` (hook de début de session) resynchronise aussi la couche IA automatiquement quand `core/_ai` a changé.
- App créée avec un cœur copié (sans sous-module) : remplacer `core/` par la nouvelle version, ou le transformer en sous-module (`git rm -r core && git submodule add https://github.com/daromsartof/daroms-speedapp.git core`), puis les mêmes commandes.
