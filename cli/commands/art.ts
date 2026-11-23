// daroms art : illustrations et visuels générés par une API d'images, avec la clé de l'utilisateur
// (jamais dans l'app : variable d'environnement du terminal). Le prompt impose la marque et le style des
// illustrations intégrées, pour que l'image générée rejoigne le reste de l'app.
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { createBrandPalettes } from '../../packages/theme/src/themes'
import type { Brand } from '../../packages/theme/src/brand'
import { brandGradients } from '../../packages/theme/src/direction'
import { bool, flag, type Args } from '../lib/args'
import { writeFile } from '../lib/fsx'
import { fail, log } from '../lib/log'
import { loadBrand } from '../lib/manifest'
import { appRoot } from '../lib/paths'

export type ArtKind = 'illustration' | 'scene' | 'icon'
export type Provider = 'openai' | 'recraft'

const STYLE: Record<ArtKind, string> = {
  illustration: 'flat vector illustration with soft gradients and subtle depth, rounded shapes, floating cards and small sparkles, clean composition centered on a transparent background',
  scene: 'editorial vector scene with soft gradients, gentle lighting and depth, generous negative space, calm and premium mood',
  icon: 'single bold symbol, app icon style, smooth gradient fill, soft highlight and shadow, centered, no background clutter',
}

/** Prompt complet : le sujet de l'utilisateur, le style, les couleurs exactes de la marque, les interdits. */
export function artPrompt(brand: Brand, subject: string, kind: ArtKind): string {
  const p = createBrandPalettes(brand)
  const gradient = brandGradients(brand.direction, p).brand.light
  return [
    `${subject.trim().replace(/\.$/, '')}.`,
    `Style: ${STYLE[kind]}.`,
    `Palette: primary ${brand.primary}, accent ${brand.accent}, gradient ${gradient.join(' to ')}, light tints ${p.brand[1]} and ${p.accent[1]}, neutrals ${p.surface[2]} and ${p.surface[9]}; no other hues.`,
    `Mood: ${brand.tone === 'playful' ? 'playful and warm' : brand.tone === 'minimal' ? 'minimal and quiet' : 'confident and professional'}.`,
    'No text, no letters, no logos, no watermark, no photorealism, no busy background.',
  ].join(' ')
}

/** Nom de fichier sûr : minuscules, chiffres, tirets. */
export const artName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

async function generate(provider: Provider, prompt: string, kind: ArtKind): Promise<Uint8Array> {
  const key = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.RECRAFT_API_KEY
  if (!key) fail(`${provider === 'openai' ? 'OPENAI_API_KEY' : 'RECRAFT_API_KEY'} absente : exporter la clé dans le terminal (jamais dans .env de l'app, jamais dans le code)`)
  const request =
    provider === 'openai'
      ? { url: 'https://api.openai.com/v1/images/generations', body: { model: 'gpt-image-1', prompt, size: '1024x1024', background: kind === 'scene' ? 'opaque' : 'transparent', n: 1 } }
      : { url: 'https://external.api.recraft.ai/v1/images/generations', body: { prompt, model: 'recraftv3', style: kind === 'icon' ? 'icon' : 'vector_illustration', size: '1024x1024', response_format: 'b64_json', n: 1 } }
  const res = await fetch(request.url, { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify(request.body), signal: AbortSignal.timeout(120_000) })
  if (!res.ok) fail(`${provider} : HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)
  const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] }
  const item = json.data?.[0]
  if (item?.b64_json) return Uint8Array.from(Buffer.from(item.b64_json, 'base64'))
  if (item?.url) return new Uint8Array(await (await fetch(item.url)).arrayBuffer())
  return fail(`${provider} : réponse sans image`)
}

/** daroms art <nom> "<sujet>" [--kind illustration|scene|icon] [--provider openai|recraft] [--print] */
export async function art(args: Args) {
  const root = appRoot()
  const [rawName, ...words] = args._
  const subject = words.join(' ')
  if (!rawName || !subject) {
    const dir = join(root, 'assets', 'art')
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.png')) : []
    if (files.length) for (const f of files) log.info(`assets/art/${f}`)
    return fail('usage : bun daroms art <nom> "<sujet de l\'image>" [--kind illustration|scene|icon] [--provider openai|recraft] [--print]')
  }
  const kind = (flag(args, 'kind') ?? 'illustration') as ArtKind
  if (!(kind in STYLE)) fail('--kind : illustration, scene ou icon')
  const provider = (flag(args, 'provider') ?? (process.env.RECRAFT_API_KEY && !process.env.OPENAI_API_KEY ? 'recraft' : 'openai')) as Provider
  if (provider !== 'openai' && provider !== 'recraft') fail('--provider : openai ou recraft')
  const brand = await loadBrand(root)
  if (!brand) return fail('brand.ts invalide')
  const prompt = artPrompt(brand, subject, kind)
  if (bool(args, 'print')) {
    console.log(prompt)
    return
  }
  log.step(`génération (${provider}, ${kind})`)
  const image = await generate(provider, prompt, kind)
  const file = join('assets', 'art', `${artName(rawName)}.png`)
  writeFile(join(root, file), image)
  log.ok(file)
  log.info(`Regarder l'image (Read) avant de l'utiliser : <Image source={require('~/${file}')} /> ; une image ratée se régénère avec un sujet plus précis.`)
}
