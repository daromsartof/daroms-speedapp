---
name: daroms-submit
description: Soumet le dernier build production - TestFlight (iOS) et piste interne (Android) - après la checklist de conformité.
disable-model-invocation: true
---

# /daroms-submit : soumettre

1. Checklist (`.claude/rules-ondemand/daroms-store-compliance.md`) : suppression de compte, Apple Sign In, restauration des achats, URL de confidentialité, e-mail de support, captures, compte de test pour la revue. Lister ce qui manque et s'arrêter si bloquant.
2. Un build production existe (`/daroms-build production`).
3. `bun daroms submit [--platform ios|android]` (identifiants App Store Connect et clé de service Google demandés par EAS au premier envoi).
4. **Stop** : liens TestFlight / Play Console et actions manuelles restantes (fiche, revue).
