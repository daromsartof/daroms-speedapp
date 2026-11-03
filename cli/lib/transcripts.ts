// Lecture des transcripts Claude Code (~/.claude/projects) : réponses facturées d'une app, étape par étape.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join } from 'node:path'

import type { Usage } from './pricing'

export type Turn = { id: string; session: string; at: string; model: string; step: string; agent?: string; usage: Usage }
export type Session = { id: string; started: string; ended: string; turns: Turn[]; share: number }

/** Skills qui ne sont pas des étapes (chargés pendant une autre étape). */
const HELPERS = new Set(['daroms-design-system', 'daroms-ecc'])
const OUTSIDE = 'hors étape'

export const projectsDir = () => join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), 'projects')

type Entry = { type?: string; timestamp?: string; cwd?: string; message?: { id?: string; model?: string; content?: unknown; usage?: Record<string, unknown> } }

const parseLines = (text: string): Entry[] =>
  text.split('\n').flatMap((line) => {
    if (!line.trim()) return []
    try {
      return [JSON.parse(line) as Entry]
    } catch {
      return []
    }
  })

const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

function usageOf(raw: Record<string, unknown>): Usage {
  const creation = (raw.cache_creation ?? {}) as Record<string, unknown>
  const write1h = num(creation.ephemeral_1h_input_tokens)
  const split = num(creation.ephemeral_5m_input_tokens) + write1h
  const server = (raw.server_tool_use ?? {}) as Record<string, unknown>
  return {
    input: num(raw.input_tokens),
    output: num(raw.output_tokens),
    read: num(raw.cache_read_input_tokens),
    // sans détail par durée, une écriture de cache est comptée à 5 minutes
    write5m: split ? num(creation.ephemeral_5m_input_tokens) : num(raw.cache_creation_input_tokens),
    write1h,
    webSearches: num(server.web_search_requests),
    fast: raw.speed === 'fast',
    usGeo: raw.inference_geo === 'us',
  }
}

/** Étape annoncée par une entrée : commande tapée (/daroms-x), skill appelé par Claude, ou daroms new. */
export function stepMarker(entry: Entry): string | undefined {
  const content = entry.message?.content
  if (entry.type === 'user' && typeof content === 'string') {
    const name = /<command-name>\/((?:daroms|app)-[\w-]+)<\/command-name>/.exec(content)?.[1]
    return name && !HELPERS.has(name) ? name : undefined
  }
  if (entry.type !== 'assistant' || !Array.isArray(content)) return undefined
  let marker: string | undefined
  for (const block of content as { type?: string; name?: string; input?: Record<string, unknown> }[]) {
    if (block.type !== 'tool_use') continue
    const skill = typeof block.input?.skill === 'string' ? block.input.skill.replace(/^\//, '') : ''
    if (block.name === 'Skill' && /^(daroms|app)-/.test(skill) && !HELPERS.has(skill)) marker = skill
    if (block.name === 'Bash' && /\bdaroms(?:-speed-app|\.ts)?\s+new\b/.test(String(block.input?.command ?? ''))) marker = 'daroms-new'
  }
  return marker
}

function turnOf(entry: Entry, session: string, step: string, agent?: string): Turn | undefined {
  const message = entry.message
  if (entry.type !== 'assistant' || !message?.id || !message.usage || !message.model || message.model.startsWith('<')) return undefined
  return { id: message.id, session, at: entry.timestamp ?? '', model: message.model, step, agent, usage: usageOf(message.usage) }
}

const inside = (cwd: string, root: string) => cwd === root || cwd.startsWith(`${root}/`)

/** Une session : transcript principal + transcripts de ses sous-agents (texte JSONL déjà lu).
 * `share` : part des entrées dont le dossier courant est dans `root` (1 sans `root`). */
export function parseSession(id: string, main: string, subagents: { text: string; agent?: string }[] = [], root?: string): Session {
  const timeline: { at: string; step: string }[] = []
  const turns: Turn[] = []
  const seen = new Set<string>()
  // une réponse en plusieurs blocs apparaît sur plusieurs lignes : garder la première
  const keep = (turn: Turn | undefined) => {
    if (turn && !seen.has(turn.id)) {
      seen.add(turn.id)
      turns.push(turn)
    }
  }
  let step = OUTSIDE
  let started = ''
  let ended = ''
  let here = 0
  let elsewhere = 0
  for (const entry of parseLines(main)) {
    if (root && entry.cwd) {
      if (inside(entry.cwd, root)) here++
      else elsewhere++
    }
    if (entry.timestamp) {
      started ||= entry.timestamp
      ended = entry.timestamp
    }
    keep(turnOf(entry, id, step))
    const marker = stepMarker(entry)
    if (marker && marker !== step) {
      step = marker
      timeline.push({ at: entry.timestamp ?? '', step })
    }
  }
  const stepAt = (at: string) => timeline.filter((t) => t.at && t.at <= at).at(-1)?.step ?? OUTSIDE
  for (const { text, agent } of subagents) {
    for (const entry of parseLines(text)) {
      keep(turnOf(entry, id, stepAt(entry.timestamp ?? ''), agent ?? 'sous-agent'))
    }
  }
  return { id, started, ended, turns, share: root ? here / (here + elsewhere || 1) : 1 }
}

const jsonl = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? jsonl(join(dir, d.name)) : d.name.endsWith('.jsonl') ? [join(dir, d.name)] : []))
    : []

function agentType(file: string): string | undefined {
  const meta = file.replace(/\.jsonl$/, '.meta.json')
  try {
    return existsSync(meta) ? (JSON.parse(readFileSync(meta, 'utf8')) as { agentType?: string }).agentType : undefined
  } catch {
    return undefined
  }
}

/** Sessions qui ont surtout travaillé dans `root` (cwd dans l'app), même démarrées ailleurs :
 * une session qui crée l'app depuis une autre app compte pour la nouvelle, pas pour l'ancienne. */
export function findSessions(root: string, options: { projects?: string; since?: number } = {}): Session[] {
  const projects = options.projects ?? projectsDir()
  if (!existsSync(projects)) return []
  const cwd = JSON.stringify(root).slice(0, -1)
  const needles = [`"cwd":${cwd}"`, `"cwd":${cwd}/`]
  const sessions = new Map<string, Session>()
  for (const project of readdirSync(projects)) {
    const dir = join(projects, project)
    if (!statSync(dir).isDirectory()) continue
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.jsonl'))) {
      const file = join(dir, name)
      if (options.since && statSync(file).mtimeMs < options.since) continue
      const text = readFileSync(file, 'utf8')
      if (!needles.some((n) => text.includes(n))) continue
      const id = basename(name, '.jsonl')
      const subagents = jsonl(join(dirname(file), id)).map((f) => ({ text: readFileSync(f, 'utf8'), agent: agentType(f) }))
      const session = parseSession(id, text, subagents, root)
      if (session.share < 0.5) continue
      const previous = sessions.get(id)
      if (!previous || session.turns.length > previous.turns.length) sessions.set(id, session)
    }
  }
  return [...sessions.values()].sort((a, b) => a.started.localeCompare(b.started))
}
