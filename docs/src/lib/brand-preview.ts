// Aperçu de marque de la vitrine : mêmes fonctions que @daroms/theme (palettes OKLCH, ton, rayons),
// importées depuis le cœur pour que la démo montre le vrai calcul et non une imitation.
import { contrastRatio } from '../../../packages/theme/src/color'
import { anchorShade, createNeutral, createPalette, SHADES } from '../../../packages/theme/src/palette'
import { semanticRadius, TONES } from '../../../packages/theme/src/tone'

export type PreviewBrand = {
  primary: string
  accent: string
  font: 'inter' | 'system'
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  tone: 'playful' | 'pro' | 'minimal'
}

export const DEFAULT_BRAND: PreviewBrand = { primary: '#4F46E5', accent: '#F97316', font: 'inter', radius: 'lg', tone: 'pro' }

export const PRESETS: { name: string; brand: PreviewBrand }[] = [
  { name: 'Lecture', brand: { primary: '#0F766E', accent: '#F59E0B', font: 'inter', radius: 'lg', tone: 'minimal' } },
  { name: 'Boutique', brand: { primary: '#BE185D', accent: '#0EA5E9', font: 'system', radius: 'full', tone: 'playful' } },
  { name: 'Coach', brand: { primary: '#1D4ED8', accent: '#84CC16', font: 'inter', radius: 'sm', tone: 'pro' } },
]

const onColor = (bg: string) => (contrastRatio(bg, '#ffffff') >= contrastRatio(bg, '#0a0a0a') ? '#ffffff' : '#0a0a0a')

/** Variables CSS de l'écran d'aperçu (clair et sombre) et palette de marque affichée. */
export function previewVars(brand: PreviewBrand) {
  const tone = TONES[brand.tone]
  const surface = createNeutral(brand.primary, tone.surfaceChroma)
  const primary = createPalette(brand.primary)
  const accent = createPalette(brand.accent)
  const anchor = SHADES.indexOf(anchorShade(brand.primary))
  const accentAnchor = SHADES.indexOf(anchorShade(brand.accent))
  const radius = semanticRadius({ ...brand })
  const fill = primary[anchor]!
  const highlight = accent[accentAnchor]!
  const vars: Record<string, string> = {
    '--p-font': brand.font === 'inter' ? "'Inter Variable', system-ui, sans-serif" : "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    '--p-heading-weight': tone.headingWeight,
    '--p-heading-tracking': `${tone.headingTracking}px`,
    '--p-gutter': `${tone.space.gutter}px`,
    '--p-stack': `${tone.space.stack}px`,
    '--p-tight': `${tone.space.tight}px`,
    '--p-r-button': `${Math.min(radius.button, 999)}px`,
    '--p-r-card': `${radius.card}px`,
    '--p-r-chip': `${Math.min(radius.chip, 999)}px`,
    '--p-brand': fill,
    '--p-on-brand': onColor(fill),
    '--p-accent': highlight,
    '--p-on-accent': onColor(highlight),
    // clair
    '--p-l-bg': surface[1]!,
    '--p-l-card': surface[0]!,
    '--p-l-text': surface[10]!,
    '--p-l-muted': surface[6]!,
    '--p-l-line': surface[2]!,
    '--p-l-soft': primary[1]!,
    '--p-l-on-soft': primary[8]!,
    '--p-l-track': surface[2]!,
    // sombre
    '--p-d-bg': surface[10]!,
    '--p-d-card': surface[9]!,
    '--p-d-text': surface[0]!,
    '--p-d-muted': surface[4]!,
    '--p-d-line': surface[8]!,
    '--p-d-soft': primary[9]!,
    '--p-d-on-soft': primary[2]!,
    '--p-d-track': surface[8]!,
  }
  return { vars, palette: primary.map((hex, i) => ({ shade: SHADES[i]!, hex })), anchorShade: SHADES[anchor]! }
}

export const styleString = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
