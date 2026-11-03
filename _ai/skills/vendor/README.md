# Skills tiers figés (vendor)

Copiés tels quels (Markdown et licences uniquement, sans images ni scripts), chargés en `name-only` via `skillOverrides`.
Les conseils d'implémentation sont traduits vers @daroms/ui par le skill `daroms-design-system` (Tamagui v3, pas de CSS, pas de @expo/ui).
Les skills `ecc-*` viennent d'ECC (Everything Claude Code, https://ecc.tools) : seul changement, le préfixe `ecc-` (dossier et `name:`) pour ne pas masquer `/security-review` de Claude Code ; `daroms-ecc` les traduit vers les commandes daroms. Le plugin ECC complet (hooks, agents, 300+ skills) n'est pas embarqué : trop de contexte et des hooks en double.

| Skill | Source | Commit | Licence | Figé le |
|---|---|---|---|---|
| frontend-design | https://github.com/anthropics/skills | dbd4588 | Apache 2.0 (LICENSE.txt) | 2026-10-22 |
| expo-native-ui | https://github.com/expo/skills | 0d03555 | The MIT License (MIT) | 2026-10-22 |
| expo-data-fetching | https://github.com/expo/skills | 0d03555 | The MIT License (MIT) | 2026-10-22 |
| eas-app-stores | https://github.com/expo/skills | 0d03555 | The MIT License (MIT) | 2026-10-22 |
| expo-upgrade | https://github.com/expo/skills | 0d03555 | The MIT License (MIT) | 2026-10-22 |
| expo-animation | https://github.com/expo/skills | 0d03555 | MIT License | 2026-10-22 |
| react-native-best-practices | https://github.com/callstackincubator/agent-skills | 59e9d17 | MIT License | 2026-10-22 |
| supabase-postgres-best-practices | https://github.com/supabase/agent-skills | c9be0e9 | MIT License | 2026-10-22 |
| supabase | https://github.com/supabase/agent-skills | c9be0e9 | MIT License | 2026-10-22 |
| ecc-tdd-workflow | https://github.com/affaan-m/ECC (skills/tdd-workflow) | b38be6a | MIT License | 2026-11-03 |
| ecc-security-review | https://github.com/affaan-m/ECC (skills/security-review) | b38be6a | MIT License | 2026-11-03 |
| ecc-accessibility | https://github.com/affaan-m/ECC (skills/accessibility) | b38be6a | MIT License | 2026-11-03 |
| ecc-typescript-patterns | https://github.com/affaan-m/ECC (skills/typescript-patterns) | b38be6a | MIT License | 2026-11-03 |

Non figé : `ui-ux-pro-max` (nextlevelbuilder/ui-ux-pro-max-skill) embarque ~4 300 lignes de scripts Python et 3,7 Mo de données ; à installer au niveau utilisateur après audit : `npx skills add nextlevelbuilder/ui-ux-pro-max-skill`.

Mettre à jour : recloner la source, recopier, mettre à jour ce tableau, `bun daroms release-core minor`.
