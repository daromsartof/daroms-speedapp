import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { staleReferences } from '../lib/ai-refs'
import type { Args } from '../lib/args'
import { capture, tail } from '../lib/exec'
import { syncFonts } from '../lib/fonts'
import { firstImpressionDefaults, unchangedTexts } from '../lib/placeholders'
import { walk } from '../lib/fsx'
import { color, log } from '../lib/log'
import { loadManifest } from '../lib/manifest'
import { appRoot } from '../lib/paths'
import { regenerateRouteTypes } from '../lib/routes'

type Check = { name: string; ok: boolean; detail?: string; warn?: boolean }

function flatKeys(tree: object, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([k, v]) => (typeof v === 'object' && v ? flatKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]))
}

async function command(name: string, cmd: string[], cwd: string, lines = 15): Promise<Check> {
  const { code, out } = await capture(cmd, { cwd })
  return { name, ok: code === 0, detail: code === 0 ? undefined : tail(out, lines) }
}

/** daroms doctor : environnement, manifest, cohérence app, règles, types, lint, expo-doctor. */
export async function doctor(args: Args) {
  const root = appRoot()
  const quick = args.flags.quick === true
  const checks: Check[] = []
  const [major = 0, minor = 0] = process.versions.node.split('.').map(Number)
  checks.push({ name: 'Node >= 22.18 (app.config.ts en TypeScript)', ok: major > 22 || (major === 22 && minor >= 18), detail: process.versions.node })
  checks.push({ name: '.env présent (sinon Supabase désactivé)', ok: existsSync(join(root, '.env')), detail: 'cp .env.example .env', warn: true })

  let manifestOk = true
  try {
    const manifest = await loadManifest(root)
    for (const screen of manifest.screens) {
      const ok = existsSync(join(root, 'src', 'features', screen))
      if (!ok) manifestOk = false
      if (!ok) checks.push({ name: `écran ${screen} : src/features/${screen}/ manquant`, ok })
    }
    for (const tab of manifest.tabs) {
      const ok = existsSync(join(root, 'app', '(tabs)', `${tab.name}.tsx`))
      if (!ok) checks.push({ name: `onglet ${tab.name} : app/(tabs)/${tab.name}.tsx manquant`, ok })
    }
  } catch (error) {
    manifestOk = false
    checks.push({ name: 'manifest', ok: false, detail: String(error) })
  }
  checks.push({ name: 'manifest valide et cohérent', ok: manifestOk })

  const locales = walk(join(root, 'locales')).filter((f) => f.endsWith('.json'))
  const keySets = locales.map((f) => new Set(flatKeys(JSON.parse(readFileSync(f, 'utf8')) as object)))
  const reference = keySets[0] ?? new Set<string>()
  const missing = keySets.flatMap((set, i) => [...reference].filter((k) => !set.has(k)).map((k) => `${locales[i]!.split('/').pop()}: ${k}`))
  checks.push({ name: 'clés i18n identiques dans toutes les langues', ok: missing.length === 0, detail: missing.slice(0, 10).join('\n') })
  const appTexts = Object.fromEntries(locales.map((f) => [f.split('/').pop()!.replace('.json', ''), JSON.parse(readFileSync(f, 'utf8')) as object]))
  const generic = unchangedTexts(appTexts, firstImpressionDefaults())
  checks.push({ name: 'textes de première impression écrits pour l\'app', ok: generic.length === 0, detail: `${generic.join(', ')}\nTextes du gabarit : /daroms-idea les écrit d'après le cahier (onboarding, accueil).`, warn: true })

  if (await syncFonts(root)) checks.push({ name: 'police des titres resynchronisée avec brand.ts (src/generated/fonts.ts)', ok: true })

  // consignes propres à l'app (fichiers app-*, CLAUDE.md) qui citent un fichier disparu
  const aiFiles = [join(root, 'CLAUDE.md'), ...walk(join(root, '.claude')).filter((f) => /\/app-[^/]+(\.md|\/SKILL\.md)$/.test(f))].filter(existsSync)
  const stale = aiFiles.flatMap((f) => staleReferences(readFileSync(f, 'utf8'), (p) => existsSync(join(root, p))).map((p) => `${relative(root, f)} : ${p}`))
  checks.push({ name: 'consignes IA à jour (chemins cités existants)', ok: stale.length === 0, detail: `${stale.slice(0, 10).join('\n')}\nMettre la consigne à jour : le code fait foi.`, warn: true })

  checks.push(await command('règles daroms (hook check-rules sur src/ et app/)', ['python3', 'core/_ai/hooks/daroms-check-rules.py', '--all'], root))
  await regenerateRouteTypes(root)
  checks.push(await command('TypeScript', ['bunx', 'tsc', '--noEmit'], root))
  checks.push(await command('ESLint', ['bunx', 'eslint', '.', '--max-warnings=0'], root))
  if (!quick) checks.push(await command('expo-doctor', ['bunx', 'expo-doctor'], root, 25))

  for (const check of checks) {
    if (check.ok) log.ok(check.name)
    else if (check.warn) log.warn(`${check.name} : ${check.detail ?? ''}`)
    else {
      log.fail(check.name)
      if (check.detail) console.log(color.dim(check.detail.split('\n').map((l) => `    ${l}`).join('\n')))
    }
  }
  const failed = checks.filter((c) => !c.ok && !c.warn).length
  console.log(failed ? color.red(`\n${failed} problème(s)`) : color.green('\ntout est vert'))
  if (failed) process.exitCode = 1
}
