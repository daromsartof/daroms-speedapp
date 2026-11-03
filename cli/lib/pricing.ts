// Tarifs de l'API Anthropic en dollars US par million de tokens, relevés sur la page officielle.
// À mettre à jour quand Anthropic change ses prix ou sort un modèle (un modèle absent est signalé, compté 0 $).
export const PRICING_DATE = '2026-11-03'
export const PRICING_URL = 'https://platform.claude.com/docs/en/about-claude/pricing'

export type Rates = { input: number; write5m: number; write1h: number; read: number; output: number }
export type Usage = { input: number; output: number; read: number; write5m: number; write1h: number; webSearches: number; fast: boolean; usGeo: boolean }

const r = (input: number, write5m: number, write1h: number, read: number, output: number): Rates => ({ input, write5m, write1h, read, output })
const OPUS_4 = r(5, 6.25, 10, 0.5, 25)
const OPUS_OLD = r(15, 18.75, 30, 1.5, 75)
const SONNET_4 = r(3, 3.75, 6, 0.3, 15)

/** [préfixe de l'identifiant, tarifs, modèle 4.6 ou plus récent (majoration inférence US)]. */
const TABLE: [string, Rates, boolean][] = [
  ['claude-fable-5-1', r(10, 12.5, 20, 0.25, 50), true],
  ['claude-mythos-5-1', r(10, 12.5, 20, 0.25, 50), true],
  ['claude-fable-5', r(10, 12.5, 20, 1, 50), true],
  ['claude-mythos-5', r(10, 12.5, 20, 1, 50), true],
  ['claude-opus-5-5', r(4, 5, 8, 0.2, 20), true],
  ['claude-opus-5', OPUS_4, true],
  ['claude-opus-4-8', OPUS_4, true],
  ['claude-opus-4-7', OPUS_4, true],
  ['claude-opus-4-6', OPUS_4, true],
  ['claude-opus-4-5', OPUS_4, false],
  ['claude-opus-4-1', OPUS_OLD, false],
  ['claude-opus-4', OPUS_OLD, false],
  ['claude-sonnet-5-5', r(2, 2.5, 4, 0.1, 10), true],
  ['claude-sonnet-5', r(2, 2.5, 4, 0.2, 10), true],
  ['claude-sonnet-4-6', SONNET_4, true],
  ['claude-sonnet-4-5', SONNET_4, false],
  ['claude-sonnet-4', SONNET_4, false],
  ['claude-haiku-5-5', r(0.1, 0.125, 0.2, 0.01, 0.5), true],
  ['claude-haiku-4-5', r(1, 1.25, 2, 0.1, 5), false],
  ['claude-3-5-haiku', r(0.8, 1, 1.6, 0.08, 4), false],
].sort((a, b) => (b[0] as string).length - (a[0] as string).length) as [string, Rates, boolean][]

/** Claude Haiku 5.5 au-delà de 100 000 tokens de prompt (cache compris). */
const HAIKU_5_5_LONG = r(0.5, 0.625, 1, 0.05, 2.5)
const FAST = ['claude-opus-5-5', 'claude-opus-5', 'claude-opus-4-8']
const WEB_SEARCH = 10 / 1000

/** Identifiant de base : sans préfixe de plateforme, ni suffixe [1m], ni version Bedrock. */
export function normalizeModel(model: string): string {
  const start = model.indexOf('claude-')
  return (start >= 0 ? model.slice(start) : model).replace(/\[.*\]$/, '').replace(/@/, '-').replace(/-v\d+(:\d+)?$/, '')
}

function lookup(model: string): [string, Rates, boolean] | undefined {
  const id = normalizeModel(model)
  return TABLE.find(([prefix]) => id === prefix || (id.startsWith(`${prefix}-`) && /^\d/.test(id.slice(prefix.length + 1))))
}

export const knownModel = (model: string) => lookup(model) !== undefined

/** Prix d'une réponse en dollars, ou undefined si le modèle n'a pas de tarif connu. */
export function priceOf(model: string, u: Usage): number | undefined {
  const found = lookup(model)
  if (!found) return undefined
  const [prefix, base, modern] = found
  const prompt = u.input + u.read + u.write5m + u.write1h
  const rates = prefix === 'claude-haiku-5-5' && prompt > 100_000 ? HAIKU_5_5_LONG : base
  const tokens = (u.input * rates.input + u.write5m * rates.write5m + u.write1h * rates.write1h + u.read * rates.read + u.output * rates.output) / 1e6
  const multiplier = (u.fast && FAST.includes(prefix) ? 2 : 1) * (u.usGeo && modern ? 1.1 : 1)
  return tokens * multiplier + u.webSearches * WEB_SEARCH
}

/** Économie due au cache : les tokens lus auraient coûté le prix d'entrée normal. */
export function cacheSavingOf(model: string, read: number): number {
  const rates = lookup(model)?.[1]
  return rates ? (read * (rates.input - rates.read)) / 1e6 : 0
}
