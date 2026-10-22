# Référence CLI `daroms`

Dans une app : `bun daroms <commande>`. Hors app : `bun <cœur>/cli/daroms.ts <commande>` (ou `daroms` après `bun link`).

| Commande | Rôle |
|---|---|
| `new <slug> [--name --variant blank|list-detail|tracker|ai-chat|social|shop --primary --accent --tone --radius --font --bundle --modules a,b --supabase ref --dir --core url --copy --link --no-git]` | crée une app complète |
| `dev [--go --web --android --ios --tunnel --clear]` | serveur Expo et QR |
| `doctor [--quick]` | Node, `.env`, manifest, i18n, règles, TypeScript, ESLint, expo-doctor |
| `g screen <nom> [--tab --icon --title --title-en --route --force]` | écran complet (route, feature, i18n, test, manifest) |
| `g feature <nom>` | feature sans route |
| `g table <table> --fields "..." [--feature --singular]` | migration RLS, zod, hooks, types |
| `g module <slug> [--description]` | squelette de module du cœur |
| `icons add <Nom...>` | icônes Lucide supplémentaires (`@/icons`) |
| `module add|remove|list [slug] [--no-install]` | modules |
| `shot <route> [--dark --capture --width --locale --storage k=v --storage-file f.json --android --stop]` | contrôle visuel : erreurs, débordements, capture si utile |
| `test [motif]` · `e2e [flow]` | jest-expo · Maestro |
| `assets` | icône, adaptive icon, splash, favicon depuis `assets/source/icon.svg` |
| `db new <nom> | push | types | reset` | migrations Supabase et types |
| `build [preview|production|development] [--platform]` · `submit` · `update [canal] --message` | EAS |
| `sync-ai` · `catalog` | couche IA · catalogue et digest |
| `release-core <patch|minor|major> [--dry]` | version du cœur (dépôt cœur) |
