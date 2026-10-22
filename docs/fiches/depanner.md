# Dépanner

| Symptôme | Cause probable | Action |
|---|---|---|
| iPhone : « aucune donnée utilisable » au scan du QR | QR de build de dev (`exp+<app>://`) sans build installé | `bun daroms dev` (Expo Go) ; build de dev : `bun daroms build development` puis `--dev-client` |
| Le QR s'ouvre mais l'app ne charge pas | téléphone sur un autre réseau | même Wi-Fi, ou `bun daroms dev --tunnel` |
| Écran blanc, erreur rouge | exception au rendu | `bun daroms shot /route` (message), `/daroms-fix` |
| `Unable to resolve module` | paquet absent ou cache | `bunx expo install <paquet>` ; `bun daroms dev --clear` |
| Module natif introuvable dans Expo Go | MMKV, RevenueCat, push | `bun daroms build development` (client de dev) |
| Erreur de type sur une route | types de routes périmés | `bun daroms doctor` (les régénère) |
| Données vides alors que la table est remplie | RLS | vérifier les politiques et `auth.uid()` ; utilisateur connecté ? |
| Manifest ignoré sur le web | cache Metro | `bun daroms shot` redémarre le serveur ; sinon `bun daroms dev --web --clear` |
| Hook qui refuse une écriture | règle daroms | lire le message, corriger (pas de contournement) |
| `.env` refusé | protection des secrets | lire `.env.example` ; demander les valeurs à l'humain |
| Maestro : « driver did not start » ou gRPC UNAVAILABLE | Android très récent (API 37) ou émulateur lent | Maestro >= 2.11 puis `bun daroms e2e --go --driver` (pré-lance l'instrumentation) |
| Expo Go ne s'installe pas (`Fetching Expo Go` bloqué) | téléchargement lent | télécharger l'APK (adresse via `https://api.expo.dev/v2/versions`) puis `adb install` |
