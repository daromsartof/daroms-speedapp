// Vidéo promo : spec (store/promo.json), validation, minutage et mise en page. Fonctions pures, testées.
import { contrastRatio } from '../../packages/theme/src/color'
import { createBrandPalettes } from '../../packages/theme/src/themes'
import type { Brand } from '../../packages/theme/src/brand'

export type Localized = Record<string, string>
export type PromoScene = { route: string; caption: Localized; dark?: boolean; storage?: Record<string, string> }
export type PromoSpec = { format: Format; fps: number; hook: Localized; scenes: PromoScene[]; end?: Localized }
export type Format = 'vertical' | 'landscape' | 'square'

export const SIZES: Record<Format, { w: number; h: number }> = {
  vertical: { w: 1080, h: 1920 },
  landscape: { w: 1920, h: 1080 },
  square: { w: 1080, h: 1080 },
}

/** Textes à l'écran : courts et comptables (lisibles en 2 s sur un téléphone). */
export const TEXT_LIMITS = { words: 6, chars: 32 } as const
/** Durées (s) : accroche, chaque écran, fin ; transition au début de chaque segment. */
export const TIMING = { hook: 1.8, scene: 2.6, end: 2.4, transition: 0.5 } as const

const PICTOGRAPH = /\p{Extended_Pictographic}/u

/** Problèmes d'un texte affiché (vide = conforme). */
export function textProblems(text: string | undefined, where: string): string[] {
  if (!text?.trim()) return [`${where} : texte manquant`]
  const problems: string[] = []
  const words = text.trim().split(/\s+/).length
  if (words > TEXT_LIMITS.words) problems.push(`${where} : ${words} mots (max ${TEXT_LIMITS.words})`)
  if (text.length > TEXT_LIMITS.chars) problems.push(`${where} : ${text.length} caractères (max ${TEXT_LIMITS.chars})`)
  if (PICTOGRAPH.test(text)) problems.push(`${where} : emoji interdit`)
  if (text.includes(String.fromCharCode(0x2014))) problems.push(`${where} : tiret long interdit`)
  return problems
}

/** Valide la spec brute pour les langues demandées ; renvoie la spec complétée ou la liste des problèmes. */
export function parseSpec(raw: unknown, locales: string[]): { spec?: PromoSpec; problems: string[] } {
  const problems: string[] = []
  const input = (raw ?? {}) as Partial<PromoSpec>
  const format = input.format ?? 'vertical'
  if (!(format in SIZES)) problems.push(`format : vertical, landscape ou square (reçu ${String(format)})`)
  const fps = input.fps ?? 30
  if (![24, 25, 30, 60].includes(fps)) problems.push(`fps : 24, 25, 30 ou 60 (reçu ${fps})`)
  const scenes = Array.isArray(input.scenes) ? input.scenes : []
  if (scenes.length < 2 || scenes.length > 5) problems.push(`scenes : 2 à 5 écrans (reçu ${scenes.length})`)
  for (const locale of locales) {
    problems.push(...textProblems(input.hook?.[locale], `hook.${locale}`))
    if (input.end) problems.push(...textProblems(input.end[locale], `end.${locale}`))
    scenes.forEach((scene, i) => problems.push(...textProblems(scene.caption?.[locale], `scenes[${i}].caption.${locale}`)))
  }
  scenes.forEach((scene, i) => {
    if (typeof scene.route !== 'string' || !scene.route.startsWith('/')) problems.push(`scenes[${i}].route : chemin commençant par / attendu`)
  })
  if (problems.length) return { problems }
  return { spec: { format, fps, hook: input.hook!, scenes, end: input.end }, problems }
}

export type Segment = { kind: 'hook' | 'scene' | 'end'; index: number; start: number; end: number }

/** Découpe la vidéo : accroche, un segment par écran, carte de fin. */
export function timeline(sceneCount: number): { duration: number; segments: Segment[] } {
  const segments: Segment[] = [{ kind: 'hook', index: 0, start: 0, end: TIMING.hook }]
  let t = TIMING.hook
  for (let i = 0; i < sceneCount; i++) {
    segments.push({ kind: 'scene', index: i, start: t, end: t + TIMING.scene })
    t += TIMING.scene
  }
  segments.push({ kind: 'end', index: 0, start: t, end: t + TIMING.end })
  return { duration: Math.round((t + TIMING.end) * 1000) / 1000, segments }
}

/** Instants à regarder avant le rendu complet : accroche lisible, chaque écran posé, carte de fin. */
export function autoStills(sceneCount: number): number[] {
  const { segments, duration } = timeline(sceneCount)
  const settled = segments.filter((s) => s.kind === 'scene').map((s) => s.start + TIMING.transition + 0.9)
  return [1.1, ...settled, duration - 0.3].map((t) => Math.round(t * 100) / 100)
}

/** Proportions de l'écran capturé (390 x 844 pt). */
export const SCREEN_RATIO = 844 / 390

export type Box = { x: number; y: number; w: number; h: number }
export type Layout = { w: number; h: number; phone: Box; caption: Box & { size: number }; panel: Box }

/** Mise en page par format : légende en colonne éditoriale, téléphone posé sur un aplat de marque. */
export function layout(format: Format): Layout {
  const { w, h } = SIZES[format]
  if (format === 'landscape') {
    const ph = 960
    const pw = Math.round(ph / SCREEN_RATIO)
    return { w, h, phone: { x: 1240, y: 60, w: pw, h: ph }, caption: { x: 140, y: 380, w: 860, h: 400, size: 96 }, panel: { x: 1100, y: 0, w: 820, h } }
  }
  if (format === 'square') {
    const pw = 520
    return { w, h, phone: { x: 480, y: 330, w: pw, h: Math.round(pw * SCREEN_RATIO) }, caption: { x: 90, y: 110, w: 900, h: 200, size: 76 }, panel: { x: 0, y: 700, w, h: 380 } }
  }
  const pw = 600
  return { w, h, phone: { x: (w - pw) / 2, y: 560, w: pw, h: Math.round(pw * SCREEN_RATIO) }, caption: { x: 96, y: 170, w: 888, h: 340, size: 88 }, panel: { x: 0, y: 1180, w, h: 740 } }
}

/** Rebond des entrées selon le ton de la marque (0 = amorti). */
export const OVERSHOOT: Record<Brand['tone'], number> = { playful: 1.7, pro: 1.1, minimal: 0 }

/** Couleurs de la vidéo tirées des palettes de brand.ts (aucune couleur inventée). */
export function promoColors(brand: Brand) {
  const { surface, brand: main, accent } = createBrandPalettes(brand)
  // texte de la carte de fin : clair sur un primary foncé, foncé sur un primary clair (WCAG grands textes 3:1)
  const onPanel = contrastRatio(brand.primary, surface[0]!) >= 3 ? surface[0]! : surface[10]!
  return { bg: surface[0]!, ink: surface[10]!, muted: surface[7]!, bezel: surface[10]!, panel: brand.primary, onPanel, accent: accent[4]!, label: main[6]! }
}
