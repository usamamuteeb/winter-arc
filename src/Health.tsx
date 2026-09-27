import { useState } from 'react'
import { motion } from 'framer-motion'
import { GYM_WEEK_BEFORE_TODAY, PILLARS, SLEEP_GOAL, STEP_GOAL, WEIGHTS } from './data'
import { Check, Ring, Sheet, buzz, useCount, useLocal } from './ui'

interface H { sleep: number; steps: number; mood: number; energy: number; weights: { d: string; kg: number }[] }
const EMO = ['😩', '😕', '😐', '🙂', '😄']
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function Trend({ pts }: { pts: number[] }) {
  if (pts.length < 2) return null
  const w = 300, h = 90, lo = Math.min(...pts) - 0.4, hi = Math.max(...pts) + 0.4
  const xy = pts.map((p, i) => [(i / (pts.length - 1)) * (w - 20) + 10, h - 12 - ((p - lo) / (hi - lo)) * (h - 24)] as const)
  const path = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="90">
      <motion.path d={path} fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
      {xy.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#0B1220" stroke="#FBBF24" strokeWidth="2" />)}
    </svg>
  )
}

export default function Health({ done, toggle, setOn }: { done: string[]; toggle: (id: string) => void; setOn: (id: string, on: boolean) => void }) {
  const [h, setH] = useLocal<H>('wa-health-v1', { sleep: 7, steps: 5400, mood: 4, energy: 3, weights: WEIGHTS })
  const [sheet, setSheet] = useState(false)
  const [kg, setKg] = useState('')
  const gym = done.includes('g1')
  const todayIdx = (new Date().getDay() + 6) % 7
  const week = DAYS.map((_, i) => (i < todayIdx ? (GYM_WEEK_BEFORE_TODAY[i] ?? false) : i === todayIdx ? gym : false))
  const gymCount = week.filter(Boolean).length
  const stepsShown = useCount(h.steps, 0.5)
  const setSteps = (n: number) => { const v = Math.max(0, n); setH({ ...h, steps: v }); setOn('h3', v >= STEP_GOAL) }
  const addWeight = () => {
    const v = parseFloat(kg); if (!v) return
    const d = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const rest = h.weights.filter((w) => w.d !== d)
    setH({ ...h, weights: [...rest, { d, kg: Math.round(v * 10) / 10 }].slice(-12) }); setKg(''); setSheet(false); buzz()
  }
  const last = h.weights[h.weights.length - 1], first = h.weights[0]
  const rows: { id: string; label: string; sub: string }[] = [
    { id: 'h1', label: 'Warm water + Vitamin D', sub: 'Morning' }, { id: 'h2', label: '15 min sunlight walk', sub: 'Before 4:30 PM in winter' }, { id: 'h4', label: 'Stretch 10 min', sub: 'Evening' },
  ]
  return (
    <div className="page">
      <div className="top"><div><div className="muted">Body & recovery</div><h1>Health</h1></div></div>

      <motion.button className={`card gymcard ${gym ? 'on' : ''}`} whileTap={{ scale: 0.98 }} onClick={() => { toggle('g1'); buzz() }}>
        <div className="row">
          <div><div className="muted small">GYM</div><div className="nx">{gym ? 'Done. Nice work.' : 'Did you go to the gym today?'}</div></div>
          <motion.div className="gbig" animate={{ scale: gym ? [1, 1.25, 1] : 1, rotate: gym ? [0, -10, 0] : 0 }}>{gym ? '✅' : '🏋️'}</motion.div>
        </div>
        <div className="wk">{DAYS.map((d, i) => (<div key={i} className={`dot ${week[i] ? 'y' : ''} ${i === todayIdx ? 't' : ''}`}><span>{week[i] ? '✓' : ''}</span><small>{d}</small></div>))}</div>
        <div className="muted small">{gymCount} gym days this week</div>
      </motion.button>

      <div className="grid2">
        <div className="card cen">
          <Ring size={110} stroke={10} pct={h.sleep / SLEEP_GOAL} color="#C4B5FD" glow><div className="big sm">{h.sleep}h</div><div className="muted small">sleep</div></Ring>
          <div className="btns c"><button className="ghost sm2" onClick={() => setH({ ...h, sleep: Math.max(0, h.sleep - 0.5) })}>−</button><button className="ghost sm2" onClick={() => setH({ ...h, sleep: Math.min(12, h.sleep + 0.5) })}>+</button></div>
          <div className="muted small">Goal {SLEEP_GOAL}h</div>
        </div>
        <div className="card cen">
          <Ring size={110} stroke={10} pct={h.steps / STEP_GOAL} color="#FBBF24" glow><div className="big sm" style={{ fontSize: 24 }}>{stepsShown.toLocaleString()}</div><div className="muted small">steps</div></Ring>
          <div className="btns c"><button className="ghost sm2" onClick={() => setSteps(h.steps - 1000)}>−1k</button><button className="ghost sm2" onClick={() => { setSteps(h.steps + 1000); buzz() }}>+1k</button></div>
          <div className="muted small">Goal {STEP_GOAL.toLocaleString()}</div>
        </div>
      </div>

      <h2>Daily health habits</h2>
      <div className="list">
        {rows.map((r) => (
          <motion.button key={r.id} className={`item ${done.includes(r.id) ? 'on' : ''}`} whileTap={{ scale: 0.97 }} onClick={() => { toggle(r.id); buzz() }}>
            <Check on={done.includes(r.id)} color={PILLARS.health.color} /><span className="tx"><span className="t">{r.label}</span><span className="muted small">{r.sub}</span></span>
          </motion.button>
        ))}
      </div>

      <div className="grid2">
        <div className="card"><div className="muted small">MOOD</div><div className="emo">{EMO.map((e, i) => <button key={i} className={h.mood === i + 1 ? 'act' : ''} onClick={() => { setH({ ...h, mood: i + 1 }); buzz() }}>{e}</button>)}</div></div>
        <div className="card"><div className="muted small">ENERGY</div><div className="emo">{EMO.map((e, i) => <button key={i} className={h.energy === i + 1 ? 'act' : ''} onClick={() => { setH({ ...h, energy: i + 1 }); buzz() }}>{e}</button>)}</div></div>
      </div>

      <div className="card">
        <div className="row"><div><div className="muted small">WEIGHT</div><div className="nx">{last.kg} kg <span className="small" style={{ color: last.kg <= first.kg ? '#34D399' : '#F87171' }}>{last.kg <= first.kg ? '▼' : '▲'} {Math.abs(Math.round((last.kg - first.kg) * 10) / 10)} kg</span></div></div><button className="ghost" onClick={() => setSheet(true)}>+ Log</button></div>
        <Trend pts={h.weights.map((w) => w.kg)} />
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Log weight">
        <input className="field" inputMode="decimal" placeholder="kg, e.g. 77.6" value={kg} onChange={(e) => setKg(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addWeight() }} />
        <button className="cta wide" onClick={addWeight}>Save</button>
      </Sheet>
    </div>
  )
}
