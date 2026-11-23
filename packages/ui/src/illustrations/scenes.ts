// Illustrations intégrées : scènes SVG composées de formes simples, colorées par la marque (aucune couleur
// inventée). Même source pour l'app (SvgXml) et la CLI (planches, captures) : fonctions pures, testées.
import { MOMENT_SCENES } from './scenes-moments'
import { UI_SCENES } from './scenes-ui'
import { VIEWBOX, type IllustrationColors, type IllustrationName } from './shapes'

export { ILLUSTRATIONS, VIEWBOX, type IllustrationColors, type IllustrationName } from './shapes'

const SCENES = { ...UI_SCENES, ...MOMENT_SCENES }

/** SVG complet d'une scène (viewBox 320 x 240). `id` rend les dégradés uniques dans une même page. */
export function illustrationSvg(name: IllustrationName, colors: IllustrationColors, id: string = name): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, '')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX.w} ${VIEWBOX.h}">${SCENES[name](colors, safe)}</svg>`
}

/** Couleurs d'illustration depuis les palettes (indices 0..10 = 50..950) et le dégradé de la direction. */
export function illustrationColors(p: { brand: readonly string[]; accent: readonly string[]; surface: readonly string[] }, gradient: string[], dark = false): IllustrationColors {
  const g: [string, string, string] = [gradient[0]!, gradient[1] ?? gradient[0]!, gradient[2] ?? gradient[1] ?? gradient[0]!]
  return {
    b1: dark ? p.brand[9]! : p.brand[1]!,
    b2: dark ? p.brand[8]! : p.brand[2]!,
    b3: p.brand[3]!,
    b4: p.brand[4]!,
    b5: p.brand[5]!,
    b6: p.brand[6]!,
    b7: p.brand[7]!,
    a2: dark ? p.accent[8]! : p.accent[2]!,
    a3: p.accent[3]!,
    a4: p.accent[4]!,
    a5: p.accent[5]!,
    g1: g[0],
    g2: g[1],
    g3: g[2],
    on: 'white',
    card: dark ? p.surface[9]! : 'white',
    line: dark ? p.surface[8]! : p.surface[2]!,
    shadow: dark ? 'black' : p.surface[10]!,
  }
}
