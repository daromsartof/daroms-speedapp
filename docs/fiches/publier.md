# Publier

1. `bun daroms doctor` vert ; `manifest.version` incrémentée si changement natif.
2. `bunx eas-cli login` (une fois) ; `bun daroms build preview` : lien et QR d'installation interne.
3. `bun daroms build production` puis `bun daroms submit` (TestFlight et piste interne Google Play). Requis : `manifest.store.privacyUrl` et `supportEmail`.
4. Correctif JS sans changement natif : `bun daroms update production --message "..."`.

Avec Claude : `/daroms-store`, `/daroms-build`, `/daroms-submit`, `/daroms-update`. Checklist : `.claude/rules-ondemand/daroms-store-compliance.md`.
