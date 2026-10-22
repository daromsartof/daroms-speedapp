---
name: daroms-fix
description: Boucle d'auto-réparation - lit les erreurs (doctor, tsc, Metro, shot), corrige, relance ; 3 essais au plus puis rapport. À utiliser quand l'app ne compile pas, crashe ou affiche une erreur.
---

# /daroms-fix : réparer

1. Collecter, en parallèle quand c'est possible :
   - `bun daroms doctor --quick` (règles, types, lint, manifest, i18n)
   - `bun daroms shot <route en cause>` (exception, erreurs console) ; `tail -40 .daroms/web-server.log` pour Metro
   - sur appareil : `bun daroms shot <route> --android` (logcat filtré)
2. Classer la première erreur racine (pas les conséquences). Causes fréquentes : import d'un paquet absent (`bunx expo install x`), module natif dans Expo Go (build de dev), clé i18n manquante, route non déclarée, type Supabase périmé (`bun daroms db types`), cache Metro (`bun daroms dev --clear`), manifest invalide.
3. Corriger au plus près de la cause, sans contourner les règles (pas de `any`, pas de désactivation de lint).
4. Relancer la vérification qui échouait. Répéter au plus **3 essais**.
5. **Stop** : si vert, 2 lignes ; sinon rapport : erreur, hypothèses testées, prochaine piste, sans modifier `core/`.
