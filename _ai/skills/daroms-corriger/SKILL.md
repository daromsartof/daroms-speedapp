---
name: daroms-corriger
description: Demande de correction de l'étape en cours du parcours /daroms-day, tapée par l'utilisateur (le hook daroms-steps l'enregistre) - l'agent applique la consigne puis représente la fin d'étape.
argument-hint: "<consigne>"
disable-model-invocation: true
---

# /daroms-corriger

Consigne : $ARGUMENTS

1. Consigne vide : demander à l'utilisateur ce qu'il faut corriger, puis s'arrêter.
2. Appliquer la consigne à l'étape en cours (`bun daroms steps show`) : relancer le skill concerné avec la consigne en argument, ou corriger le livrable désigné.
3. Représenter la fin d'étape : `bun daroms steps ready <n> "<résumé>"`, ce qui a changé en 2 lignes, puis s'arrêter jusqu'à `/daroms-valider` ou un nouveau `/daroms-corriger`.
