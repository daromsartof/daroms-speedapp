---
name: daroms-learn
description: Fin de tâche - enrichit les zones de contexte (app-zones.json, ou daroms-zones.json dans le cœur) pour que le routeur trouve plus vite les bons fichiers la prochaine fois.
argument-hint: "<demande de la tâche terminée>"
context: fork
background: false
model: haiku
---

# /daroms-learn : apprendre les zones

Tâche : $ARGUMENTS

Sous-agent sans l'historique de la conversation : la demande vient de l'argument, les fichiers de git.

1. Fichiers de la tâche : `git status --short` et `git log -5 --name-only --format='%h %s'`. Demande : l'argument, sinon les sujets des commits.
2. Tester le routeur : `python3 .claude/hooks/daroms-context.py test "<demande>"`.
3. Si la zone renvoyée est fausse ou absente, ajouter ou corriger une entrée dans `.claude/context/app-zones.json` :
   `{ "zones": [ { "name": "...", "keywords": ["mots", "de", "la", "demande"], "paths": ["src/features/x/", "..."], "notes": "piège ou convention utile" } ] }`
   Mots-clés en minuscules sans accents ; synonymes FR et EN ; 3 à 8 mots ; chemins existants.
4. Savoir générique au framework (vrai pour toutes les apps) : le proposer pour `core/_ai/context/daroms-zones.json` (dépôt cœur), sans modifier `core/` depuis l'app.
5. Retester la demande ; **Stop** : zone ajoutée ou modifiée (une ligne).
