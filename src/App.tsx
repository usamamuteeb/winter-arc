import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ARC_DAY, ARC_TOTAL, DAY_SCORES, HABITS, LEVELS, PILLARS, PILLAR_AVG, START_DONE, STREAK, WEEK_SCORES, XP_TOTAL, type Pillar,
} from './data'
import Diet from './Diet'
import Focus from './Focus'
import Health from './Health'
import { LEARN_TOTAL } from './Learn'
import { Check, Confetti, Ring, Snow, buzz, useCount, useLocal } from './ui'
import './App.css'
import './v2.css'

type Tab = 'today' | 'health' | 'diet' | 'focus' | 'progress'
const grade = (s: number) => (s >= 95 ? 'S' : s >= 80 ? 'A' : s >= 65 ? 'B' : s >= 50 ? 'C' : 'F')

/* ---------- TODAY ---------- */
function Today({ done, toggle }: { done: string[]; toggle: (id: string) => void }) {
  const byPillar = (p: Pillar) => HABITS.filter((h) => h.pillar === p)
  const pillarPct = (p: Pillar) => { const l = byPillar(p); return l.length ? l.filter((h) => done.includes(h.id)).length / l.length : 0 }
  const score = Math.round((Object.keys(PILLARS) as Pillar[]).reduce((a, p) => a + PILLARS[p].weight * pillarPct(p), 0))
  const shown = useCount(score)
  const xpToday = HABITS.filter((h) => done.includes(h.id)).reduce((a, h) => a + h.xp, 0)
  const xp = XP_TOTAL + xpToday
  const lvl = Math.min(LEVELS.length - 1, Math.floor(xp / 500)), into = xp % 500
  const next = HABITS.find((h) => !done.includes(h.id))
  const [fire, setFire] = useState(0)
  const was100 = useRef(false)
  useEffect(() => { if (score >= 100 && !was100.current) setFire((f) => f + 1); was100.current = score >= 100 }, [score])
  const hr = new Date().getHours()
  const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <div className="page">
      <Confetti fire={fire} />
      <div className="top">
        <div><div className="muted">{greet}, Usama</div><h1>Day {ARC_DAY}<span className="muted"> / {ARC_TOTAL}</span></h1></div>
        <motion.div className="streak" animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <span className="flame">🔥</span><b>{STREAK}</b>
        </motion.div>
      </div>

      <div className="card hero">
        <Ring size={210} stroke={16} pct={score / 100} color={score >= 80 ? '#34D399' : score >= 50 ? '#7DD3FC' : '#F87171'} glow>
          <div className="big">{shown}</div><div className="muted">DAILY SCORE</div>
          <div className="grade">{grade(score)}</div>
        </Ring>
        <div className="pills">
          {(Object.keys(PILLARS) as Pillar[]).map((p) => (
            <div key={p} className="pill">
              <Ring size={54} stroke={6} pct={pillarPct(p)} color={PILLARS[p].color}><span style={{ fontSize: 18 }}>{PILLARS[p].icon}</span></Ring>
              <span>{PILLARS[p].label}</span>
            </div>
          ))}
        </div>
        <div className="xp">
          <div className="row"><span>Level {lvl + 1} · {LEVELS[lvl]}</span><span className="muted">{into} / 500 XP</span></div>
          <div className="bar"><motion.div className="fill" animate={{ width: `${(into / 500) * 100}%` }} transition={{ type: 'spring', stiffness: 60, damping: 14 }} /></div>
        </div>
      </div>

      {next && (
        <motion.div className="card next" key={next.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="muted small">NEXT UP · {next.time}</div>
          <div className="nx">{PILLARS[next.pillar].icon} {next.title}</div>
        </motion.div>
      )}

      <h2>Today's checklist</h2>
      <div className="list">
        {HABITS.map((h) => {
          const on = done.includes(h.id)
          return (
            <motion.button layout key={h.id} className={`item ${on ? 'on' : ''}`} onClick={() => { toggle(h.id); buzz() }} whileTap={{ scale: 0.97 }}>
              <Check on={on} color={PILLARS[h.pillar].color} />
              <span className="tx"><span className="t">{h.title}</span><span className="muted small">{PILLARS[h.pillar].label} · {h.time}</span></span>
              <span className="xpc">+{h.xp}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- PROGRESS ---------- */
function Radar() {
  const keys = Object.keys(PILLARS) as Pillar[], cx = 110, cy = 110, R = 84
  const pt = (i: number, v: number) => { const a = (Math.PI * 2 * i) / keys.length - Math.PI / 2; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v] as const }
  const poly = keys.map((k, i) => pt(i, PILLAR_AVG[k] / 100).join(',')).join(' ')
  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      {[0.33, 0.66, 1].map((r) => <polygon key={r} points={keys.map((_, i) => pt(i, r).join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,.1)" />)}
      <motion.polygon points={poly} fill="rgba(125,211,252,.25)" stroke="#7DD3FC" strokeWidth="2" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: '110px 110px' }} transition={{ type: 'spring', damping: 12 }} />
      {keys.map((k, i) => { const [x, y] = pt(i, 1.2); return <text key={k} x={x} y={y} fill="#9FB3C8" fontSize="11" textAnchor="middle" dominantBaseline="middle">{PILLARS[k].label}</text> })}
    </svg>
  )
}
function Progress() {
  const [learned] = useLocal<string[]>('wa-learned', [])
  const avg = Math.round(DAY_SCORES.filter((s): s is number => s !== null && s > 0).reduce((a, b) => a + b, 0) / (ARC_DAY - 1))
  const shades = (s: number | null) => (s === null ? 'rgba(255,255,255,.05)' : s === 0 ? 'rgba(248,113,113,.35)' : s >= 90 ? '#7DD3FC' : s >= 75 ? '#38BDF8' : s >= 60 ? '#0EA5E9aa' : '#0369A188')
  return (
    <div className="page">
      <div className="top"><div><div className="muted">{Math.round((ARC_DAY / ARC_TOTAL) * 100)}% of the arc done</div><h1>Progress</h1></div></div>
      <div className="stats">
        <div className="card st"><b>{avg}</b><small>Avg score</small></div>
        <div className="card st"><b>{STREAK}🔥</b><small>Best streak</small></div>
        <div className="card st"><b>{learned.length}/{LEARN_TOTAL}</b><small>Concepts learned</small></div>
      </div>
      <h2>90-day map</h2>
      <div className="card heat">
        {DAY_SCORES.map((s, i) => (
          <motion.i key={i} title={`Day ${i + 1}: ${s ?? '-'}`} style={{ background: shades(s), outline: i === ARC_DAY - 1 ? '2px solid #FBBF24' : 'none' }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.012 }} />
        ))}
      </div>
      <h2>Weekly score</h2>
      <div className="card bars">{WEEK_SCORES.map((v, i) => (
        <div key={i} className="col"><b className="small">{v}</b><motion.div className="b blue" initial={{ height: 0 }} animate={{ height: `${v}%` }} transition={{ delay: i * 0.08 }} /><small>W{i + 1}</small></div>
      ))}</div>
      <h2>Pillar balance</h2>
      <div className="card center"><Radar /></div>
      <h2>Boss weeks</h2>
      <div className="card boss">
        <div className="row"><span>⚔️ Boss 1 · Days 21–28</span><span className="muted">9 days away</span></div>
        <div className="muted small">Ship the PySpark mini-project to GitHub + hit 80+ every day.</div>
      </div>
    </div>
  )
}

/* ---------- APP ---------- */
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'today', icon: '🏠', label: 'Today' }, { id: 'health', icon: '❤️', label: 'Health' }, { id: 'diet', icon: '🥗', label: 'Diet' },
  { id: 'focus', icon: '🧠', label: 'Focus' }, { id: 'progress', icon: '📈', label: 'Progress' },
]
export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [done, setDone] = useLocal<string[]>('wa-done-v2', START_DONE)
  const toggle = (id: string) => setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id])
  const setOn = (id: string, on: boolean) => setDone(on ? (done.includes(id) ? done : [...done, id]) : done.filter((x) => x !== id))
  return (
    <div className="app">
      <div className="bg" /><Snow />
      <AnimatePresence mode="wait">
        <motion.main key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
          {tab === 'today' && <Today done={done} toggle={toggle} />}
          {tab === 'health' && <Health done={done} toggle={toggle} setOn={setOn} />}
          {tab === 'diet' && <Diet />}
          {tab === 'focus' && <Focus />}
          {tab === 'progress' && <Progress />}
        </motion.main>
      </AnimatePresence>
      <nav>
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'act' : ''} onClick={() => { setTab(t.id); buzz() }}>
            {tab === t.id && <motion.span layoutId="navglow" className="navglow" />}
            <span className="ic">{t.icon}</span><small>{t.label}</small>
          </button>
        ))}
      </nav>
    </div>
  )
}
