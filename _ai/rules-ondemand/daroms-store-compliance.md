# Conformité App Store et Google Play

> Points de refus fréquents à vérifier avant chaque soumission.

- Compte : si inscription possible, suppression du compte dans l'app (module auth : Réglages > Supprimer mon compte).
- Connexion sociale sur iOS : Sign in with Apple obligatoire si Google est proposé (module auth le gère).
- Achats numériques : uniquement via achats intégrés (RevenueCat) ; bouton Restaurer visible ; prix, période et conditions affichés ; liens CGU et confidentialité sur le paywall.
- Confidentialité : URL publique (`manifest.store.privacyUrl`) ; étiquettes de confidentialité App Store et section Sécurité des données Google Play cohérentes avec les SDK (analytics, auth, push).
- Permissions : demander au moment de l'usage, texte d'explication clair (plugins Expo) ; aucune permission inutilisée.
- Contenu : pas d'écran vide ni de « bientôt » ; données de démo pour la revue (compte de test dans les notes de revue).
- Support : `manifest.store.supportEmail` ; captures d'écran à jour (`/daroms-store`).
