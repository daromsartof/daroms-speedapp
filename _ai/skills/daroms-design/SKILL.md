---
name: daroms-design
description: Passe de design avant le code - flux, hiérarchie, wireframes texte par écran écrits dans app.spec.md, traduits en composants @daroms/ui.
---

# /daroms-design : flux et wireframes

1. Lire `app.spec.md` et `core/packages/ui/CATALOG.md`. Charger le skill `daroms-design-system` (traduction des conseils design vers @daroms/ui).
2. Flux : du lancement à la boucle principale en 3 appuis maximum ; noter le chemin dans `app.spec.md > Flux`.
3. Pour chaque écran, ajouter sous `## Écrans` un wireframe texte compact :
   ```
   ### todos (onglet ListChecks)
   Header large « Tâches » + IconButton Plus
   SegmentedControl Aujourd'hui | Tout
   List de ListItem (titre, échéance relative, Chip si en retard) ; swipe = terminer
   Vide : EmptyState ListChecks + « Ajouter une tâche » ; Pied : -
   Sheet « Nouvelle tâche » : FormField titre, échéance ; Button primaire
   ```
   Uniquement des composants du catalogue ; préciser l'action principale et les 4 états.
4. Hiérarchie : une seule action principale par écran ; textes courts ; ton de la marque.
5. **Stop** : afficher la liste des écrans avec leur action principale ; attendre la validation.
