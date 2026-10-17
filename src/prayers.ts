import { addDays, todayStr } from './logic'

export const PRAYER_IDS = ['fajr', 'zohar', 'asr', 'maghrib', 'isha'] as const
export type PrayerId = typeof PRAYER_IDS[number]
export type PrayerDay = Partial<Record<PrayerId, boolean>>
export type PrayerHistory = Record<string, PrayerDay>

export const PRAYER_HISTORY_KEY = 'wa-prayer-history-v1'
const LEGACY_KEY = 'wa-prayers-v1'

export function readPrayerHistory(): PrayerHistory {
  try {
    const history = JSON.parse(localStorage.getItem(PRAYER_HISTORY_KEY) || '{}') as PrayerHistory
    // Keep today's existing checklist visible after upgrading from the one-day format.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null') as { d?: string; v?: PrayerDay } | null
    if (legacy?.d && legacy.v && !history[legacy.d]) history[legacy.d] = legacy.v
    return history
  } catch {
    return {}
  }
}

export function recordPrayerDay(prayers: PrayerDay, date = todayStr()): void {
  const history = readPrayerHistory()
  history[date] = prayers
  localStorage.setItem(PRAYER_HISTORY_KEY, JSON.stringify(history))
}

export interface PrayerChartDay {
  date: string
  percent: number | null
  future: boolean
}

export function prayerPercent(prayers?: PrayerDay): number | null {
  if (!prayers) return null
  return Math.round(PRAYER_IDS.filter(id => prayers[id]).length / PRAYER_IDS.length * 100)
}

export function getPrayerWeek(history: PrayerHistory, today = todayStr()): PrayerChartDay[] {
  const weekday = new Date(`${today}T12:00:00`).getDay()
  const monday = addDays(today, -((weekday + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i)
    return { date, percent: prayerPercent(history[date]), future: date > today }
  })
}

export function getPrayerMonth(history: PrayerHistory, today = todayStr()): PrayerChartDay[] {
  const [year, month] = today.split('-').map(Number)
  const days = new Date(year, month, 0).getDate()
  const first = `${year}-${String(month).padStart(2, '0')}-01`
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(first, i)
    return { date, percent: prayerPercent(history[date]), future: date > today }
  })
}
