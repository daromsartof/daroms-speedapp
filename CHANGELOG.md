# Changelog

## v0.9.0 (2026-11-23)

### Nouveautés
- garde-fous issus de la recherche (paquets inventés, consignes périmées, validation par observation, accessibilité, pièges d'interface)

## v0.8.0 (2026-11-23)

### Nouveautés
- références de mouvement gratuites, mesurées image par image
- captures des stores aux tailles exactes depuis les vrais écrans

## v0.7.0 (2026-11-22)

### Nouveautés
- positionnement « framework conçu pour les agents IA », sans notion de temps
- parcours en 9 étapes, chacune validée à la main par l'utilisateur
- module de suivi des plantages avec Sentry
- props de style sur le conteneur de 20 composants
- directions d'icône sur une grille, vérifiées, couche monochrome Android

### Documentation
- l'app se crée au terminal, le parcours se déroule dedans

### Corrections
- l'installation des dépendances natives juge les paquets présents

## v0.6.0 (2026-11-21)

### Nouveautés
- grille de critique notée pour daroms-designer
- vidéo promo depuis les vrais écrans de l'app
- mesures de goût sur le rendu

### Corrections
- le serveur web suit les modifications d'écran

### Documentation
- lien vers Daroms'Art en pied de page, llms.txt et README

## v0.5.2 (2026-11-03)

### Documentation
- vidéo de démo et GIF en tête du README

## v0.5.1 (2026-11-03)

### Documentation
- site en anglais (accueil, Démarrer) et image d'aperçu sociale
- README et description npm en anglais

## v0.5.0 (2026-11-03)

### Documentation
- modèles et contexte par étape, alerte de contexte

### Nouveautés
- alerte quand le contexte dépasse 150 k tokens
- étapes mécaniques en sous-agents Sonnet ou Haiku

### Corrections
- cost --out accepte un chemin absolu, daroms-ecc n'est pas une étape

## v0.4.0 (2026-11-03)

### Documentation
- installer et lancer la CLI avec npx
- méthode ECC dans le README et la référence des skills
- commande cost et bilan de coût de la journée

### Nouveautés
- méthode ECC embarquée (skills figés et daroms-ecc)
- bilan de coût en fin de /daroms-day
- daroms cost chiffre les tokens de l'app au tarif API

### Corrections
- la synchro fusionne les clés objet de settings.json

## v0.3.0 (2026-11-03)

### Corrections
- release-core ignore les commits de fusion dans le changelog
- le job docs installe aussi les dépendances du cœur

### Documentation
- étape d'inspiration et commande inspire

### Nouveautés
- étape d'inspiration /daroms-inspire avant le design
- daroms inspire télécharge des aperçus d'inspiration

## v0.2.1 (2026-10-29)

### Documentation
- README de présentation pour la page npm

## v0.2.0 (2026-10-29)

### Documentation
- installation par npm et procédure de publication
- site de documentation et vitrine (Astro + Starlight)

### Divers
- paquet public @daromsart/daroms-speed-app (MIT) et publication sur tag
- scripts docs:dev et docs:check, README, copie du cœur sans build du site
- build, vérification et publication GitHub Pages

### Nouveautés
- daroms new depuis le paquet npm
- camera (photos vers Supabase Storage) et maps (carte, position)
- tables locales (localTable, g table --local, new --local)
- BarChart et Stat (graphique en barres, chiffre clé)
- jours calendaires (dayKey, lastDays, streak, formatWeekday)

### Corrections
- new --link installe à nouveau les paquets du cœur
- test:cli n'exécute plus les gabarits des générateurs
- QR pour Expo Go par défaut, build de dev avec --dev-client

## v0.1.0 (2026-10-22)

### Nouveautés
- Thème unique piloté par `brand.ts` (palettes OKLCH, thèmes Tamagui v3 clair/sombre, sous-thèmes, tokens sémantiques, polices, ressorts).
- 25 composants `@daroms/ui`, 102 icônes Lucide, `CATALOG.md` généré, kitchen-sink.
- `@daroms/data`, `@daroms/lib`, `@daroms/i18n`, `@daroms/app` (modules, gates, préférences, layouts pilotés par le manifest).
- Template d'app + 5 variantes (list-detail, tracker, ai-chat, social, shop).
- CLI `daroms` : new, dev, doctor, g screen|feature|table|module, icons, module, shot, test, e2e, assets, db, build, submit, update, sync-ai, catalog, release-core.
- Modules : auth (e-mail, Apple, Google, suppression de compte), onboarding, settings, payments (RevenueCat), push, analytics, ai-chat (Claude en streaming).
- Couche IA : noyau, 11 règles ciblées, 5 règles à la demande, digest, 20 skills, 3 agents, 6 hooks, routeur de zones, 9 skills tiers figés.

### Corrections issues de l'app pilote (Lecture)
- `FormField` accepte les formulaires à sortie transformée par zod (texte -> nombre) et pose un testID `field-<nom>`.
- `createId()` dans `@daroms/lib` pour les données locales.
- `daroms shot` : ne réutilise jamais le serveur web d'une autre app, vide toujours le cache Metro (manifest inliné), n'arrête que le processus en écoute, option `--storage-file`.
- `daroms e2e --go` : flows Maestro dans Expo Go ; flow du template paramétré (`APP_ID`, `APP_URL`).
