# Module crash

Suivi des plantages avec [Sentry](https://sentry.io) : erreurs JavaScript, plantages natifs, écran en cours, version de l'app et identifiant de l'utilisateur connecté (jamais son e-mail, sauf `sendDefaultPii`).

- Activer : `bun daroms module add crash`, puis renseigner `EXPO_PUBLIC_SENTRY_DSN` dans `.env` (DSN du projet Sentry, public par nature). Sans DSN, le module ne fait rien.
- Traces lisibles en production : `organization` et `project` dans `manifest.modules.crash`, et le jeton en variable EAS sensible : `bunx eas-cli env:create --name SENTRY_AUTH_TOKEN --value <jeton> --environment production --environment preview --visibility sensitive`. Les builds de release envoient alors leurs source maps ; `bun daroms update` envoie celles des mises à jour OTA.
- Metro : le `metro.config.js` du modèle utilise `getSentryExpoConfig` dès que `@sentry/react-native` est installé (identifiants de debug des source maps). App créée avant ce module : remplacer `getDefaultConfig(__dirname)` par `require('@sentry/react-native/metro').getSentryExpoConfig(__dirname)`.
- Un écran qui plante affiche `ErrorState` avec « Réessayer » au lieu d'un écran blanc. Erreur attrapée par l'app : `reportError(error, { feature: 'checkout' })`.
- Réglages : interrupteur « Envoyer les rapports de plantage » (actif par défaut), qui coupe l'envoi sur l'appareil.
- Expo Go : erreurs JavaScript seulement ; plantages natifs et mesures d'affichage dans un build (`bun daroms build development`).
- Tester : `bun daroms build preview`, puis un bouton qui lance `throw new Error('test Sentry')` ; l'événement apparaît dans Sentry en moins d'une minute.
- Confidentialité : déclarer « diagnostics, plantages » dans les étiquettes App Store et la section Sécurité des données de Google Play.
- Config : `organization`, `project`, `url`, `tracesSampleRate` (0,1), `sendDefaultPii` (false), `enableInDev` (false).
