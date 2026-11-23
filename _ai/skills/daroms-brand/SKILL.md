---
name: daroms-brand
description: Identité visuelle - choisit palette, ton et direction artistique dans brand.ts, puis l'icône - six directions sur une grille avec daroms logo, vérifiées et notées, la choisie installée (icône, adaptive, monochrome Android) avec daroms assets.
---

# /daroms-brand : marque et icône

1. Lire `app.spec.md` (ton, cible, `## Inspiration`) et `brand.ts`. Sans section Inspiration, proposer `/daroms-inspire` d'abord.
2. Choisir les valeurs (partir de la ligne `Marque` de l'inspiration si elle existe) : `primary` (couleur forte, contraste AA avec le blanc), `accent` (complémentaire : le dégradé principal vers accent se voit partout en `soft` et `vivid`), `font` (`inter` | `system`, corps de texte), `radius` (`sm` sobre, `lg` standard, `full` ludique), `tone` (`playful` | `pro` | `minimal`), `direction` (`clean` aplats sobres ; `editorial` titres Fraunces ; `soft` relief doux, dégradé, halo, Plus Jakarta Sans ; `vivid` dégradés francs, relief marqué, Sora). Écrire `brand.ts` seulement ; `src/generated/fonts.ts` suit au prochain `daroms dev`, `shot` ou `doctor`.
3. Icône : écrire six directions dans `assets/source/logo.json`, une de chaque `kind`, chacune une réponse différente à l'idée de l'app :
   `monogram` (la lettre bâtie de formes), `negative` (lettre ou signe creusé dans un disque, une tuile), `stencil` (une forme fendue là où l'idée tourne), `symbol` (objet ou geste du domaine), `wordmark` (1 ou 2 lettres), `construction` (grille, pile, pli, répétition). Au moins la moitié portent l'idée en image, pas en lettre.
   ```json
   { "directions": [
     { "name": "coche-creusee", "idea": "Une coche creusée dans un disque : la tâche faite.", "kind": "negative",
       "background": "light", "ink": "primary",
       "mark": [ { "shape": "circle", "cx": 24, "cy": 24, "r": 20 },
                 { "op": "cut", "shape": "polygon", "points": [[13,24],[17,20],[22,25],[32,15],[36,19],[22,33]] } ] }
   ] }
   ```
   - Grille de 48, valeurs entières ou demi-unités. Formes : `rect` (x y w h r), `circle` (cx cy r), `ring` (cx cy r width), `arc` (cx cy r width start end ; degrés, 0 en haut, sens horaire), `polygon` (points), `glyph` (text de 1 ou 2 caractères, cx cy size weight ; Inter). Chacune : `op` `add` | `cut` | `keep` | `xor` (dans l'ordre), `rotate`, `pivot`, `mirror` `x` | `y`, `repeat` `{ count, rotate }` ou `{ count, step: [dx, dy] }`.
   - `background` et `ink` parmi `primary`, `accent`, `light`, `dark`, `white`, `gradient` (dégradé de la direction artistique ; contraste 3:1 au moins sur chaque nuance, vérifié) ; au moins deux directions sur fond `gradient` ; varier les couples d'une direction à l'autre.
   - `depth` (défaut : oui sur fond `gradient`) : reflet en haut du fond et ombre portée douce sous le symbole, le relief des icônes du top des stores ; `false` pour un aplat volontaire.
   - Un seul geste avec 2 ou 3 formes vaut mieux qu'un dessin ; formes jointives : les faire se chevaucher d'une demi-unité. Pictogramme littéral (cloche, bulle, coche seule) = icône de banque d'images : en dernier recours.
   - Ne jamais reproduire le logo d'une marque existante ; une direction proche d'un logo connu se réécrit.
4. `bun daroms logo` : corriger chaque `échec` (`indicatif` = favicon seulement) et chaque direction `trop proche` d'une autre ; puis Read sur `.daroms/logo/sheet.png` (tailles réelles, écran d'accueil clair et sombre, icône thématique).
5. Critique : agent `daroms-designer` avec la planche et `logo.json`. Réécrire les directions faibles (pas les retoucher), relancer.
6. Choix : AskUserQuestion avec les 3 meilleures (nom, idée, note de caractère) ; l'utilisateur choisit.
7. `bun daroms logo --use <nom>` : installe `icon.svg`, `foreground.svg`, `background.svg` et `monochrome.svg` dans `assets/source/` puis lance `daroms assets` ; Read sur `assets/icon.png`.
8. Vérifier le rendu : `bun daroms shot /_dev/kitchen-sink --capture` puis `--dark --capture`.
9. **Stop** : montrer l'icône, les deux captures et la ligne `brand.ts`. Rien ici ne vaut recherche d'antériorité : la faire avant de déposer la marque.
