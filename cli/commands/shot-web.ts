// Inspection d'une route sur le web (react-native-web) avec Chromium headless.
import { join } from 'node:path'

import { fail } from '../lib/log'
import { appRoot } from '../lib/paths'

export type PageReport = {
  route: string
  scheme: 'light' | 'dark'
  errors: string[]
  warnings: string[]
  overflows: string[]
  texts: string[]
  shot?: string
}

type Options = { url: string; route: string; dark: boolean; width: number; shotPath: string; forceShot: boolean; locale: string; storage: Record<string, string> }

const IGNORED = [/Download the React DevTools/, /\[HMR\]/, /Running application/, /favicon/]

async function loadPlaywright() {
  try {
    return (await import(join(appRoot(), 'node_modules', 'playwright-core'))) as typeof import('playwright-core')
  } catch {
    return fail('playwright-core manquant : bun add -d playwright-core')
  }
}

export async function inspectPage({ url, route, dark, width, shotPath, forceShot, locale, storage }: Options): Promise<PageReport> {
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }))
  const scheme = dark ? 'dark' : 'light'
  const report: PageReport = { route, scheme, errors: [], warnings: [], overflows: [], texts: [] }
  try {
    const page = await browser.newPage({ viewport: { width, height: 844 }, colorScheme: scheme, deviceScaleFactor: 1, locale })
    page.on('console', (msg) => {
      const text = msg.text().split('\n')[0]!.slice(0, 220)
      if (IGNORED.some((re) => re.test(text))) return
      if (msg.type() === 'error') report.errors.push(text)
      else if (msg.type() === 'warning') report.warnings.push(text)
    })
    // état local pré-rempli (ex. onboarding déjà vu) : clés du stockage @daroms/lib (préfixe daroms:)
    await page.addInitScript((entries) => {
      for (const [key, value] of Object.entries(entries)) localStorage.setItem(`daroms:${key}`, value)
    }, storage)
    page.on('pageerror', (error) => report.errors.push(`exception : ${error.message.trim().split('\n')[0]}`))
    const target = `${url}${route.startsWith('/') ? route : `/${route}`}${route.includes('?') ? '&' : '?'}theme=${scheme}`
    await page.goto(target, { waitUntil: 'networkidle', timeout: 90_000 })
    await page.waitForTimeout(1200)
    const found = await page.evaluate((viewport) => {
      const overflows: string[] = []
      const label = (el: Element) => (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40) || el.tagName.toLowerCase()
      // contenu d'un défilement horizontal (carrousel, onglets) : hors écran par construction
      const inScroller = (el: Element) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX
          if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth) return true
        }
        return false
      }
      for (const el of Array.from(document.body.querySelectorAll('*'))) {
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0 || inScroller(el)) continue
        if (rect.right > viewport + 1 || rect.left < -1) overflows.push(`hors écran (${Math.round(rect.left)}..${Math.round(rect.right)}px) : ${label(el)}`)
        const style = getComputedStyle(el)
        if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 1 && style.overflow === 'hidden' && style.textOverflow !== 'ellipsis') {
          overflows.push(`texte coupé : ${label(el)}`)
        }
      }
      const texts = Array.from(document.body.querySelectorAll('div[dir], span'))
        .filter((el) => el.children.length === 0 && (el.textContent ?? '').trim())
        .map((el) => (el.textContent ?? '').trim().slice(0, 40))
      return { overflows: [...new Set(overflows)], texts: [...new Set(texts)] }
    }, width)
    report.overflows = found.overflows
    report.texts = found.texts
    if (forceShot || report.overflows.length || report.errors.length) {
      await page.screenshot({ path: shotPath, fullPage: true })
      report.shot = shotPath
    }
  } finally {
    await browser.close()
  }
  return report
}
