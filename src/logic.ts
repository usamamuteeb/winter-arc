import { HABITS, MEALS, PILLARS, type Habit, type Meal, type Pillar, type WeightEntry } from './data'

/* ---------- dates ---------- */
export const pad = (n: number) => String(n).padStart(2, '0')
export const dstr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayStr = () => dstr(new Date())
export const parseD = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (s: string, n: number) => { const d = parseD(s); d.setDate(d.getDate() + n); return dstr(d) }
export const daysBetween = (a: string, b: string) => Math.round((parseD(b).getTime() - parseD(a).getTime()) / 86400000)
export const label = (s: string) => parseD(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
export const shortLabel = (s: string) => parseD(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/* ---------- storage ---------- */
export function readJSON<T>(k: string, fb: T): T { try { const r = localStorage.getItem(k); return r ? (JSON.parse(r) as T) : fb } catch { return fb } }
export function readDaily<T>(k: string, first: T, empty: T): T {
  const r = localStorage.getItem(k)
  if (!r) return first
  try { const o = JSON.parse(r); return o.d === todayStr() ? (o.v as T) : empty } catch { return first }
}
export const HISTORY_KEY = 'wa-history-v1'
export const SETTINGS_KEY = 'wa-settings-v1'
export const getStart = (): string => {
  const s = readJSON<{ start?: string }>(SETTINGS_KEY, {})
  if (s.start) return s.start
  const start = addDays(todayStr(), -11)
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ start }))
  return start
}
export const arcDay = (start: string) => Math.max(1, Math.min(90, daysBetween(start, todayStr()) + 1))

/* ---------- scoring ---------- */
export interface LogItem { id: string; title: string; pillar: Pillar; done: boolean; xp: number }
export function scoreOf(items: { pillar: Pillar; done: boolean }[]): number {
  let num = 0, den = 0
  ;(Object.keys(PILLARS) as Pillar[]).forEach((p) => {
    const l = items.filter((i) => i.pillar === p)
    if (!l.length) return
    den += PILLARS[p].weight; num += (PILLARS[p].weight * l.filter((i) => i.done).length) / l.length
  })
  return den ? Math.round((num / den) * 100) : 0
}
export const grade = (s: number) => (s >= 95 ? 'S' : s >= 80 ? 'A' : s >= 65 ? 'B' : s >= 50 ? 'C' : 'F')

/* ---------- chai ---------- */
export interface ChaiPref { kind: string; spoons: number; goal: number }
export const chaiCalc = (cups: number, spoons: number) => ({ sugarG: cups * spoons * 4, kcal: cups * (40 + spoons * 16) })

/* ---------- day log ---------- */
export interface DayLog {
  date: string; items: LogItem[]; score: number; xp: number
  water: number; chaiCups: number; chaiKind: string; kcal: number; protein: number; fat: number; sugar: number; meals: string[]
  steps: number; sleep: number; mood: number; energy: number; weight?: number; waist?: number
}
export type History = Record<string, DayLog>

const rnd = (i: number, j: number) => { const x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x) }

export function sampleWeights(): WeightEntry[] {
  const t = todayStr()
  const raw: [number, number, number][] = [[-11, 79.6, 91.5], [-8, 79.1, 91], [-5, 78.7, 90.6], [-3, 78.3, 90.2], [-1, 78.0, 90]]
  return raw.map(([o, kg, waist], i) => ({ id: 'w' + i, date: addDays(t, o), kg, waist }))
}

export function seedHistory(): History {
  const t = todayStr(), h: History = {}, ws = sampleWeights()
  for (let k = 11; k >= 1; k--) {
    const date = addDays(t, -k), p = 0.5 + rnd(k, 1) * 0.45
    const items: LogItem[] = HABITS.map((hb, j) => ({ id: hb.id, title: hb.title, pillar: hb.pillar, xp: hb.xp, done: rnd(k, j + 3) < p }))
    const meals = MEALS.filter((_, j) => rnd(k, j + 40) < p + 0.2)
    const food = (key: 'kcal' | 'protein' | 'fat' | 'sugar') => meals.reduce((a, m) => a + m[key], 0)
    const cups = 1 + Math.floor(rnd(k, 9) * 4)
    const c = chaiCalc(cups, 1)
    h[date] = {
      date, items, score: scoreOf(items), xp: items.filter((i) => i.done).reduce((a, i) => a + i.xp, 0),
      water: 3 + Math.floor(rnd(k, 5) * 6), chaiCups: cups, chaiKind: 'Chai', kcal: food('kcal') + c.kcal, protein: food('protein'), fat: food('fat'), sugar: food('sugar') + c.sugarG,
      meals: meals.map((m) => m.name), steps: 3000 + Math.floor(rnd(k, 6) * 7500), sleep: Math.round((5.5 + rnd(k, 7) * 3) * 2) / 2, mood: 2 + Math.floor(rnd(k, 8) * 4), energy: 2 + Math.floor(rnd(k, 10) * 4),
      weight: ws.find((w) => w.date === date)?.kg, waist: ws.find((w) => w.date === date)?.waist,
    }
  }
  return h
}

export function buildSnapshot(): DayLog {
  const t = todayStr()
  const habits = readJSON<Habit[]>('wa-habits-v1', HABITS)
  const done = readDaily<string[]>('wa-done-v3', [], [])
  const items: LogItem[] = habits.map((h) => ({ id: h.id, title: h.title, pillar: h.pillar, xp: h.xp, done: done.includes(h.id) }))
  const plan = readJSON<Meal[]>('wa-meals-plan-v1', MEALS)
  const eatenIds = readDaily<string[]>('wa-eaten-v2', [], [])
  const eaten = plan.filter((m) => eatenIds.includes(m.id))
  const cups = readDaily<number>('wa-chai-v2', 0, 0)
  const pref = readJSON<ChaiPref>('wa-chaipref-v1', { kind: 'Chai', spoons: 1, goal: 3 })
  const c = chaiCalc(cups, pref.spoons)
  const hd = readDaily<{ steps: number; sleep: number; mood: number; energy: number }>('wa-hday-v2', { steps: 0, sleep: 0, mood: 3, energy: 3 }, { steps: 0, sleep: 0, mood: 3, energy: 3 })
  const weights = readJSON<WeightEntry[]>('wa-weights-v2', [])
  const w = weights.find((x) => x.date === t)
  const sum = (k: 'kcal' | 'protein' | 'fat' | 'sugar') => eaten.reduce((a, m) => a + m[k], 0)
  return {
    date: t, items, score: scoreOf(items), xp: items.filter((i) => i.done).reduce((a, i) => a + i.xp, 0),
    water: readDaily<number>('wa-water-v2', 0, 0), chaiCups: cups, chaiKind: pref.kind, kcal: sum('kcal') + c.kcal, protein: sum('protein'), fat: sum('fat'), sugar: sum('sugar') + c.sugarG,
    meals: eaten.map((m) => m.name), steps: hd.steps, sleep: hd.sleep, mood: hd.mood, energy: hd.energy, weight: w?.kg, waist: w?.waist,
  }
}

export const readHistory = (): History => readJSON<History>(HISTORY_KEY, {})
export const saveSnapshot = () => { const h = readHistory(); const s = buildSnapshot(); h[s.date] = s; localStorage.setItem(HISTORY_KEY, JSON.stringify(h)) }

export function streakOf(h: History): { current: number; best: number } {
  const t = todayStr(); let cur = 0
  if (h[t] && h[t].score >= 70) cur++
  let d = addDays(t, -1)
  while (h[d] && h[d].score >= 70) { cur++; d = addDays(d, -1) }
  let best = 0, run = 0
  Object.keys(h).sort().forEach((k, i, arr) => {
    const ok = h[k].score >= 70
    const consecutive = i > 0 && daysBetween(arr[i - 1], k) === 1
    run = ok ? (consecutive && run > 0 ? run + 1 : 1) : 0
    best = Math.max(best, run)
  })
  return { current: cur, best: Math.max(best, cur) }
}

/** wipe everything and start day 1 today */
export function startFresh() {
  const keep = ['wa-learned', 'wa-roadmap-v2', 'wa-goals', 'wa-wl-v1', 'wa-hgoals-v1', 'wa-habits-v1', 'wa-meals-plan-v1', 'wa-chaipref-v1']
  Object.keys(localStorage).filter((k) => k.startsWith('wa-') && !keep.includes(k)).forEach((k) => localStorage.removeItem(k))
  const t = todayStr()
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ start: t }))
  localStorage.setItem(HISTORY_KEY, JSON.stringify({}))
  localStorage.setItem('wa-weights-v2', JSON.stringify([]))
  localStorage.setItem('wa-done-v3', JSON.stringify({ d: t, v: [] }))
  localStorage.setItem('wa-water-v2', JSON.stringify({ d: t, v: 0 }))
  localStorage.setItem('wa-chai-v2', JSON.stringify({ d: t, v: 0 }))
  localStorage.setItem('wa-eaten-v2', JSON.stringify({ d: t, v: [] }))
  localStorage.setItem('wa-hday-v2', JSON.stringify({ d: t, v: { steps: 0, sleep: 0, mood: 3, energy: 3 } }))
}
