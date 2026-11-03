---
name: daroms-inspire
description: Recherche d'inspiration avant tout design - maquettes et apps publiées sur Dribbble, Pinterest, Behance, Mobbin, Screens Design, aperçus regardés, puis direction visuelle choisie avec l'utilisateur et écrite dans app.spec.md > Inspiration.
argument-hint: "[écran ou style à explorer]"
---

# /daroms-inspire : références avant le design

Focus : $ARGUMENTS (vide : toute l'app, boucle principale d'abord)

1. Lire `app.spec.md` (pitch, cible, ton, écrans, marque). S'il ne cite aucune référence, demander une fois (AskUserQuestion) : « Chercher pour moi » ou « J'ai des apps, liens ou captures ». Les références de l'utilisateur passent avant les autres ; ses captures vont dans `.daroms/inspiration/`.
2. Écrire 3 ou 4 requêtes en anglais : domaine + écran clé + ton (`habit tracker app dashboard minimal`, `reading log app stats dark mode`).
3. Chercher en parallèle avec WebSearch et `allowed_domains` :
   - maquettes : `dribbble.com`, `pinterest.com`, `behance.net` ;
   - apps publiées (écrans réels, plus fiables) : `mobbin.com`, `screensdesign.com`, `pageflows.com`.
4. Garder 6 à 10 résultats variés (3 sites au moins, 2 apps publiées au moins). WebFetch sur les plus prometteurs pour la description et les URL de captures.
5. Regarder les visuels : `bun daroms inspire <url...>` (image directe, ou page dont il prend l'aperçu) les range dans `.daroms/inspiration/` (non versionné) ; Read sur chaque fichier. Pinterest et Screens Design répondent ; Dribbble et Behance refusent souvent la lecture automatique : ne jamais contourner (ni faux navigateur, ni autre astuce), garder titre et extrait de la recherche, ou regarder la page dans le Chrome de l'utilisateur si l'extension Claude in Chrome est connectée.
6. Proposer 2 ou 3 directions (AskUserQuestion) ; chacune : nom, 2 ou 3 références, ambiance (densité, formes, typographie, couleur, mouvement) et sa traduction daroms (`tone`, `radius`, `primary` et `accent` en hex, composants du catalogue) selon le skill `daroms-design-system`.
7. Écrire la direction retenue dans `app.spec.md`, section `## Inspiration` (remplacer l'ancienne) :
   ```
   ## Inspiration
   Direction : Calme et chiffré
   | Référence | Lien | À retenir |
   |---|---|---|
   | HabitMinder (Screens Design) | https://screensdesign.com/apps/habitminder-habit-tracker/ | habitudes groupées par moment, anneau de progression |
   Marque : tone minimal, radius lg, primary #2F6F5E, accent #F2A541
   Motifs : Stat en tête, Card par moment de la journée, BarChart 7 jours, Sheet de saisie rapide
   À éviter : glassmorphism, dégradés lourds, plus d'un accent
   ```
8. S'inspirer, ne pas copier : garder des motifs et des principes ; aucune image, aucun logo, aucune illustration ni aucun texte repris dans l'app.
9. **Stop** : afficher la direction retenue et ses 3 meilleures références (liens). Suite : `/daroms-brand` puis `/daroms-design`.
