// Rapport de coût d'une app : tokens et prix (tarif API Anthropic) par étape, modèle et session.
import { existsSync, readFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'

import { bool, flag, type Args } from '../lib/args'
import { duration, money, renderReport, summarize, tokens } from '../lib/cost-report'
import { capture } from '../lib/exec'
import { writeFile } from '../lib/fsx'
import { color, fail, log } from '../lib/log'
import { findAppRoot } from '../lib/paths'
import { findSessions, projectsDir } from '../lib/transcripts'

function appName(root: string): string {
  const manifest = join(root, 'app.manifest.ts')
  const name = existsSync(manifest) ? /\bname:\s*'((?:[^'\\]|\\.)+)'/.exec(readFileSync(manifest, 'utf8'))?.[1] : undefined
  return name?.replace(/\\'/g, "'") ?? basename(root)
}

/** Date du premier commit : un transcript plus ancien ne peut pas concerner l'app. */
async function createdAt(root: string): Promise<number | undefined> {
  const out = await capture(['git', '-C', root, 'log', '--reverse', '--format=%ct'])
  const first = Number(out.out.split('\n')[0])
  return out.code === 0 && first ? first * 1000 : undefined
}

/** cost [--print] [--out fichier] [--projects dossier] */
export async function cost(args: Args) {
  const app = findAppRoot()
  const root = app ?? process.cwd()
  const projects = flag(args, 'projects') ?? projectsDir()
  const sessions = findSessions(root, { projects, since: await createdAt(root) })
  const summary = summarize(sessions)
  if (!summary.total.turns) fail(`aucune réponse de Claude trouvée pour ${root} dans ${projects}`)

  const t = summary.total
  const seconds = summary.sessions.reduce((sum, s) => sum + s.seconds, 0)
  const name = app ? appName(root) : basename(root)
  log.step(`${color.bold(name)} : ${color.bold(money(t.cost))} (${tokens(t.input + t.output + t.read + t.write)} tokens, ${t.turns} réponses, ${summary.sessions.length} session(s), ${duration(seconds)})`)
  for (const [step, x] of summary.steps) console.log(`  ${step.padEnd(22)} ${money(x.cost).padStart(11)}  ${String(Math.round((x.cost / t.cost) * 100) || 0).padStart(3)} %`)
  for (const model of summary.unknownModels) log.warn(`${model} : tarif inconnu, compté 0 $`)

  const out = flag(args, 'out') ?? (app ? 'app.cost.md' : undefined)
  if (bool(args, 'print') || !out) return
  const path = join(root, out)
  writeFile(path, renderReport(name, summary))
  log.ok(`${relative(process.cwd(), path) || out} écrit (prix équivalent API ; avec un abonnement Pro ou Max, usage non facturé ainsi)`)
}
