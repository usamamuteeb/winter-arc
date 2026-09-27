import { useState } from 'react'
import { motion } from 'framer-motion'
import { CHAI_DEFAULT, GOALS, HEALTH_GOALS } from './data'
import { addDays, readJSON, shortLabel, todayStr, type DayLog, type History } from './logic'
import { buzz } from './ui'
import './trends.css'

type Mode = 'max' | 'min'
interface Metric { id: string; label: string; unit: string; get: (l: DayLog) => number; goal: number; mode: Mode }

export default function Trends({ history, onPick }: { history: History; onPick: (d: string) => void }) {
  const [mid, setMid] = useState('sugar')
  const [days, setDays] = useState(14)
  const goals = readJSON('wa-goals', GOALS), hg = readJSON('wa-hgoals-v1', HEALTH_GOALS), pref = readJSON('wa-chaipref-v1', CHAI_DEFAULT)
  const metrics: Metric[] = [
    { id: 'sugar', label: 'Sugar', unit: 'g', get: (l) => l.sugar, goal: goals.sugar, mode: 'max' },
    { id: 'kcal', label: 'Calories', unit: 'kcal', get: (l) => l.kcal, goal: goals.kcal, mode: 'max' },
    { id: 'protein', label: 'Protein', unit: 'g', get: (l) => l.protein, goal: goals.protein, mode: 'min' },
    { id: 'fat', label: 'Fat', unit: 'g', get: (l) => l.fat, goal: goals.fat, mode: 'max' },
    { id: 'chai', label: 'Chai/coffee', unit: 'cups', get: (l) => l.chaiCups, goal: pref.goal, mode: 'max' },
    { id: 'water', label: 'Water', unit: 'glasses', get: (l) => l.water, goal: 8, mode: 'min' },
    { id: 'steps', label: 'Steps', unit: '', get: (l) => l.steps, goal: hg.steps, mode: 'min' },
    { id: 'sleep', label: 'Sleep', unit: 'h', get: (l) => l.sleep, goal: hg.sleep, mode: 'min' },
  ]
  const m = metrics.find((x) => x.id === mid) ?? metrics[0]
  const t = todayStr()
  const series = Array.from({ length: days }, (_, i) => {
    const d = addDays(t, i - days + 1)
    const l = history[d]
    return { d, l, v: l ? m.get(l) : null }
  })
  const nums = series.map((s) => s.v).filter((v): v is number => v !== null)
  const scale = Math.max(m.goal * 1.35, ...nums, 1)
  const avg = nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0
  const bad = (v: number) => (m.mode === 'max' ? v > m.goal : v < m.goal * 0.6)
  const good = (v: number) => (m.mode === 'max' ? v <= m.goal * 0.75 : v >= m.goal)
  const col = (v: number) => (bad(v) ? '#F87171' : good(v) ? '#34D399' : '#FBBF24')
  const hit = nums.filter((v) => (m.mode === 'max' ? v <= m.goal : v >= m.goal)).length
  const fmt = (n: number) => (m.id === 'steps' ? n.toLocaleString() : String(n))
  const u = m.unit && m.id !== 'steps' ? ` ${m.unit}` : ''

  return (
    <div className="card trends">
      <div className="tchips">{metrics.map((x) => <button key={x.id} className={mid === x.id ? 'act' : ''} onClick={() => { setMid(x.id); buzz() }}>{x.label}</button>)}</div>
      <div className="tstats">
        <div><b>{fmt(avg)}{u}</b><small>daily average</small></div>
        <div><b>{fmt(m.goal)}{u}</b><small>{m.mode === 'max' ? 'daily limit' : 'daily goal'}</small></div>
        <div><b style={{ color: '#34D399' }}>{hit}/{nums.length}</b><small>{m.mode === 'max' ? 'days within limit' : 'days goal met'}</small></div>
      </div>
      <div className="tplot">
        <div className="tgw"><div className="tgoal" style={{ bottom: `${(m.goal / scale) * 100}%` }}><span>{m.mode === 'max' ? 'limit' : 'goal'} {fmt(m.goal)}</span></div></div>
        <div className="tbars">
          {series.map((s, i) => (
            <button key={s.d} className="tcol" onClick={() => { if (s.l) { onPick(s.d); buzz() } }} disabled={!s.l} title={`${shortLabel(s.d)}: ${s.v ?? 'no data'}`}>
              <div className="tval">{s.v !== null && days <= 14 ? fmt(s.v) : ''}</div>
              <div className="tarea">
                <motion.div className="tbar" style={{ background: s.v === null ? 'rgba(255,255,255,.08)' : col(s.v) }} initial={{ height: 0 }} animate={{ height: s.v === null ? 3 : `${Math.max(2, (s.v / scale) * 100)}%` }} transition={{ delay: i * 0.02, type: 'spring', stiffness: 120, damping: 16 }} />
              </div>
              <small>{days <= 14 || i % 5 === 0 || s.d === t ? Number(s.d.slice(8)) : ''}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="tchips r">{[7, 14, 30].map((n) => <button key={n} className={days === n ? 'act' : ''} onClick={() => { setDays(n); buzz() }}>{n} days</button>)}</div>
      <div className="muted small ctr2">Tap a bar to open that day. Grey bars mean nothing was recorded.</div>
    </div>
  )
}
