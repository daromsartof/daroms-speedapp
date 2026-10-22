---
name: daroms-update
description: Publie une mise à jour OTA (eas update) sur un canal, pour du JavaScript ou des assets sans changement natif.
argument-hint: "[canal] [message]"
disable-model-invocation: true
---

# /daroms-update : mise à jour OTA

Arguments : $ARGUMENTS

1. Vérifier qu'aucun changement natif n'est inclus (nouveau module, plugin, permission, version de SDK) : `git diff <dernier tag>..HEAD -- package.json app.manifest.ts`. Si oui : nouveau build, pas d'OTA.
2. `bun daroms doctor --quick` et `bun daroms test`.
3. `bun daroms update <canal> --message "<message court>"` (canal par défaut production).
4. **Stop** : identifiant de la mise à jour et canal.
