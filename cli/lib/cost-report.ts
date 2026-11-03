// Agrégation des réponses facturées et rapport app.cost.md (tokens et prix par étape, modèle, session).
import { cacheSavingOf, knownModel, normalizeModel, PRICING_DATE, PRICING_URL, priceOf } from './pricing'
import type { Session, Turn } from './transcripts'

export type Totals = { turns: number; agentTurns: number; agentCost: number; input: number; output: number; read: number; write: number; cost: number; saving: number }
export type CostSummary = {
  total: Totals
  steps: [string, Totals][]
  models: [string, Totals][]
  sessions: { id: string; started: string; seconds: number; totals: Totals }[]
  unknownModels: string[]
}

const empty = (): Totals => ({ turns: 0, agentTurns: 0, agentCost: 0, input: 0, output: 0, read: 0, write: 0, cost: 0, saving: 0 })

function add(t: Totals, turn: Turn) {
  const u = turn.usage
  const cost = priceOf(turn.model, u) ?? 0
  t.turns++
  if (turn.agent) {
    t.agentTurns++
    t.agentCost += cost
  }
  t.input += u.input
  t.output += u.output
  t.read += u.read
  t.write += u.write5m + u.write1h
  t.cost += cost
  t.saving += cacheSavingOf(turn.model, u.read)
}

const tokensOf = (t: Totals) => t.input + t.output + t.read + t.write
const seconds = (a: string, b: string) => Math.max(0, (Date.parse(b) - Date.parse(a)) / 1000) || 0

/** Additionne chaque réponse une seule fois (une réponse peut apparaître dans plusieurs transcripts). */
export function summarize(sessions: Session[]): CostSummary {
  const total = empty()
  const steps = new Map<string, Totals>()
  const models = new Map<string, Totals>()
  const unknown = new Set<string>()
  const seen = new Set<string>()
  const perSession = sessions.map((session) => {
    const totals = empty()
    for (const turn of [...session.turns].sort((a, b) => a.at.localeCompare(b.at))) {
      if (seen.has(turn.id)) continue
      seen.add(turn.id)
      if (!knownModel(turn.model)) unknown.add(turn.model)
      const model = normalizeModel(turn.model)
      for (const t of [total, totals, steps.get(turn.step) ?? steps.set(turn.step, empty()).get(turn.step)!, models.get(model) ?? models.set(model, empty()).get(model)!]) add(t, turn)
    }
    return { id: session.id, started: session.started, seconds: seconds(session.started, session.ended), totals }
  })
  const byCost = (a: [string, Totals], b: [string, Totals]) => b[1].cost - a[1].cost
  return { total, steps: [...steps], models: [...models].sort(byCost), sessions: perSession.filter((s) => s.totals.turns), unknownModels: [...unknown] }
}

export const money = (n: number) => (n > 0 && n < 0.01 ? '< 0,01 $' : `${n.toFixed(2).replace(/\B(?=(\d{3})+\.)/g, ' ').replace('.', ',')} $`)
export const tokens = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1).replace('.', ',')} M` : n >= 1e3 ? `${Math.round(n / 1e3)} k` : String(n))
export const duration = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}` : `${Math.round(s / 60)} min`)
const percent = (part: number, whole: number) => `${whole ? Math.round((part / whole) * 100) : 0} %`
const localTime = (iso: string) => {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return Number.isNaN(d.getTime()) ? '-' : `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** Lignes clés : étape la plus chère, effet du cache, part des sous-agents, modèles sans tarif. */
export function highlights(s: CostSummary): string[] {
  const lines: string[] = []
  const top = [...s.steps].sort((a, b) => b[1].cost - a[1].cost)[0]
  if (top) lines.push(`Étape la plus chère : \`${top[0]}\` (${percent(top[1].cost, s.total.cost)}, ${money(top[1].cost)}).`)
  const inputSide = s.total.input + s.total.read + s.total.write
  if (s.total.read) lines.push(`Cache : ${percent(s.total.read, inputSide)} des tokens d'entrée lus depuis le cache, économie estimée ${money(s.total.saving)}.`)
  if (s.total.agentTurns) lines.push(`Sous-agents : ${s.total.agentTurns} réponses, ${percent(s.total.agentCost, s.total.cost)} du coût (${money(s.total.agentCost)}).`)
  if (s.unknownModels.length) lines.push(`Sans tarif connu (comptés 0 $, mettre à jour \`cli/lib/pricing.ts\` du cœur) : ${s.unknownModels.join(', ')}.`)
  return lines
}

export function renderReport(name: string, s: CostSummary, now = new Date()): string {
  const t = s.total
  const seconds = s.sessions.reduce((sum, x) => sum + x.seconds, 0)
  const row = (label: string, x: Totals) =>
    `| ${label} | ${x.turns} | ${tokens(x.input)} | ${tokens(x.output)} | ${tokens(x.read)} | ${tokens(x.write)} | ${money(x.cost)} | ${percent(x.cost, t.cost)} |`
  return [
    `# Coût de ${name}`,
    '',
    `> Généré par \`bun daroms cost\` le ${localTime(now.toISOString())}. Montants en dollars US au tarif de l'API Anthropic (relevé le ${PRICING_DATE}). Avec un abonnement Claude Pro ou Max, ils ne sont pas facturés ainsi : ils mesurent l'usage.`,
    '',
    '| Total | Tokens | Réponses | Sessions | Durée |',
    '|---|---|---|---|---|',
    `| **${money(t.cost)}** | ${tokens(tokensOf(t))} | ${t.turns}${t.agentTurns ? ` (dont ${t.agentTurns} de sous-agents)` : ''} | ${s.sessions.length} | ${duration(seconds)} |`,
    '',
    '## Par étape',
    '',
    '| Étape | Réponses | Entrée | Sortie | Cache lu | Cache écrit | Coût | Part |',
    '|---|---|---|---|---|---|---|---|',
    ...s.steps.map(([step, x]) => row(`\`${step}\``, x)),
    row('**Total**', t),
    '',
    '## Par modèle',
    '',
    '| Modèle | Réponses | Entrée | Sortie | Cache lu | Cache écrit | Coût | Part |',
    '|---|---|---|---|---|---|---|---|',
    ...s.models.map(([model, x]) => row(`\`${model}\``, x)),
    '',
    '## Sessions',
    '',
    '| Session | Début | Durée | Réponses | Coût |',
    '|---|---|---|---|---|',
    ...s.sessions.map((x) => `| \`${x.id.slice(0, 8)}\` | ${localTime(x.started)} | ${duration(x.seconds)} | ${x.totals.turns} | ${money(x.totals.cost)} |`),
    '',
    '## À retenir',
    '',
    ...highlights(s).map((l) => `- ${l}`),
    '',
    `Tarifs : ${PRICING_URL}. Claude Code efface ses transcripts après 30 jours (réglage \`cleanupPeriodDays\`) : ce fichier garde le bilan.`,
    '',
  ].join('\n')
}
