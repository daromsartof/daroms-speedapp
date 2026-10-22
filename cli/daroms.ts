#!/usr/bin/env bun
// CLI daroms : commandes courtes et déterministes (Claude ne remplit que le spécifique).
import { parseArgs, type Args } from './lib/args'
import { CliError, color, log } from './lib/log'

type Command = { describe: string; run: (args: Args) => Promise<void> }

const lazy = <K extends string>(path: string, name: K) => async (args: Args) => {
  const mod = (await import(path)) as Record<K, (args: Args) => Promise<void>>
  await mod[name](args)
}

const COMMANDS: Record<string, Command> = {
  new: { describe: 'new <slug> [--name --variant --primary --accent --tone --radius --font --modules a,b --copy|--link]', run: lazy('./commands/project', 'newApp') },
  dev: { describe: 'serveur Expo + QR [--go --web --android --ios --tunnel --clear]', run: lazy('./commands/project', 'dev') },
  doctor: { describe: 'diagnostic complet (env, manifest, règles, types, lint, expo-doctor) [--quick]', run: lazy('./commands/project', 'doctor') },
  g: { describe: 'g screen|feature|table|module <nom> [options]', run: lazy('./commands/generate', 'generate') },
  icons: { describe: 'icons add <NomLucide...> : ajoute des icônes Lucide à l app', run: lazy('./commands/generate', 'icons') },
  module: { describe: 'module add|remove|list [slug]', run: lazy('./commands/module', 'moduleCommand') },
  shot: { describe: 'shot <route> [--dark --capture --locale en --storage cle=val --storage-file f.json --android --stop] : logs, erreurs, débordements, capture si utile', run: lazy('./commands/quality', 'shot') },
  test: { describe: 'tests unitaires (jest-expo) [motif]', run: lazy('./commands/quality', 'test') },
  e2e: { describe: 'flows Maestro (e2e/*.yaml) [fichier] [--go : dans Expo Go]', run: lazy('./commands/quality', 'e2e') },
  assets: { describe: 'icône, adaptive icon, splash, favicon depuis assets/source/icon.svg', run: lazy('./commands/assets', 'assets') },
  db: { describe: 'db new <nom> | push | types | reset', run: lazy('./commands/db', 'db') },
  build: { describe: 'build [preview|production|development] [--platform ios|android|all]', run: lazy('./commands/ship', 'build') },
  submit: { describe: 'submit [--platform ios|android|all] : TestFlight / piste interne', run: lazy('./commands/ship', 'submit') },
  update: { describe: 'update [canal] --message "..." : mise à jour OTA', run: lazy('./commands/ship', 'update') },
  'sync-ai': { describe: 'synchronise core/_ai vers .claude/', run: lazy('./commands/ai', 'syncAiCommand') },
  catalog: { describe: 'régénère CATALOG.md et digest.md', run: lazy('./commands/ai', 'catalog') },
  'release-core': { describe: 'release-core <patch|minor|major> : version, changelog, tag du cœur', run: lazy('./commands/core', 'releaseCore') },
}

function help() {
  console.log(`${color.bold('daroms')} : framework mobile Expo + Tamagui + Supabase\n`)
  for (const [name, command] of Object.entries(COMMANDS)) console.log(`  ${color.cyan(name.padEnd(13))} ${command.describe}`)
}

const [name, ...rest] = process.argv.slice(2)
const command = name ? COMMANDS[name] : undefined
if (!command) {
  help()
  process.exit(name && name !== 'help' && name !== '--help' ? 1 : 0)
}
try {
  await command.run(parseArgs(rest))
} catch (error) {
  if (error instanceof CliError) {
    log.fail(error.message)
    process.exit(1)
  }
  throw error
}
