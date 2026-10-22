---
name: daroms-store
description: Prépare la fiche store FR/EN - titre, sous-titre, mots-clés ASO, description, notes de version, captures, politique de confidentialité, via l'agent daroms-store.
---

# /daroms-store : fiche store

1. Déléguer à l'agent `daroms-store` (contexte : `app.spec.md`, manifest, liste des modules) : titre (30 car.), sous-titre (30), mots-clés iOS (100 car., séparés par des virgules, sans répéter le titre), description courte Android (80), description longue (4000 max, sans emoji), notes de version, FR et EN.
2. Écrire le résultat dans `store/listing.fr.md` et `store/listing.en.md`.
3. Captures : pour les 4 à 6 écrans clés, `bun daroms shot /<route> --capture --width 430` (et `--locale en`) ; copier dans `store/screenshots/<langue>/`.
4. Politique de confidentialité : générer `store/privacy.md` d'après les modules (auth : e-mail ; analytics : événements ; push : jeton ; payments : achats via RevenueCat) ; l'utilisateur la publie et renseigne `manifest.store.privacyUrl` et `supportEmail`.
5. Relire `.claude/rules-ondemand/daroms-store-compliance.md` et cocher la liste.
6. **Stop** : chemins des fichiers et éléments restant à fournir.
