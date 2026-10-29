// Jours calendaires locaux (suivi, séries, graphiques). Fonctions pures, testées.
// Calcul par date civile et non en millisecondes : un jour de 23 h ou 25 h (heure d'été) ne décale rien.
import { deviceLocale, toDate } from './format'

const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** Date locale à midi (évite les bascules de jour) ; « AAAA-MM-JJ » est lu comme un jour local, pas UTC. */
export function toDay(value: Date | string | number): Date {
  if (typeof value === 'string' && DAY_ONLY.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y!, m! - 1, d!, 12)
  }
  const date = toDate(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
}

/** Jour local « AAAA-MM-JJ » (clé de regroupement, colonne SQL date). */
export function dayKey(value: Date | string | number = new Date()): string {
  const d = toDay(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDays(value: Date | string | number, days: number): Date {
  const d = toDay(value)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, 12)
}

/** Nombre de jours calendaires de `from` à `to` (positif si `to` est après). */
export function daysBetween(from: Date | string | number, to: Date | string | number): number {
  return Math.round((toDay(to).getTime() - toDay(from).getTime()) / 86_400_000)
}

export function isToday(value: Date | string | number, now: Date | string | number = new Date()): boolean {
  return dayKey(value) === dayKey(now)
}

/**
 * Somme par jour sur les `days` derniers jours, du plus ancien à aujourd'hui (jours vides à 0).
 * `value` : 1 par défaut (compte les entrées).
 */
export function lastDays<T>(
  items: readonly T[],
  date: (item: T) => Date | string | number,
  { days = 7, value = () => 1, now = new Date() }: { days?: number; value?: (item: T) => number; now?: Date | string | number } = {},
): { day: string; value: number }[] {
  const totals = new Map<string, number>()
  for (const item of items) {
    const key = dayKey(date(item))
    totals.set(key, (totals.get(key) ?? 0) + value(item))
  }
  return Array.from({ length: days }, (_, i) => {
    const day = dayKey(addDays(now, i - days + 1))
    return { day, value: totals.get(day) ?? 0 }
  })
}

/** Jours consécutifs avec au moins une date, jusqu'à aujourd'hui (ou hier si rien aujourd'hui : la série tient encore). */
export function streak(dates: readonly (Date | string | number)[], now: Date | string | number = new Date()): number {
  const days = new Set(dates.map((d) => dayKey(d)))
  let cursor = days.has(dayKey(now)) ? toDay(now) : addDays(now, -1)
  let count = 0
  while (days.has(dayKey(cursor))) {
    count += 1
    cursor = addDays(cursor, -1)
  }
  return count
}

/** Jour de la semaine localisé : narrow « L », short « lun. », long « lundi ». */
export function formatWeekday(value: Date | string | number, style: 'narrow' | 'short' | 'long' = 'short', locale = deviceLocale()): string {
  return new Intl.DateTimeFormat(locale, { weekday: style }).format(toDay(value))
}
