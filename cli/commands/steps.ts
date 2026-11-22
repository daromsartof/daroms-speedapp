// daroms steps : état du parcours /daroms-pilot et fin d'étape. La validation reste humaine :
// /daroms-valider dans Claude Code (hook daroms-steps), ou `steps validate` dans un vrai terminal.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'

import type { Args } from '../lib/args'
import { readJson, writeJson } from '../lib/fsx'
import { color, fail, log } from '../lib/log'
import { appRoot, CORE_DIR } from '../lib/paths'
import { currentIndex, findStep, markReady, renderGate, renderStatus, resetFrom, startState, STATE_FILE, validate, type StepsDefs, type StepsState } from '../lib/steps'

const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00')

export async function steps(args: Args) {
  const root = appRoot()
  const defs = readJson<StepsDefs>(join(CORE_DIR, '_ai', 'context', 'daroms-steps.json'))
  const file = join(root, STATE_FILE)
  const [action = 'status', ref, ...rest] = args._
  if (action === 'start') {
    if (existsSync(file)) log.info(`${STATE_FILE} existe déjà : reprise du parcours`)
    else writeJson(file, startState(now()))
  }
  if (!existsSync(file)) fail(`aucun parcours : bun daroms steps start (ou /daroms-pilot)`)
  const state = readJson<StepsState>(file)
  const save = () => writeJson(file, state)
  const guard = (fn: () => void) => {
    try {
      fn()
    } catch (error) {
      fail((error as Error).message)
    }
  }
  switch (action) {
    case 'start':
    case 'status':
      break
    case 'show': {
      const i = ref ? findStep(defs, ref) : currentIndex(defs, state)
      if (i === undefined) return log.ok('parcours terminé')
      const s = defs.steps[i]!
      console.log(`${color.bold(`Étape ${i + 1} « ${s.title} »`)} : ${s.goal}`)
      console.log(`Skills : ${s.skills.map((k) => `/${k}`).join(', ') || 'aucun (voir /daroms-pilot)'}`)
      for (const line of renderGate(defs, i).slice(1, -1)) console.log(line)
      return
    }
    case 'ready': {
      if (!ref) fail('usage : daroms steps ready <n|id> "<résumé en une ligne>"')
      guard(() => markReady(defs, state, ref, rest.join(' ').trim(), now()))
      save()
      const i = findStep(defs, ref)
      for (const line of renderGate(defs, i, state.steps[defs.steps[i]!.id]!.summary)) console.log(line)
      log.info('Attendre la réponse de l\'utilisateur : ne rien lancer d\'autre.')
      return
    }
    case 'reset':
      if (!ref) fail('usage : daroms steps reset <n|id>')
      guard(() => resetFrom(defs, state, ref, now()))
      save()
      break
    case 'validate': {
      // un humain au clavier : l'agent n'a pas de terminal interactif
      if (!process.stdin.isTTY) fail('validation manuelle : dans Claude Code, l\'utilisateur tape /daroms-valider ; ici, un vrai terminal est requis')
      const i = ref ? findStep(defs, ref) : currentIndex(defs, state)
      if (i === undefined) return log.ok('parcours terminé')
      const rl = createInterface({ input: process.stdin, output: process.stdout })
      const answer = await rl.question(`Valider l'étape ${i + 1} « ${defs.steps[i]!.title} » ? Tapez oui : `)
      rl.close()
      if (answer.trim().toLowerCase() !== 'oui') return log.warn('non validée')
      guard(() => validate(defs, state, String(i + 1), now(), rest.join(' ').trim() || undefined))
      save()
      break
    }
    default:
      fail(`action inconnue : ${action} (start, status, show, ready, reset, validate)`)
  }
  for (const line of renderStatus(defs, state)) console.log(line.startsWith('>') ? color.bold(line) : line)
  const i = currentIndex(defs, state)
  console.log(i === undefined ? color.green('parcours terminé') : color.dim(`étape en cours : ${i + 1} ; détail : bun daroms steps show`))
}
