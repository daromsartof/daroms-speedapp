# Module settings

Onglet Réglages : apparence (système, clair, sombre), langue, retour haptique, sections apportées par les autres modules (`useSettings` : compte, abonnement, notifications), à propos (version, liens `manifest.store`).

- Activer : `bun daroms module add settings`.
- Ajouter une section depuis un module : `useSettings: () => SettingsSection[]` dans `defineModule`.
