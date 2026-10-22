---
name: daroms-commit
description: Commits en français découpés par fonctionnalité (conventionnels), après vérification rapide.
---

# /daroms-commit : committer

1. `git status --short` et `git diff --stat` ; regrouper les fichiers par fonctionnalité (feature, module, marque, données, config).
2. `bun daroms doctor --quick` ; ne pas committer si rouge (sauf demande explicite).
3. Un commit par groupe : `git add <fichiers>` puis message `type(portée): résumé` en français, impératif, 72 caractères maximum (`feat(todos): ajoute la création de tâche`, `fix(auth): ...`, `chore(brand): ...`). Corps facultatif : le pourquoi.
4. Jamais de fichier `.env`, de capture `.daroms/` ni de secret. Ne pas pousser sans demande.
5. **Stop** : liste des commits créés.
