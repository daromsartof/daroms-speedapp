---
name: daroms-learn
description: Fin de tâche - enrichit les zones de contexte (app-zones.json, ou daroms-zones.json dans le cœur) pour que le routeur trouve plus vite les bons fichiers la prochaine fois.
---

# /daroms-learn : apprendre les zones

1. Lister les fichiers lus ou modifiés pendant la tâche et les mots de la demande initiale.
2. Tester le routeur : `python3 .claude/hooks/daroms-context.py test "<demande initiale>"`.
3. Si la zone renvoyée est fausse ou absente, ajouter ou corriger une entrée dans `.claude/context/app-zones.json` :
   `{ "zones": [ { "name": "...", "keywords": ["mots", "de", "la", "demande"], "paths": ["src/features/x/", "..."], "notes": "piège ou convention utile" } ] }`
   Mots-clés en minuscules sans accents ; synonymes FR et EN ; 3 à 8 mots ; chemins existants.
4. Savoir générique au framework (vrai pour toutes les apps) : le proposer pour `core/_ai/context/daroms-zones.json` (dépôt cœur), sans modifier `core/` depuis l'app.
5. Retester la demande ; **Stop** : zone ajoutée ou modifiée (une ligne).
