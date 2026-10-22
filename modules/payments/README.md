# Module payments

Abonnements et achats avec RevenueCat (`react-native-purchases`).

- Activer : `bun daroms module add payments` (route modale `app/paywall.tsx`).
- `.env` : `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (clés publiques du SDK).
- RevenueCat : créer l'entitlement (`pro` par défaut), les produits et l'offering courante.
- Config : `entitlement`, `mode` (`soft` : paywall à la demande ; `hard` : obligatoire), `offering`, `features` (clés i18n).
- Code : `usePro()` (statut), `<ProGate>` (contenu réservé), `router.push('/paywall')`.
- Expo Go : RevenueCat fonctionne en mode aperçu ; achats réels uniquement en build de dev ou de prod.
