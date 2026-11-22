---
name: daroms-valider
description: Validation manuelle de l'étape en cours du parcours /daroms-day, tapée par l'utilisateur (le hook daroms-steps l'enregistre). Variante - passer : raison, pour sauter l'étape.
argument-hint: "[note | passer : raison]"
disable-model-invocation: true
---

# /daroms-valider

Note de l'utilisateur : $ARGUMENTS

Le hook `daroms-steps` a enregistré la validation (ou l'étape sautée) et indiqué dans le contexte l'étape suivante. Reprendre le parcours `/daroms-day` à cette étape : `bun daroms steps show`, puis son travail. S'il signale « aucun parcours » ou « parcours terminé », le dire en une ligne et s'arrêter.
