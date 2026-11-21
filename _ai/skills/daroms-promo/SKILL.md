---
name: daroms-promo
description: Vidéo promo de l'app (Google Play, réseaux sociaux) depuis ses vrais écrans - accroche, 2 à 5 écrans légendés, carte de fin aux couleurs de brand.ts ; images fixes relues avant le rendu MP4.
argument-hint: "[vertical, landscape ou square] [--all]"
context: fork
background: false
model: sonnet
effort: medium
---

# /daroms-promo : vidéo promo

Format : $ARGUMENTS (vide : `vertical`, pour Google Play et les réseaux sociaux ; `landscape` pour une chaîne YouTube)

1. Lire `app.spec.md` (pitch, cible, ton, boucle principale) et le manifest (écrans, langues, `monetization`).
2. Écrire `store/promo.json` (la CLI refuse tout texte hors règles) :
   ```json
   {
     "format": "vertical",
     "hook": { "fr": "Lisez plus, chaque jour", "en": "Read more, every day" },
     "scenes": [
       { "route": "/books", "caption": { "fr": "Tous vos livres, rangés", "en": "All your books, sorted" } },
       { "route": "/stats", "caption": { "fr": "12 pages par jour", "en": "12 pages a day" }, "dark": true }
     ],
     "end": { "fr": "Gratuit sur Android", "en": "Free on Android" }
   }
   ```
   - accroche : le bénéfice principal, pas le nom de l'app (le nom s'affiche déjà) ;
   - 2 à 5 écrans : la boucle principale dans l'ordre d'usage, un écran = une idée, l'écran le plus fort en dernier ;
   - légende : un bénéfice concret (verbe ou chiffre vrai), 6 mots et 32 caractères au plus, ni emoji, ni tiret long, ni superlatif invérifiable (« le meilleur », « n° 1 ») ;
   - un texte par langue du manifest ; `end` dit l'offre réelle (gratuit, essai de N jours d'après `monetization`) ;
   - écran derrière une gate : `"storage": { "onboarding.done.v1": "true" }` ; écran de données : données de démo crédibles d'abord, jamais un état vide ou un squelette.
3. Images fixes : `bun daroms promo --stills` puis Read sur chaque image. À compter : accroche lisible à 1,1 s ; chaque écran sans erreur ni état vide ; légende sur 2 lignes au plus ; carte de fin. Corriger `promo.json` ou les données, relancer.
4. Revue : agent `daroms-designer` (images fixes + `promo.json`), au plus 5 corrections dont au moins une qui augmente l'impact (accroche, ordre, écran phare), pas seulement du poli. Appliquer, relancer `--stills`.
5. Rendu : `bun daroms promo` (`--all` pour toutes les langues). Son : seulement un fichier sous licence commerciale (`--audio store/promo/son.wav`), sinon vidéo muette.
6. **Stop** : chemins de `store/promo/promo-<langue>.mp4` et `poster-<langue>.png`, durée. Publication : Google Play prend un lien YouTube dans la fiche ; réseaux sociaux tels quels. App Store : pas cette vidéo (règle 2.3.4 : un aperçu App Store ne montre que des captures vidéo de l'app elle-même).
