import { describe, expect, it } from 'bun:test'

import { money, renderReport, summarize, tokens } from '../lib/cost-report'
import { normalizeModel, priceOf, type Usage } from '../lib/pricing'
import { parseSession } from '../lib/transcripts'

const usage = (u: Partial<Usage>): Usage => ({ input: 0, output: 0, read: 0, write5m: 0, write1h: 0, webSearches: 0, fast: false, usGeo: false, ...u })
const M = 1_000_000

describe('tarifs', () => {
  it('prix par catégorie de tokens', () => {
    expect(priceOf('claude-opus-5-5', usage({ input: M, output: M, read: M, write5m: M, write1h: M }))).toBeCloseTo(4 + 20 + 0.2 + 5 + 8)
    expect(priceOf('claude-sonnet-5-5', usage({ read: M }))).toBeCloseTo(0.1)
    expect(priceOf('claude-haiku-4-5-20251001', usage({ output: M }))).toBeCloseTo(5)
  })
  it('reconnaît le modèle exact avant son préfixe', () => {
    expect(priceOf('claude-opus-5', usage({ input: M }))).toBeCloseTo(5)
    expect(priceOf('claude-sonnet-4-20250514', usage({ input: M }))).toBeCloseTo(3)
    expect(normalizeModel('us.anthropic.claude-opus-5-5[1m]')).toBe('claude-opus-5-5')
    expect(priceOf('gpt-5', usage({ input: M }))).toBeUndefined()
  })
  it('applique mode rapide, inférence US, palier long de Haiku 5.5 et recherches web', () => {
    expect(priceOf('claude-opus-5-5', usage({ input: M, fast: true }))).toBeCloseTo(8)
    expect(priceOf('claude-opus-5-5', usage({ input: M, usGeo: true }))).toBeCloseTo(4.4)
    expect(priceOf('claude-opus-4-5', usage({ input: M, usGeo: true }))).toBeCloseTo(5)
    expect(priceOf('claude-haiku-5-5', usage({ input: 50_000 }))).toBeCloseTo(0.005)
    expect(priceOf('claude-haiku-5-5', usage({ input: 50_000, read: 60_000 }))).toBeCloseTo(0.025 + 0.003)
    expect(priceOf('claude-sonnet-5-5', usage({ webSearches: 3 }))).toBeCloseTo(0.03)
  })
})

const line = (entry: object) => JSON.stringify(entry)
const reply = (id: string, at: string, content: unknown[] = [], cwd = '/apps/lecture') =>
  line({ type: 'assistant', timestamp: at, cwd, message: { id, model: 'claude-opus-5-5', content, usage: { input_tokens: 0, output_tokens: M, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } } })
const skill = (name: string) => [{ type: 'tool_use', name: 'Skill', input: { skill: name } }]

describe('transcripts', () => {
  const main = [
    line({ type: 'user', timestamp: '2026-10-29T10:00:00Z', cwd: '/apps/autre', message: { content: '<command-name>/daroms-day</command-name>' } }),
    reply('m1', '2026-10-29T10:00:01Z', skill('daroms-idea'), '/apps/autre'),
    reply('m1', '2026-10-29T10:00:01Z', skill('daroms-idea'), '/apps/autre'),
    reply('m2', '2026-10-29T10:01:00Z', [{ type: 'tool_use', name: 'Bash', input: { command: 'bunx @daromsart/daroms-speed-app new lecture' } }]),
    reply('m3', '2026-10-29T10:02:00Z', skill('daroms-design-system')),
    reply('m4', '2026-10-29T10:03:00Z', skill('daroms-polish')),
    reply('m5', '2026-10-29T11:00:00Z'),
  ].join('\n')
  // a1 tourne pendant la création (avant l'appel de daroms-polish à 10:03), a2 pendant la finition
  const agent = [reply('a1', '2026-10-29T10:02:30Z'), reply('a2', '2026-10-29T11:30:00Z')].join('\n')
  const session = parseSession('s1', main, [{ text: agent, agent: 'daroms-designer' }], '/apps/lecture')

  it("attribue chaque réponse à l'étape en cours, sans compter un skill d'appui", () => {
    const steps = session.turns.map((t) => `${t.id}:${t.step}`)
    expect(steps).toEqual(['m1:daroms-day', 'm2:daroms-idea', 'm3:daroms-new', 'm4:daroms-new', 'm5:daroms-polish', 'a1:daroms-new', 'a2:daroms-polish'])
    expect(session.share).toBeCloseTo(4 / 7)
  })
  it('additionne chaque réponse une seule fois', () => {
    const summary = summarize([session, session])
    expect(summary.total.turns).toBe(7)
    expect(summary.total.agentTurns).toBe(2)
    expect(summary.total.cost).toBeCloseTo(7 * 20)
    expect(summary.steps.map(([s]) => s)).toEqual(['daroms-day', 'daroms-idea', 'daroms-new', 'daroms-polish'])
  })
  it('rédige le rapport', () => {
    const report = renderReport('Lecture', summarize([session]), new Date('2026-10-29T18:00:00Z'))
    expect(report).toContain('# Coût de Lecture')
    expect(report).toContain('| **140,00 $** | 7,0 M | 7 (dont 2 de sous-agents) | 1 | 1 h 00 |')
    expect(report).toContain('| `daroms-new` | 3 | 0 | 3,0 M | 0 | 0 | 60,00 $ | 43 % |')
    expect(report).toContain('Étape la plus chère : `daroms-new`')
    expect(money(1234.5)).toBe('1 234,50 $')
    expect(money(0.001)).toBe('< 0,01 $')
    expect(tokens(559_283)).toBe('559 k')
  })
})
