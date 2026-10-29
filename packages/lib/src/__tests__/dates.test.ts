import { addDays, dayKey, daysBetween, formatWeekday, isToday, lastDays, streak, toDay } from '../dates'

// dates locales construites par composants : le test ne dépend pas du fuseau de la machine
const now = new Date(2026, 9, 22, 18, 0)
const ago = (days: number, hour = 9) => new Date(2026, 9, 22 - days, hour)

describe('jours calendaires', () => {
  it('lit « AAAA-MM-JJ » comme un jour local', () => {
    expect(dayKey('2026-10-22')).toBe('2026-10-22')
    expect(toDay('2026-03-01').getDate()).toBe(1)
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })

  it('ajoute des jours sans dépendre de la durée du jour', () => {
    expect(dayKey(addDays('2026-03-28', 2))).toBe('2026-03-30')
    expect(dayKey(addDays('2026-01-01', -1))).toBe('2025-12-31')
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2)
    expect(isToday(ago(0, 7), now)).toBe(true)
  })

  it('agrège les derniers jours, du plus ancien à aujourd hui', () => {
    const entries = [
      { at: ago(0), pages: 10 },
      { at: ago(0, 20), pages: 5 },
      { at: ago(2), pages: 20 },
      { at: ago(9), pages: 99 },
    ]
    const days = lastDays(entries, (e) => e.at, { value: (e) => e.pages, now })
    expect(days).toHaveLength(7)
    expect(days[6]).toEqual({ day: '2026-10-22', value: 15 })
    expect(days[4]).toEqual({ day: '2026-10-20', value: 20 })
    expect(days.reduce((sum, d) => sum + d.value, 0)).toBe(35)
    expect(lastDays(entries, (e) => e.at, { now, days: 3 }).map((d) => d.value)).toEqual([1, 0, 2])
  })

  it('compte la série de jours consécutifs', () => {
    expect(streak([ago(0), ago(1), ago(2), ago(4)], now)).toBe(3)
    expect(streak([ago(1), ago(2)], now)).toBe(2)
    expect(streak(['2026-10-21', '2026-10-20'], now)).toBe(2)
    expect(streak([ago(3)], now)).toBe(0)
  })

  it('formate le jour de la semaine', () => {
    expect(formatWeekday('2026-10-22', 'long', 'fr-FR')).toBe('jeudi')
    expect(formatWeekday('2026-10-22', 'narrow', 'en-US')).toBe('T')
  })
})
