<!-- généré par daroms : ne pas modifier à la main -->
# Digest des règles daroms (une ligne par règle)

Règles détaillées chargées automatiquement selon les fichiers touchés (`.claude/rules/`).
Règles à la demande : lire `.claude/rules-ondemand/<nom>.md` quand le sujet arrive.

- **daroms-ai-files** : Les fichiers daroms-* de .claude/ sont écrasés à chaque synchro ; ce qui est propre à l'app porte le préfixe app-.
- **daroms-data** : Supabase seulement dans features/x/api.ts via db() ; entrées et sorties validées zod ; hooks TanStack Query.
- **daroms-database** : Structure uniquement par migration SQL ; RLS sur chaque table ; jamais de clé service_role côté app.
- **daroms-i18n** : Tout texte affiché passe par t('cle') ; clés identiques dans chaque langue ; ni emoji, ni tiret long.
- **daroms-naming** : PascalCase composants, useX hooks, kebab-case routes et dossiers, fichiers ≤ 200 lignes, imports absolus @/ et ~/.
- **daroms-performance** : FlashList pour toute liste, expo-image, items mémoïsés, animations Reanimated ou transition Tamagui.
- **daroms-routes** : app/** ne contient que des réexportations d'écrans ; aucune logique, aucun JSX.
- **daroms-screens** : Chaque écran gère 4 états (chargement, vide, erreur + réessayer, données) et reste sous 200 lignes.
- **daroms-state** : Serveur = TanStack Query ; local persistant = @daroms/lib/storage ; global UI = Zustand, un store par feature, rare.
- **daroms-styles** : Composants @daroms/ui et tokens Tamagui v3 uniquement ; ni hex, ni nombre magique, ni StyleSheet, ni style inline.
- **daroms-tests** : Tests unitaires jest-expo à côté du code ; flows Maestro dans e2e/ ; pas de réseau dans les tests.
- **daroms-animations** (à la demande) : transition Tamagui pour les états simples ; Reanimated 4 pour le geste et le continu.
- **daroms-core-dev** (à la demande) : Travailler dans le dépôt daroms-speed-app (et non dans core/ d'une app), tester, publier une version.
- **daroms-eas** (à la demande) : Profils development, preview, production ; canaux OTA ; version runtime = version de l'app.
- **daroms-store-compliance** (à la demande) : Points de refus fréquents à vérifier avant chaque soumission.
- **daroms-supabase-advanced** (à la demande) : Tables partagées, lecture publique, storage, realtime, fonctions SQL et edge functions.
