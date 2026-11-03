---
name: daroms-store
description: Prépare la fiche store FR/EN - titre, sous-titre, mots-clés ASO, description, notes de version, captures, politique de confidentialité, via l'agent daroms-store.
context: fork
background: false
model: sonnet
effort: medium
---

# /daroms-store : fiche store

1. Déléguer à l'agent `daroms-store` (contexte : `app.spec.md`, manifest, liste des modules) : il écrit lui-même `store/listing.fr.md` et `store/listing.en.md` (titre 30 car., sous-titre 30, mots-clés iOS 100, description courte Android 80, description longue 4000 max, notes de version) et ne renvoie que les chemins, le plan des captures et la conformité.
2. Contrôler les compteurs de caractères dans les deux fichiers ; corriger sur place le champ trop long, sans réécrire la fiche.
3. Captures : pour les 4 à 6 écrans clés, `bun daroms shot /<route> --capture --width 430` (et `--locale en`) ; copier dans `store/screenshots/<langue>/`.
4. Politique de confidentialité : générer `store/privacy.md` d'après les modules (auth : e-mail ; analytics : événements ; push : jeton ; payments : achats via RevenueCat) ; l'utilisateur la publie et renseigne `manifest.store.privacyUrl` et `supportEmail`.
5. Relire `.claude/rules-ondemand/daroms-store-compliance.md` et cocher la liste.
6. **Stop** : chemins des fichiers et éléments restant à fournir.
