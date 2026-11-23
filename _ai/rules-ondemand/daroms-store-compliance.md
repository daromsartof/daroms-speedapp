# Conformité App Store et Google Play

> Points de refus fréquents à vérifier avant chaque soumission.

- Compte : si inscription possible, suppression du compte dans l'app (module auth : Réglages > Supprimer mon compte).
- Connexion sociale sur iOS : Sign in with Apple obligatoire si Google est proposé (module auth le gère).
- Achats numériques : uniquement via achats intégrés (RevenueCat) ; bouton Restaurer visible ; prix, période et conditions affichés ; liens CGU et confidentialité sur le paywall.
- Confidentialité : URL publique (`manifest.store.privacyUrl`) ; étiquettes de confidentialité App Store et section Sécurité des données Google Play cohérentes avec les SDK (analytics, auth, push, crash : « diagnostics »).
- Permissions : demander au moment de l'usage, texte d'explication clair (plugins Expo) ; aucune permission inutilisée.
- Pièges d'interface interdits (95 % des apps populaires en ont au moins un, la plupart des utilisateurs ne les voient pas ; Apple 5.6, Google « Deceptive behavior ») :
  - case précochée pour un abonnement, une newsletter, un partage de données ;
  - fermeture du paywall cachée, retardée ou minuscule ; résiliation plus difficile que la souscription ;
  - culpabilisation au refus (« Non, je préfère payer plus ») ; faux compte à rebours ou fausse rareté ;
  - essai gratuit sans prix ni date de première facturation affichés ; publicité déguisée en contenu ;
  - demande de permission ou de note déguisée en autre chose, ou répétée après un refus.
- Contenu : pas d'écran vide ni de « bientôt » ; données de démo pour la revue (compte de test dans les notes de revue).
- Support : `manifest.store.supportEmail` ; captures d'écran à jour (`/daroms-store`).
- Captures : aux tailles exactes (iPhone 6,9 pouces 1320 x 2868, 6,5 pouces 1284 x 2778, Android 1080 x 1920), PNG sans canal alpha, montrant l'app réelle : `bun daroms screenshots` vérifie taille et alpha ; visuel principal Google Play 1024 x 500.
- Vidéo : l'aperçu App Store ne montre que des captures vidéo de l'app (règle 2.3.4), donc pas la vidéo de `/daroms-promo` ; Google Play prend un lien YouTube.
