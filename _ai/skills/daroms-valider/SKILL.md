---
name: daroms-valider
description: Validation manuelle de l'étape en cours du parcours /daroms-pilot, tapée par l'utilisateur (le hook daroms-steps l'enregistre). Variante - passer : raison, pour sauter l'étape.
argument-hint: "<réponse à la question de l'étape> | passer : raison"
disable-model-invocation: true
---

# /daroms-valider

Note de l'utilisateur : $ARGUMENTS

La note est la réponse de l'utilisateur à la question d'observation de l'étape. Sans réponse, le hook n'enregistre rien et le dit : reposer la question et s'arrêter. Si la réponse contredit les livrables (texte affiché, nombre d'appuis, adresse), le signaler en une ligne avant de continuer.

Le hook `daroms-steps` a enregistré la validation (ou l'étape sautée) et indiqué dans le contexte l'étape suivante. Reprendre le parcours `/daroms-pilot` à cette étape : `bun daroms steps show`, puis son travail. S'il signale « aucun parcours » ou « parcours terminé », le dire en une ligne et s'arrêter.
