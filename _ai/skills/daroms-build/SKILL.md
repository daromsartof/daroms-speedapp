---
name: daroms-build
description: Lance les builds EAS - preview (installation interne par QR) puis production ; crée le projet EAS si besoin.
argument-hint: "[preview|production|development]"
disable-model-invocation: true
---

# /daroms-build : construire

Profil : $ARGUMENTS (défaut preview)

1. `bun daroms doctor` doit être vert (sinon `/daroms-fix`).
2. Vérifier `manifest.version` (incrémenter si changement natif depuis le dernier build).
3. `bunx eas-cli whoami` ; si non connecté, demander à l'utilisateur de lancer `! bunx eas-cli login`.
4. `bun daroms build <profil> [--platform ios|android]` (le projet EAS est créé et son id rangé dans le manifest au premier build).
5. Preview : donner le lien et le QR d'installation affichés par EAS. Production : enchaîner `/daroms-submit` après validation.
6. **Stop** : lien du build et prochaine action.
