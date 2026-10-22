# Mettre à jour le cœur dans une app

```
cd core && git fetch --tags && git checkout v0.2.0 && cd ..
bun install
bun daroms sync-ai        # règles, skills, hooks à jour dans .claude/
bun daroms doctor
git add core && git commit -m "chore(core): passe à v0.2.0"
```

Lire `core/CHANGELOG.md` avant (ruptures en version majeure). Les fichiers `app-*` de `.claude/` ne sont jamais touchés.
