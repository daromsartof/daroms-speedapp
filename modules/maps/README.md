# Module maps

Carte avec marqueurs (react-native-maps : Apple Plans sur iOS, Google Maps sur Android ; fonctionne dans Expo Go), position de l'utilisateur (expo-location), distances. Sur le web (`daroms shot`), une zone de repli remplace la carte.

- Activer : `bun daroms module add maps`.
- Configuration (`modules.maps`) : `center` (repli, défaut Paris), `span` (zoom, 0.05), `locationPermission` (texte iOS, défaut selon `defaultLocale`).
- Écran : `<Map label={t('places.map')} markers={places.map((p) => ({ id: p.id, latitude: p.lat, longitude: p.lng, title: p.name }))} onMarkerPress={(m) => router.push(\`/place/${m.id}\`)} ratio={4 / 3} />` (`flex={1}` pour une carte plein écran).
- Position : `const here = useCurrentLocation({ enabled: nearby })` (permission demandée à l'usage ; refus = `AppError forbidden` pour `ErrorState`) ; `sortByDistance(places, here.data)`, `formatDistance(distanceKm(a, b), locale)`.
- Itinéraire : `openInMaps({ latitude, longitude }, nom)`.
- Colonnes : `lat:float, lng:float` dans `g table`.
- Build Android : clé Google Maps (API « Maps SDK for Android ») dans `GOOGLE_MAPS_ANDROID_API_KEY` (`.env` en local, `eas env:create` pour EAS), sinon la carte est vide hors Expo Go. iOS : rien à faire (Apple Plans).
