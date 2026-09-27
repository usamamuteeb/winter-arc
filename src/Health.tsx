import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HEALTH_GOALS, WL_DEFAULT, type Habit, type WeightEntry } from './data'
import { addDays, dstr, label, parseD, sampleWeights, shortLabel, todayStr, type History } from './logic'
import { Check, Ring, Sheet, SwipeRow, buzz, uid, useCount, useDaily, useLocal } from './ui'

const EMO = ['😩', '😕', '😐', '🙂', '😄']
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const ACT = [{ v: 1.2, l: 'Desk job' }, { v: 1.375, l: 'Light' }, { v: 1.55, l: 'Moderate' }, { v: 1.725, l: 'Very active' }]
const r1 = (n: number) => Math.round(n * 10) / 10

function Trend({ pts, target }: { pts: number[]; target: number }) {
  if (pts.length < 2) return <div className="muted small ctr" style={{ padding: 14 }}>Log 2 or more weights to see your trend.</div>
  const w = 300, h = 110, all = [...pts, target], lo = Math.min(...all) - 0.6, hi = Math.max(...all) + 0.6
  const y = (v: number) => h - 14 - ((v - lo) / (hi - lo)) * (h - 28)
  const xy = pts.map((p, i) => [(i / (pts.length - 1)) * (w - 24) + 12, y(p)] as const)
  const path = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="110">
      <line x1="0" x2={w} y1={y(target)} y2={y(target)} stroke="#34D399" strokeWidth="1.5" strokeDasharray="5 5" />
      <text x={w - 4} y={y(target) - 5} fill="#34D399" fontSize="10" textAnchor="end">goal {target} kg</text>
      <motion.path d={path} fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
      {xy.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#0B1220" stroke="#FBBF24" strokeWidth="2" />)}
    </svg>
  )
}

interface WDraft { id?: string; date: string; kg: string; waist: string }
interface GDraft { target: string; rate: number; height: string; age: string; sex: string; activity: number }
interface HDraft { id?: string; title: string; time: string }

export default function Health({ done, toggle, setOn, habits, setHabits, history }: {
  done: string[]; toggle: (id: string) => void; setOn: (id: string, on: boolean) => void
  habits: Habit[]; setHabits: (h: Habit[]) => void; history: History
}) {
  const [hd, setHd] = useDaily('wa-hday-v2', { steps: 5400, sleep: 7, mood: 4, energy: 3 }, { steps: 0, sleep: 0, mood: 3, energy: 3 })
  const [hg, setHg] = useLocal('wa-hgoals-v1', HEALTH_GOALS)
  const [weights, setWeights] = useLocal<WeightEntry[]>('wa-weights-v2', sampleWeights())
  const [wl, setWl] = useLocal('wa-wl-v1', WL_DEFAULT)
  const [wd, setWd] = useState<WDraft | null>(null)
  const [gd, setGd] = useState<GDraft | null>(null)
  const [hb, setHb] = useState<HDraft | null>(null)
  const [tg, setTg] = useState<{ sleep: string; steps: string } | null>(null)
  const skip = useRef(false)

  const gym = done.includes('g1')
  const stepsShown = useCount(hd.steps, 0.5)
  const setSteps = (n: number) => { const v = Math.max(0, n); setHd({ ...hd, steps: v }); setOn('h3', v >= hg.steps) }

  /* ----- gym week (Mon..Sun) from history ----- */
  const today = todayStr()
  const idx = (new Date().getDay() + 6) % 7
  const monday = addDays(today, -idx)
  const week = DAYS.map((_, i) => {
    const d = addDays(monday, i)
    if (d === today) return gym
    if (d < today) return !!history[d]?.items.find((x) => x.id === 'g1')?.done
    return false
  })

  /* ----- weight loss math ----- */
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date))
  const last = sorted[sorted.length - 1], first = sorted[0]
  const target = wl.target
  const startKg = first?.kg ?? 0
  const pct = last && startKg > target ? Math.max(0, Math.min(1, (startKg - last.kg) / (startKg - target))) : 0
  const toGo = last ? Math.max(0, r1(last.kg - target)) : 0
  const weekAgo = last ? [...sorted].reverse().find((e) => e.date <= addDays(last.date, -7)) ?? first : undefined
  const weekChange = last && weekAgo && weekAgo.id !== last.id ? r1(last.kg - weekAgo.kg) : 0
  const pace = last && first && last.id !== first.id ? r1(((first.kg - last.kg) / Math.max(1, (parseD(last.date).getTime() - parseD(first.date).getTime()) / 86400000)) * 7) : 0
  const etaDate = last && last.kg > target ? label(addDays(today, Math.round(((last.kg - target) / wl.rate) * 7))) : null
  const bmi = last ? r1(last.kg / Math.pow(wl.height / 100, 2)) : 0
  const bmiCat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese'

  const calc = (g: GDraft) => {
    const kg = last?.kg ?? 75, h = parseFloat(g.height) || wl.height, a = parseFloat(g.age) || wl.age
    const bmr = 10 * kg + 6.25 * h - 5 * a + (g.sex === 'm' ? 5 : -161)
    const tdee = bmr * g.activity, kcal = Math.max(1400, Math.round((tdee - g.rate * 1100) / 10) * 10)
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein: Math.round(kg * 1.8) }
  }

  const openWeight = (e?: WeightEntry) => setWd(e ? { id: e.id, date: e.date, kg: String(e.kg), waist: e.waist ? String(e.waist) : '' } : { date: today, kg: last ? String(last.kg) : '', waist: '' })
  const saveWeight = () => {
    if (!wd) return
    const kg = parseFloat(wd.kg); if (!kg || kg < 20 || kg > 400) return
    const e: WeightEntry = { id: wd.id ?? uid(), date: wd.date || today, kg: r1(kg), waist: parseFloat(wd.waist) || undefined }
    const rest = weights.filter((x) => x.id !== e.id && x.date !== e.date)
    setWeights([...rest, e]); if (e.date === today) setOn('h5', true)
    setWd(null); buzz()
  }
  const delWeight = (id: string) => { setWeights(weights.filter((x) => x.id !== id)); setWd(null) }

  const openGoal = () => setGd({ target: String(wl.target), rate: wl.rate, height: String(wl.height), age: String(wl.age), sex: wl.sex, activity: wl.activity })
  const saveGoal = (useDiet: boolean) => {
    if (!gd) return
    const t = parseFloat(gd.target) || wl.target
    setWl({ target: t, rate: gd.rate, height: parseFloat(gd.height) || wl.height, age: parseFloat(gd.age) || wl.age, sex: gd.sex, activity: gd.activity })
    if (useDiet) {
      const c = calc(gd), old = JSON.parse(localStorage.getItem('wa-goals') || '{"sugar":40}')
      localStorage.setItem('wa-goals', JSON.stringify({ ...old, kcal: c.kcal, protein: c.protein, fat: Math.round((c.kcal * 0.27) / 9) }))
    }
    setGd(null); buzz()
  }

  /* ----- health habits (editable) ----- */
  const hHabits = habits.filter((h) => h.pillar === 'health' && h.id !== 'h3')
  const saveHabit = () => {
    if (!hb || !hb.title.trim()) return
    if (hb.id) setHabits(habits.map((h) => (h.id === hb.id ? { ...h, title: hb.title.trim(), time: hb.time || h.time } : h)))
    else setHabits([...habits, { id: 'c' + uid(), pillar: 'health', title: hb.title.trim(), time: hb.time || 'All day', xp: 10 }])
    setHb(null); buzz()
  }
  const delHabit = (id: string) => { setHabits(habits.filter((h) => h.id !== id)); setHb(null) }

  const list = [...sorted].reverse()
  return (
    <div className="page">
      <div className="top"><div><div className="muted">Body & recovery</div><h1>Health</h1></div></div>

      <motion.button className={`card gymcard ${gym ? 'on' : ''}`} whileTap={{ scale: 0.98 }} onClick={() => { toggle('g1'); buzz() }}>
        <div className="row">
          <div><div className="muted small">GYM</div><div className="nx">{gym ? 'Done. Nice work.' : 'Did you go to the gym today?'}</div></div>
          <motion.div className="gbig" animate={{ scale: gym ? [1, 1.25, 1] : 1, rotate: gym ? [0, -10, 0] : 0 }}>{gym ? '✅' : '🏋️'}</motion.div>
        </div>
        <div className="wk">{DAYS.map((d, i) => (<div key={i} className={`dot ${week[i] ? 'y' : ''} ${i === idx ? 't' : ''}`}><span>{week[i] ? '✓' : ''}</span><small>{d}</small></div>))}</div>
        <div className="muted small">{week.filter(Boolean).length} gym days this week</div>
      </motion.button>

      {/* ---------- weight loss ---------- */}
      <div className="card wlcard">
        <div className="row"><div><div className="muted small">WEIGHT LOSS GOAL</div><div className="nx">{last ? `${last.kg} kg` : 'No weight yet'} <span className="muted small">→ {target} kg</span></div></div>
          <button className="ghost sm2" onClick={openGoal}>Edit goal</button></div>
        {last ? (
          <>
            <div className="wlrow">
              <Ring size={112} stroke={11} pct={pct} color="#34D399" glow><div className="big sm" style={{ fontSize: 24 }}>{Math.round(pct * 100)}%</div><div className="muted small">to goal</div></Ring>
              <div className="wlstats">
                <div><b>{toGo} kg</b><small>left to lose</small></div>
                <div><b style={{ color: weekChange <= 0 ? '#34D399' : '#F87171' }}>{weekChange > 0 ? '+' : ''}{weekChange} kg</b><small>last 7 days</small></div>
                <div><b>{pace} kg</b><small>your pace / week</small></div>
                <div><b>{wl.rate} kg</b><small>goal pace / week</small></div>
              </div>
            </div>
            <div className="chips"><span>BMI {bmi} · {bmiCat}</span>{etaDate && <span className="p">Goal date ≈ {etaDate}</span>}{!etaDate && <span className="p">Goal reached 🎉</span>}</div>
          </>
        ) : <div className="muted small">Tap Log weight below to record your starting weight.</div>}
      </div>

      <div className="card">
        <div className="row"><b>Weight log</b><button className="cta sm" onClick={() => openWeight()}>+ Log weight</button></div>
        <Trend pts={sorted.map((w) => w.kg)} target={target} />
      </div>
      <div className="list">
        <AnimatePresence initial={false}>
          {list.slice(0, 12).map((e, i) => {
            const prev = list[i + 1], dlt = prev ? r1(e.kg - prev.kg) : 0
            return (
              <SwipeRow key={e.id} className="item" onDelete={() => delWeight(e.id)}>
                <div className="tx"><span className="t">{label(e.date)}</span><span className="muted small">{e.waist ? `Waist ${e.waist} cm` : 'No waist logged'}</span></div>
                <div className="wv"><b>{e.kg} kg</b>{prev && <small style={{ color: dlt <= 0 ? '#34D399' : '#F87171' }}>{dlt <= 0 ? '▼' : '▲'} {Math.abs(dlt)}</small>}</div>
                <button className="edit" onClick={() => openWeight(e)}>Edit</button>
              </SwipeRow>
            )
          })}
        </AnimatePresence>
      </div>
      <div className="muted small hint">Swipe a weight entry left to delete it.</div>

      <div className="card tips">
        <div className="muted small">FAT-LOSS RULES</div>
        <ul>
          <li>Eat in a small calorie deficit (see suggested target in Edit goal).</li>
          <li>Protein at every meal, about 1.8 g per kg body weight.</li>
          <li>Sugary chai and drinks are the easiest calories to cut.</li>
          <li>8,000+ steps daily and 7+ hours of sleep.</li>
          <li>Weigh in every morning after waking, judge the weekly trend.</li>
        </ul>
      </div>

      {/* ---------- sleep and steps ---------- */}
      <div className="row"><h2 style={{ margin: 0 }}>Sleep & steps</h2><button className="ghost sm2" onClick={() => setTg({ sleep: String(hg.sleep), steps: String(hg.steps) })}>Edit targets</button></div>
      <div className="grid2">
        <div className="card cen">
          <Ring size={110} stroke={10} pct={hd.sleep / hg.sleep} color="#C4B5FD" glow><div className="big sm">{hd.sleep}h</div><div className="muted small">sleep</div></Ring>
          <div className="btns c"><button className="ghost sm2" onClick={() => setHd({ ...hd, sleep: Math.max(0, hd.sleep - 0.5) })}>−</button><button className="ghost sm2" onClick={() => setHd({ ...hd, sleep: Math.min(12, hd.sleep + 0.5) })}>+</button></div>
          <div className="muted small">Goal {hg.sleep}h</div>
        </div>
        <div className="card cen">
          <Ring size={110} stroke={10} pct={hd.steps / hg.steps} color="#FBBF24" glow><div className="big sm" style={{ fontSize: 24 }}>{stepsShown.toLocaleString()}</div><div className="muted small">steps</div></Ring>
          <div className="btns c"><button className="ghost sm2" onClick={() => setSteps(hd.steps - 1000)}>−1k</button><button className="ghost sm2" onClick={() => { setSteps(hd.steps + 1000); buzz() }}>+1k</button></div>
          <div className="muted small">Goal {hg.steps.toLocaleString()}</div>
        </div>
      </div>

      {/* ---------- editable health habits ---------- */}
      <div className="row"><h2 style={{ margin: 0 }}>Daily health habits</h2><button className="cta sm" onClick={() => setHb({ title: '', time: '' })}>+ Habit</button></div>
      <div className="list">
        <AnimatePresence initial={false}>
          {hHabits.map((h) => {
            const on = done.includes(h.id)
            return (
              <SwipeRow key={h.id} className={`item ${on ? 'on' : ''}`} onDelete={() => delHabit(h.id)} onTap={() => { if (skip.current) { skip.current = false; return } toggle(h.id); buzz() }}>
                <Check on={on} color="#FBBF24" /><span className="tx"><span className="t">{h.title}</span><span className="muted small">{h.time}</span></span>
                <button className="edit" onPointerDown={() => { skip.current = true; setTimeout(() => { skip.current = false }, 500) }} onClick={() => setHb({ id: h.id, title: h.title, time: h.time && /^\d\d:\d\d$/.test(h.time) ? h.time : '' })}>Edit</button>
              </SwipeRow>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="grid2">
        <div className="card"><div className="muted small">MOOD</div><div className="emo">{EMO.map((e, i) => <button key={i} className={hd.mood === i + 1 ? 'act' : ''} onClick={() => { setHd({ ...hd, mood: i + 1 }); buzz() }}>{e}</button>)}</div></div>
        <div className="card"><div className="muted small">ENERGY</div><div className="emo">{EMO.map((e, i) => <button key={i} className={hd.energy === i + 1 ? 'act' : ''} onClick={() => { setHd({ ...hd, energy: i + 1 }); buzz() }}>{e}</button>)}</div></div>
      </div>

      {/* ---------- sheets ---------- */}
      <Sheet open={!!wd} onClose={() => setWd(null)} title={wd?.id ? 'Edit weight' : 'Log weight'}>
        {wd && (
          <>
            <div className="grid2">
              <label>Weight (kg)<input className="field" inputMode="decimal" autoFocus placeholder="e.g. 77.6" value={wd.kg} onChange={(e) => setWd({ ...wd, kg: e.target.value })} /></label>
              <label>Waist (cm, optional)<input className="field" inputMode="decimal" placeholder="e.g. 89" value={wd.waist} onChange={(e) => setWd({ ...wd, waist: e.target.value })} /></label>
            </div>
            <label className="lab">Date<input className="field" type="date" max={dstr(new Date())} value={wd.date} onChange={(e) => setWd({ ...wd, date: e.target.value })} /></label>
            <div className="btns">
              {wd.id && <button className="ghost danger" onClick={() => delWeight(wd.id!)}>Delete</button>}
              <button className="cta grow" onClick={saveWeight}>{wd.id ? 'Save changes' : 'Save weight'}</button>
            </div>
          </>
        )}
      </Sheet>

      <Sheet open={!!gd} onClose={() => setGd(null)} title="Weight loss goal">
        {gd && (() => {
          const c = calc(gd)
          return (
            <>
              <div className="grid2">
                <label>Target weight (kg)<input className="field" inputMode="decimal" value={gd.target} onChange={(e) => setGd({ ...gd, target: e.target.value })} /></label>
                <label>Height (cm)<input className="field" inputMode="decimal" value={gd.height} onChange={(e) => setGd({ ...gd, height: e.target.value })} /></label>
                <label>Age<input className="field" inputMode="decimal" value={gd.age} onChange={(e) => setGd({ ...gd, age: e.target.value })} /></label>
                <label>Sex<div className="slots" style={{ margin: 0 }}>{[['m', 'Male'], ['f', 'Female']].map(([v, l]) => <button key={v} className={gd.sex === v ? 'act' : ''} onClick={() => setGd({ ...gd, sex: v })}>{l}</button>)}</div></label>
              </div>
              <div className="muted small lab">Weekly loss goal (kg / week)</div>
              <div className="slots">{[0.25, 0.5, 0.75, 1].map((r) => <button key={r} className={gd.rate === r ? 'act' : ''} onClick={() => setGd({ ...gd, rate: r })}>{r} kg</button>)}</div>
              <div className="muted small lab">Activity level</div>
              <div className="slots">{ACT.map((a) => <button key={a.v} className={gd.activity === a.v ? 'act' : ''} onClick={() => setGd({ ...gd, activity: a.v })}>{a.l}</button>)}</div>
              <div className="card calc">
                <div className="row"><span className="muted">Daily burn (TDEE)</span><b>{c.tdee} kcal</b></div>
                <div className="row"><span className="muted">Suggested to lose {gd.rate} kg/week</span><b style={{ color: '#34D399' }}>{c.kcal} kcal</b></div>
                <div className="row"><span className="muted">Protein target</span><b>{c.protein} g</b></div>
                <div className="muted small">Estimate only. Never eat under about 1,400 kcal without a doctor.</div>
              </div>
              <div className="btns"><button className="ghost" onClick={() => saveGoal(false)}>Save goal</button><button className="cta grow" onClick={() => saveGoal(true)}>Save + use as Diet targets</button></div>
            </>
          )
        })()}
      </Sheet>

      <Sheet open={!!tg} onClose={() => setTg(null)} title="Health targets">
        {tg && (
          <>
            <div className="grid2">
              <label>Sleep goal (hours)<input className="field" inputMode="decimal" value={tg.sleep} onChange={(e) => setTg({ ...tg, sleep: e.target.value })} /></label>
              <label>Daily steps goal<input className="field" inputMode="decimal" value={tg.steps} onChange={(e) => setTg({ ...tg, steps: e.target.value })} /></label>
            </div>
            <button className="cta wide" onClick={() => { setHg({ sleep: parseFloat(tg.sleep) || hg.sleep, steps: parseInt(tg.steps) || hg.steps }); setTg(null); buzz() }}>Save targets</button>
          </>
        )}
      </Sheet>

      <Sheet open={!!hb} onClose={() => setHb(null)} title={hb?.id ? 'Edit habit' : 'New health habit'}>
        {hb && (
          <>
            <input className="field" autoFocus placeholder="e.g. Walk after dinner 15 min" value={hb.title} onChange={(e) => setHb({ ...hb, title: e.target.value })} />
            <label className="lab">Time (optional)<input className="field" type="time" value={hb.time} onChange={(e) => setHb({ ...hb, time: e.target.value })} /></label>
            <div className="btns">
              {hb.id && <button className="ghost danger" onClick={() => delHabit(hb.id!)}>Delete</button>}
              <button className="cta grow" onClick={saveHabit}>{hb.id ? 'Save changes' : 'Add habit'}</button>
            </div>
          </>
        )}
      </Sheet>
      <div className="muted small hint">{shortLabel(today)}</div>
    </div>
  )
}
