import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ARC_TOTAL, HABITS, LEVELS, PILLARS, type Habit, type Pillar } from './data'
import Diet from './Diet'
import Focus from './Focus'
import Health from './Health'
import Routine from './Routine'
import { LEARN_TOTAL } from './Learn'
import Trends from './Trends'
import {
  HISTORY_KEY, addDays, arcDay, getStart, grade, label, readHistory, saveSnapshot, scoreOf, getName, getSettings, saveSettings, startFresh, streakOf, toCSV, todayStr, type DayLog, type History,
} from './logic'
import { Check, Confetti, Ring, Sheet, Snow, buzz, useCount, useDaily, useLocal } from './ui'
import './App.css'
import './v2.css'
import './v3.css'
import './history.css'

type Tab = 'today' | 'health' | 'diet' | 'focus' | 'routine' | 'progress'

const scoreColor = (s: number) => (s >= 80 ? '#34D399' : s >= 50 ? '#7DD3FC' : '#F87171')

/* ---------- TODAY ---------- */
function Today({ habits, done, toggle, history }: { habits: Habit[]; done: string[]; toggle: (id: string) => void; history: History }) {
  const items = habits.map((h) => ({ ...h, done: done.includes(h.id) }))
  const pillarPct = (p: Pillar) => { const l = items.filter((i) => i.pillar === p); return l.length ? l.filter((i) => i.done).length / l.length : 0 }
  const score = scoreOf(items)
  const shown = useCount(score)
  const t = todayStr()
  const xpToday = items.filter((i) => i.done).reduce((a, i) => a + i.xp, 0)
  const xp = Object.values(history).filter((d) => d.date !== t).reduce((a, d) => a + d.xp, 0) + xpToday
  const lvl = Math.min(LEVELS.length - 1, Math.floor(xp / 500)), into = xp % 500
  const next = items.find((i) => !i.done)
  const start = getStart(), day = arcDay(start)
  const streak = streakOf({ ...history, [t]: { ...(history[t] ?? ({} as DayLog)), score } as DayLog }).current
  const [fire, setFire] = useState(0)
  const [was100, setWas100] = useState(false)
  useEffect(() => { if (score >= 100 && !was100) setFire((f) => f + 1); setWas100(score >= 100) }, [score]) // eslint-disable-line react-hooks/exhaustive-deps
  const hr = new Date().getHours()
  const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <div className="page">
      <Confetti fire={fire} />
      <div className="top">
        <div><div className="muted">{greet}, {getName()}</div><h1>Day {day}<span className="muted"> / {ARC_TOTAL}</span></h1></div>
        <motion.div className="streak" animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <span className="flame">🔥</span><b>{streak}</b>
        </motion.div>
      </div>

      <div className="card hero">
        <Ring size={210} stroke={16} pct={score / 100} color={scoreColor(score)} glow>
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
        {items.map((h) => (
          <motion.button layout key={h.id} className={`item ${h.done ? 'on' : ''}`} onClick={() => { toggle(h.id); buzz() }} whileTap={{ scale: 0.97 }}>
            <Check on={h.done} color={PILLARS[h.pillar].color} />
            <span className="tx"><span className="t">{h.title}</span><span className="muted small">{PILLARS[h.pillar].label} · {h.time}</span></span>
            <span className="xpc">+{h.xp}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ---------- PROGRESS ---------- */
function Radar({ vals }: { vals: Record<Pillar, number> }) {
  const keys = Object.keys(PILLARS) as Pillar[], cx = 110, cy = 110, R = 84
  const pt = (i: number, v: number) => { const a = (Math.PI * 2 * i) / keys.length - Math.PI / 2; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v] as const }
  const poly = keys.map((k, i) => pt(i, Math.max(0.04, vals[k] / 100)).join(',')).join(' ')
  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      {[0.33, 0.66, 1].map((r) => <polygon key={r} points={keys.map((_, i) => pt(i, r).join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,.1)" />)}
      <motion.polygon points={poly} fill="rgba(125,211,252,.25)" stroke="#7DD3FC" strokeWidth="2" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: '110px 110px' }} transition={{ type: 'spring', damping: 12 }} />
      {keys.map((k, i) => { const [x, y] = pt(i, 1.2); return <text key={k} x={x} y={y} fill="#9FB3C8" fontSize="11" textAnchor="middle" dominantBaseline="middle">{PILLARS[k].label}</text> })}
    </svg>
  )
}

function DayDetail({ log, date }: { log?: DayLog; date: string }) {
  if (!log) return <div className="muted" style={{ padding: '10px 0 18px' }}>Nothing was recorded on {label(date)}. Open the app daily so each day is saved.</div>
  const missed = log.items.filter((i) => !i.done), doneItems = log.items.filter((i) => i.done)
  const pil = (Object.keys(PILLARS) as Pillar[]).map((p) => { const l = log.items.filter((i) => i.pillar === p); return { p, n: l.filter((i) => i.done).length, t: l.length } }).filter((x) => x.t > 0)
  const stat = (k: string, v: string | number, warn?: boolean) => <div key={k} className="dstat"><b style={warn ? { color: '#F87171' } : undefined}>{v}</b><small>{k}</small></div>
  return (
    <div className="daydetail">
      <div className="dhead">
        <Ring size={78} stroke={8} pct={log.score / 100} color={scoreColor(log.score)}><b style={{ fontSize: 22 }}>{log.score}</b></Ring>
        <div><div className="nx">Grade {grade(log.score)}</div><div className="muted small">{doneItems.length} done · {missed.length} missed · +{log.xp} XP</div></div>
      </div>
      <div className="dpil">{pil.map((x) => (
        <div key={x.p} className="dp"><span>{PILLARS[x.p].icon} {PILLARS[x.p].label}</span><div className="bar"><div className="fill" style={{ width: `${(x.n / x.t) * 100}%`, background: PILLARS[x.p].color, boxShadow: 'none' }} /></div><small>{x.n}/{x.t}</small></div>
      ))}</div>
      <div className="dstats">
        {stat('Calories', log.kcal)}{stat('Protein', `${log.protein}g`)}{stat('Fat', `${log.fat}g`)}{stat('Sugar', `${log.sugar}g`, log.sugar > 40)}
        {stat('Water', `${log.water} gl`)}{stat(log.chaiKind || 'Chai', `${log.chaiCups} cups`)}{stat('Steps', log.steps.toLocaleString())}{stat('Sleep', `${log.sleep}h`)}
        {log.weight ? stat('Weight', `${log.weight} kg`) : null}{log.waist ? stat('Waist', `${log.waist} cm`) : null}
      </div>
      {log.meals.length > 0 && <div className="dmeals"><small>MEALS EATEN</small>{log.meals.map((m) => <div key={m}>• {m}</div>)}</div>}
      {missed.length > 0 && <div className="dlist"><h4 className="bad">Missed ({missed.length})</h4>{missed.map((i) => <div key={i.id} className="dl bad"><span>✗</span>{i.title}<small>{PILLARS[i.pillar].label}</small></div>)}</div>}
      {doneItems.length > 0 && <div className="dlist"><h4 className="good">Done ({doneItems.length})</h4>{doneItems.map((i) => <div key={i.id} className="dl good"><span>✓</span>{i.title}<small>{PILLARS[i.pillar].label}</small></div>)}</div>}
    </div>
  )
}

function Progress({ history }: { history: History }) {
  const [learned] = useLocal<string[]>('wa-learned', [])
  const [pick, setPick] = useState<string | null>(null)
  const [settings, setSettings] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [startVal, setStartVal] = useState(getStart())
  const [nameVal, setNameVal] = useState(getName())
  const start = getStart(), t = todayStr()
  const prayerLabels = { fajr: 'Fajr', zohar: 'Zohar', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' }
  const todaysPrayers = (() => {
    try {
      const stored = localStorage.getItem('wa-prayers-v1')
      if (!stored) return {}
      const data = JSON.parse(stored)
      return (data.d === t ? data.v : {}) as Record<string, boolean>
    } catch { return {} }
  })()
  const logs = Object.values(history).sort((a, b) => a.date.localeCompare(b.date))
  const avg = logs.length ? Math.round(logs.reduce((a, l) => a + l.score, 0) / logs.length) : 0
  const { current, best } = streakOf(history)
  const cellColor = (s: number | null) => (s === null ? 'rgba(255,255,255,.05)' : s >= 90 ? '#7DD3FC' : s >= 75 ? '#38BDF8' : s >= 60 ? '#0EA5E9aa' : s >= 40 ? '#0369A1aa' : 'rgba(248,113,113,.45)')
  const weeks = Array.from({ length: 13 }, (_, w) => {
    const l = logs.filter((x) => x.date >= addDays(start, w * 7) && x.date <= addDays(start, w * 7 + 6))
    return l.length ? Math.round(l.reduce((a, x) => a + x.score, 0) / l.length) : null
  })
  const shownWeeks = weeks.slice(0, Math.max(1, Math.floor((arcDay(start) - 1) / 7) + 1))
  const pillarAvg = useMemo(() => {
    const out = {} as Record<Pillar, number>
    ;(Object.keys(PILLARS) as Pillar[]).forEach((p) => {
      const vals = logs.map((l) => { const it = l.items.filter((i) => i.pillar === p); return it.length ? it.filter((i) => i.done).length / it.length : null }).filter((v): v is number => v !== null)
      out[p] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) : 0
    })
    return out
  }, [history]) // eslint-disable-line react-hooks/exhaustive-deps
  const missedMap = useMemo(() => {
    const m: Record<string, { n: number; total: number; pillar: Pillar }> = {}
    logs.filter((l) => l.date !== t).forEach((l) => l.items.forEach((i) => { const e = (m[i.title] ??= { n: 0, total: 0, pillar: i.pillar }); e.total++; if (!i.done) e.n++ }))
    return Object.entries(m).filter(([, v]) => v.n > 0).sort((a, b) => b[1].n - a[1].n).slice(0, 6)
  }, [history]) // eslint-disable-line react-hooks/exhaustive-deps
  const recent = [...logs].reverse().slice(0, 14)

  const exportData = () => {
    const data: Record<string, string> = {}
    Object.keys(localStorage).filter((k) => k.startsWith('wa-')).forEach((k) => { data[k] = localStorage.getItem(k) ?? '' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })); a.download = `winter-arc-backup-${t}.json`; a.click()
  }
  const exportCSV = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCSV(history)], { type: 'text/csv' })); a.download = `winter-arc-daily-log-${t}.csv`; a.click()
  }
  const importData = (f: File | undefined) => {
    if (!f) return
    const r = new FileReader()
    r.onload = () => { try { const d = JSON.parse(String(r.result)); Object.entries(d).forEach(([k, v]) => { if (k.startsWith('wa-')) localStorage.setItem(k, String(v)) }); location.reload() } catch { alert('That file is not a Winter Arc backup.') } }
    r.readAsText(f)
  }

  return (
    <div className="page">
      <div className="top"><div><div className="muted">Day {arcDay(start)} of {ARC_TOTAL}</div><h1>Progress</h1></div><button className="ghost gear" onClick={() => { setStartVal(getStart()); setNameVal(getSettings().name ?? 'Usama'); setConfirm(false); setSettings(true) }}>⚙️</button></div>
      <div className="stats">
        <div className="card st"><b>{avg}</b><small>Avg score</small></div>
        <div className="card st"><b>{current}🔥</b><small>Streak · best {best}</small></div>
        <div className="card st"><b>{learned.length}/{LEARN_TOTAL}</b><small>Concepts learned</small></div>
      </div>

      <h2>90-day map <span className="muted small" style={{ textTransform: 'none' }}>· tap a day</span></h2>
      <div className="card heat">
        {Array.from({ length: ARC_TOTAL }, (_, i) => {
          const d = addDays(start, i), l = history[d], future = d > t
          return (
            <motion.button key={d} className={`hc ${d === t ? 'today' : ''}`} title={label(d)} style={{ background: cellColor(future ? null : l ? l.score : null), opacity: future ? 0.5 : 1 }}
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: future ? 0.5 : 1, scale: 1 }} transition={{ delay: i * 0.008 }} onClick={() => { if (!future) { setPick(d); buzz() } }} />
          )
        })}
      </div>

      <h2>Recent days</h2>
      <div className="list">
        {recent.length === 0 && <div className="card muted center">Your days will show up here as you use the app.</div>}
        {recent.map((l) => {
          const m = l.items.filter((i) => !i.done).length
          return (
            <motion.button key={l.date} className="item dayrow" whileTap={{ scale: 0.97 }} onClick={() => { setPick(l.date); buzz() }}>
              <Ring size={44} stroke={5} pct={l.score / 100} color={scoreColor(l.score)}><b style={{ fontSize: 13 }}>{l.score}</b></Ring>
              <span className="tx"><span className="t">{l.date === t ? 'Today' : label(l.date)}</span><span className="muted small">{l.items.length - m} done · {m} missed</span></span>
              <span className="gbadge" style={{ color: scoreColor(l.score) }}>{grade(l.score)}</span>
            </motion.button>
          )
        })}
      </div>

      <h2>Intake trends</h2>
      <Trends history={history} onPick={setPick} />

      {missedMap.length > 0 && (
        <>
          <h2>What you miss most</h2>
          <div className="card">
            {missedMap.map(([title, v]) => (
              <div key={title} className="mm2">
                <div className="row"><span className="small">{PILLARS[v.pillar].icon} {title}</span><b className="small" style={{ color: '#F87171' }}>{v.n} of {v.total}</b></div>
                <div className="bar"><motion.div className="fill red" initial={{ width: 0 }} animate={{ width: `${(v.n / v.total) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Weekly score</h2>
      <div className="card bars">{shownWeeks.map((v, i) => (
        <div key={i} className="col"><b className="small">{v ?? '–'}</b><motion.div className="b blue" initial={{ height: 0 }} animate={{ height: `${v ?? 0}%` }} transition={{ delay: i * 0.08 }} /><small>W{i + 1}</small></div>
      ))}</div>
      <h2>Pillar balance</h2>
      <div className="card center"><Radar vals={pillarAvg} /></div>

      <h2>Daily Routines & Prayers</h2>
      <div className="card routine-progress">
        <div className="routine-section">
          <div className="routine-header">🕌 Five Daily Prayers</div>
          <div className="prayers-list">
            {Object.entries(prayerLabels).map(([id, name]) => (
              <div key={id} className="prayer-stat">
                <span className="prayer-name">{name}</span>
                <span className={`prayer-status ${todaysPrayers[id] ? 'done' : 'pending'}`}>
                  {todaysPrayers[id] ? '✓' : '◯'}
                </span>
              </div>
            ))}
          </div>
          <div className="progress-summary">
            {Object.values(todaysPrayers).filter(Boolean).length}/{Object.entries(prayerLabels).length} done today
          </div>
        </div>
      </div>

      <Sheet open={!!pick} onClose={() => setPick(null)} title={pick ? (pick === t ? `Today · ${label(pick)}` : label(pick)) : ''}>
        {pick && <DayDetail log={history[pick]} date={pick} />}
      </Sheet>

      <Sheet open={settings} onClose={() => setSettings(false)} title="Settings">
        <label className="lbl">Your name<input className="field" value={nameVal} maxLength={24} onChange={(e) => setNameVal(e.target.value)} /></label>
        <button className="cta wide" onClick={() => { saveSettings({ name: nameVal.trim() || 'Usama' }); location.reload() }}>Save name</button>
        <div className="sep" />
        <label className="lbl">Arc start date (Day 1)<input className="field" type="date" max={t} value={startVal} onChange={(e) => setStartVal(e.target.value)} /></label>
        <button className="cta wide" onClick={() => { if (startVal) { saveSettings({ start: startVal }); location.reload() } }}>Save start date</button>
        <div className="sep" />
        <div className="muted small" style={{ marginBottom: 8 }}>Your daily logs are stored only on this device. Export a backup regularly; the CSV opens in Excel or Google Sheets.</div>
        <div className="btns" style={{ marginBottom: 8 }}><button className="ghost grow" onClick={exportCSV}>Export daily log (CSV)</button></div>
        <div className="btns"><button className="ghost grow" onClick={exportData}>Export backup</button><label className="ghost grow filebtn">Import backup<input type="file" accept="application/json" onChange={(e) => importData(e.target.files?.[0])} /></label></div>
        <div className="sep" />
        <div className="muted small" style={{ marginBottom: 8 }}>Removes the sample days and starts Day 1 today. Your habits, meals, roadmap and learning progress are kept.</div>
        <button className={`ghost wide danger ${confirm ? 'armed' : ''}`} onClick={() => { if (!confirm) { setConfirm(true); return } startFresh(); location.reload() }}>{confirm ? 'Tap again to confirm: start fresh' : 'Clear sample data and start fresh'}</button>
      </Sheet>
    </div>
  )
}

/* ---------- APP ---------- */
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'today', icon: '🏠', label: 'Today' }, { id: 'health', icon: '❤️', label: 'Health' }, { id: 'diet', icon: '🥗', label: 'Diet' },
  { id: 'focus', icon: '🧠', label: 'Focus' }, { id: 'routine', icon: '⏰', label: 'Routine' }, { id: 'progress', icon: '📈', label: 'Progress' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [habits, setHabits] = useLocal<Habit[]>('wa-habits-v1', HABITS)
  const [done, setDone] = useDaily<string[]>('wa-done-v3', [], [])
  const [history, setHistory] = useState<History>(() => {
    if (!localStorage.getItem(HISTORY_KEY)) localStorage.setItem(HISTORY_KEY, JSON.stringify({}))
    getStart()
    return readHistory()
  })
  const toggle = (id: string) => setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id])
  const setOn = (id: string, on: boolean) => setDone(on ? (done.includes(id) ? done : [...done, id]) : done.filter((x) => x !== id))

  // record today's log whenever anything changes
  useEffect(() => {
    let timer: number
    const rec = () => { window.clearTimeout(timer); timer = window.setTimeout(() => { saveSnapshot(); setHistory(readHistory()) }, 300) }
    window.addEventListener('wa-change', rec); rec()
    // new day while the app is open: reload so daily values reset
    let day = todayStr()
    const vis = () => { if (document.visibilityState === 'visible' && todayStr() !== day) { day = todayStr(); location.reload() } }
    document.addEventListener('visibilitychange', vis)
    return () => { window.removeEventListener('wa-change', rec); document.removeEventListener('visibilitychange', vis); window.clearTimeout(timer) }
  }, [])

  return (
    <div className="app">
      <div className="bg" /><Snow />
      <AnimatePresence mode="wait">
        <motion.main key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
          {tab === 'today' && <Today habits={habits} done={done} toggle={toggle} history={history} />}
          {tab === 'health' && <Health done={done} toggle={toggle} setOn={setOn} habits={habits} setHabits={setHabits} history={history} />}
          {tab === 'diet' && <Diet />}
          {tab === 'focus' && <Focus />}
          {tab === 'routine' && <Routine />}
          {tab === 'progress' && <Progress history={history} />}
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
