---
name: daroms-design
description: Passe de design avant le code - part des références de /daroms-inspire, puis flux, hiérarchie, wireframes texte par écran et moments de mouvement écrits dans app.spec.md, traduits en composants @daroms/ui et préréglages de la marque.
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
   Mouvement : ListItem terminé = fondu fast + glissement ; Sheet = ressort medium
   ```
   Uniquement des composants du catalogue ; préciser l'action principale, les 4 états, la référence d'où vient chaque motif emprunté et une ligne « Mouvement » (préréglages de la marque, rien de plus).
5. Hiérarchie : une seule action principale par écran ; textes courts ; ton de la marque.
6. Mouvement : lire `.claude/rules-ondemand/daroms-animations.md`, puis écrire sous `## Mouvement` 2 ou 3 moments signature, pris dans `## Inspiration > ### Mouvement` quand il existe :
   ```
   ## Mouvement
   ### Tâche terminée
   Déclencheur : appui sur la case du ListItem
   Mouvement : case qui se remplit (fast), ligne qui glisse hors de la liste (medium, emphasized-accelerate), compteur qui monte
   Préréglage : fast puis medium ; ressort du ton pour le compteur ; haptique légère
   Recette : expo-animation (press feedback, layout animation de sortie)
   Réduit : la ligne disparaît par un fondu fast, sans glissement
   ```
   Le reste de l'app reste sobre : un mouvement n'existe que s'il explique un changement d'état.
7. **Stop** : afficher la liste des écrans avec leur action principale, la direction suivie et les moments de mouvement ; attendre la validation.
