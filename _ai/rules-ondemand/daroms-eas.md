# Build et mises à jour EAS

> Profils development, preview, production ; canaux OTA ; version runtime = version de l'app.

- `bun daroms build development` : client de dev (nécessaire dès qu'un module natif hors Expo Go est présent : MMKV, RevenueCat, push).
- `bun daroms build preview` : APK Android et build iOS ad hoc, installation par QR (distribution interne).
- `bun daroms build production` puis `bun daroms submit` : TestFlight et piste interne Google Play.
- OTA : `bun daroms update production --message "..."` ; uniquement JS et assets. Changement natif (module, plugin, permission) = nouveau build + `version` incrémentée dans le manifest.
- Identifiants : gérés par EAS (`bunx eas-cli credentials`). Projet EAS : `manifest.eas.projectId` (créé au premier build).
- Sous-module `core/` : EAS envoie l'arbre de travail ; vérifier que `core/` est bien présent (git submodule update --init).
