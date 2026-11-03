---
name: daroms-design
description: Passe de design avant le code - part des références de /daroms-inspire, puis flux, hiérarchie, wireframes texte par écran écrits dans app.spec.md, traduits en composants @daroms/ui.
---

# /daroms-design : flux et wireframes

1. Lire `app.spec.md` et `core/packages/ui/CATALOG.md`. Charger le skill `daroms-design-system` (traduction des conseils design vers @daroms/ui).
2. Inspiration d'abord : si `app.spec.md` n'a pas de section `## Inspiration` avec des références, lancer `/daroms-inspire` et attendre la direction retenue. Aucun wireframe sans références.
3. Flux : du lancement à la boucle principale en 3 appuis maximum ; noter le chemin dans `app.spec.md > Flux`.
4. Pour chaque écran, ajouter sous `## Écrans` un wireframe texte compact qui suit la direction et les motifs retenus :
   ```
   ### todos (onglet ListChecks)
   Header large « Tâches » + IconButton Plus
   SegmentedControl Aujourd'hui | Tout
   List de ListItem (titre, échéance relative, Chip si en retard) ; swipe = terminer
   Vide : EmptyState ListChecks + « Ajouter une tâche » ; Pied : -
   Sheet « Nouvelle tâche » : FormField titre, échéance ; Button primaire
   Réf. : groupes par moment (HabitMinder)
   ```
   Uniquement des composants du catalogue ; préciser l'action principale, les 4 états et la référence d'où vient chaque motif emprunté.
5. Hiérarchie : une seule action principale par écran ; textes courts ; ton de la marque.
6. **Stop** : afficher la liste des écrans avec leur action principale et la direction suivie ; attendre la validation.
