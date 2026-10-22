// Formats localisés (prix, nombres, dates). Fonctions pures, testées.
import { getLocales } from 'expo-localization'

export function deviceLocale(): string {
  try {
    return getLocales()[0]?.languageTag ?? 'fr-FR'
  } catch {
    return 'fr-FR'
  }
}

export function formatPrice(amount: number, currency = 'EUR', locale = deviceLocale()): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

export function formatNumber(value: number, locale = deviceLocale(), options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

export function formatPercent(ratio: number, locale = deviceLocale()): string {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(ratio)
}

export type DateStyle = 'short' | 'medium' | 'long' | 'time' | 'datetime'

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  time: { hour: '2-digit', minute: '2-digit' },
  datetime: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
}

export function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value)
}

export function formatDate(value: Date | string | number, style: DateStyle = 'medium', locale = deviceLocale()): string {
  return new Intl.DateTimeFormat(locale, DATE_OPTIONS[style]).format(toDate(value))
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
]

/** « il y a 3 min », « dans 2 jours »... */
export function formatRelative(value: Date | string | number, locale = deviceLocale(), now = Date.now()): string {
  const seconds = Math.round((toDate(value).getTime() - now) / 1000)
  const [unit, size] = UNITS.find(([, s]) => Math.abs(seconds) >= s) ?? ['second', 1]
  const amount = Math.round(seconds / size)
  if (typeof Intl.RelativeTimeFormat === 'function') {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(amount, unit)
  }
  return formatDate(value, 'medium', locale)
}

/** Initiales pour un avatar (« Ada Lovelace » -> « AL »). */
export function initials(name: string, max = 2): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}
