// Planche de comparaison des directions : tailles réelles, écran d'accueil clair et sombre, icône thématique Android.
import { ICON, inkGroup, markDefs, placement, type Box, type Direction } from './logo'

export const SHEET_SIZES = [220, 120, 60, 48, 16] as const
export type SheetRow = { d: Direction; ok: boolean; failing: string[]; images: Record<number, string>; themed: string }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
// voisines neutres de l'écran d'accueil : aplats sourds, un signe simple chacune
const NEIGHBOURS = ['#D9DEE5', '#E8D9C9', '#CFE0D6', '#DDD5E8', '#E5E1D3', '#D3DDE8', '#E8D3D6']

/** Icône thématique Android 13+ : couche monochrome teintée par le système sur un disque clair. */
export function themedSvg(d: Direction, bbox: Box): string {
  const { defs, id } = markDefs(d, 't')
  const { scale, tx, ty } = placement(bbox, 'foreground')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON}" height="${ICON}"><defs>${defs}</defs><circle cx="512" cy="512" r="512" fill="#DCE4F2"/><g transform="translate(${tx} ${ty}) scale(${scale})" ${inkGroup('#2A3A57', d.grid ?? 48)}><use href="#${id}"/></g></svg>`
}

function homeScreen(x: number, y: number, dark: boolean, icon: string, name: string): string {
  const [wall, label] = dark ? ['#15171C', '#E6E8EC'] : ['#EEF0F3', '#30343B']
  const cells: string[] = []
  for (let i = 0; i < 8; i++) {
    const cx = x + 18 + (i % 4) * 78
    const cy = y + 16 + Math.floor(i / 4) * 92
    if (i === 1) {
      cells.push(`<image href="${icon}" x="${cx}" y="${cy}" width="60" height="60" clip-path="url(#round)"/>`)
      cells.push(`<text x="${cx + 30}" y="${cy + 76}" font-size="11" fill="${label}" text-anchor="middle">${esc(name.slice(0, 12))}</text>`)
    } else {
      const c = NEIGHBOURS[i % NEIGHBOURS.length]!
      cells.push(`<rect x="${cx}" y="${cy}" width="60" height="60" rx="13.5" fill="${dark ? '#2A2E36' : c}"/>`)
      cells.push(i % 2 ? `<circle cx="${cx + 30}" cy="${cy + 30}" r="12" fill="${dark ? c : '#FFFFFF'}" opacity="0.85"/>` : `<rect x="${cx + 19}" y="${cy + 19}" width="22" height="22" rx="4" fill="${dark ? c : '#FFFFFF'}" opacity="0.85"/>`)
      cells.push(`<rect x="${cx + 12}" y="${cy + 70}" width="36" height="6" rx="3" fill="${label}" opacity="0.25"/>`)
    }
  }
  return `<rect x="${x}" y="${y}" width="330" height="200" rx="18" fill="${wall}"/>${cells.join('')}`
}

/** Coupe un texte en lignes d'au plus `width` caractères, `max` lignes, points de suspension si tronqué. */
export function wrap(text: string, width: number, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > width) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  if (lines.length > max) lines.splice(max - 1, lines.length, `${lines[max - 1]!.slice(0, width - 1)}…`)
  return lines
}

/** La planche en SVG (rendue en PNG par resvg). */
export function sheetSvg(rows: SheetRow[], appName: string): string {
  const W = 1840
  const H = 90 + rows.length * 290
  const body = rows
    .map((r, i) => {
      const y = 90 + i * 290
      const status = r.ok ? `<text x="40" y="${y + 134}" font-size="15" font-weight="700" fill="#1E7A4C">vérifications ok</text>` : r.failing.slice(0, 4).map((f, k) => `<text x="40" y="${y + 134 + k * 20}" font-size="14" fill="#B42318">${esc(f)}</text>`).join('')
      const idea = wrap(`${r.d.kind} · ${r.d.idea}`, 44, 2).map((line, k) => `<text x="40" y="${y + 78 + k * 18}" font-size="14" fill="#6B7280">${esc(line)}</text>`).join('')
      let x = 400
      const sizes = SHEET_SIZES.map((s) => {
        const el = `<image href="${r.images[s]}" x="${x}" y="${y + (220 - s) / 2 + 20}" width="${s}" height="${s}" clip-path="url(#round)"/><text x="${x + s / 2}" y="${y + 268}" font-size="12" fill="#6B7280" text-anchor="middle">${s}</text>`
        x += s + 28
        return el
      }).join('')
      const themed = `<image href="${r.themed}" x="${x}" y="${y + 100}" width="60" height="60"/><text x="${x + 30}" y="${y + 268}" font-size="12" fill="#6B7280" text-anchor="middle">thème</text>`
      return `<text x="40" y="${y + 52}" font-size="26" font-weight="700" fill="#111827">${i + 1}. ${esc(r.d.name)}</text>${idea}${status}${sizes}${themed}${homeScreen(1120, y + 30, false, r.images[60]!, appName)}${homeScreen(1470, y + 30, true, r.images[60]!, appName)}<line x1="40" x2="${W - 40}" y1="${y + 286}" y2="${y + 286}" stroke="#E5E7EB"/>`
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Inter"><defs><clipPath id="round" clipPathUnits="objectBoundingBox"><rect width="1" height="1" rx="0.225"/></clipPath></defs><rect width="${W}" height="${H}" fill="#FFFFFF"/><text x="40" y="56" font-size="30" font-weight="800" fill="#111827">${esc(appName)} : ${rows.length} directions d'icône</text>${body}</svg>`
}
