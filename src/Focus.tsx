import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ROADMAP, type Topic } from './data'
import Learn from './Learn'
import { AddRow, Check, Ring, Segments, Sheet, SwipeRow, buzz, uid, useLocal } from './ui'

type Seg = 'session' | 'road' | 'learn'
const MIN = 90

export default function Focus() {
  const [seg, setSeg] = useState<Seg>('session')
  const [road, setRoad] = useLocal<Topic[]>('wa-roadmap-v2', ROADMAP)
  const [secs, setSecs] = useState(MIN * 60), [run, setRun] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [sheet, setSheet] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  useEffect(() => { if (!run) return; const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(t) }, [run])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0')

  const active = road.find((t) => t.tasks.some((x) => !x.done)) ?? road[0]
  const allTasks = road.flatMap((t) => t.tasks)
  const doneAll = allTasks.filter((t) => t.done).length

  const patch = (tid: string, fn: (t: Topic) => Topic) => setRoad(road.map((t) => (t.id === tid ? fn(t) : t)))
  const toggle = (tid: string, id: string) => { patch(tid, (t) => ({ ...t, tasks: t.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })); buzz() }
  const addTask = (tid: string, title: string) => patch(tid, (t) => ({ ...t, tasks: [...t.tasks, { id: uid(), title, done: false }] }))
  const delTask = (tid: string, id: string) => patch(tid, (t) => ({ ...t, tasks: t.tasks.filter((x) => x.id !== id) }))
  const delTopic = (tid: string) => setRoad(road.filter((t) => t.id !== tid))
  const addTopic = () => { const t = newTopic.trim(); if (!t) return; const id = uid(); setRoad([...road, { id, title: t, tasks: [] }]); setNewTopic(''); setSheet(false); setOpenId(id); buzz() }

  return (
    <div className="page">
      <div className="top"><div><div className="muted">Data Engineering</div><h1>Focus</h1></div><div className="badge">{doneAll}/{allTasks.length} tasks</div></div>
      <Segments<Seg> value={seg} onChange={setSeg} items={[{ id: 'session', label: 'Session' }, { id: 'road', label: 'Roadmap' }, { id: 'learn', label: 'Learn' }]} />

      {seg === 'session' && (
        <>
          <div className="card timer">
            <Ring size={230} stroke={14} pct={1 - secs / (MIN * 60)} color="#7DD3FC" glow><div className="big">{mm}:{ss}</div><div className="muted small">DEEP WORK</div></Ring>
            <div className="btns c">
              <button className="cta" onClick={() => { setRun(!run); buzz() }}>{run ? 'Pause' : 'Start session'}</button>
              <button className="ghost" onClick={() => { setRun(false); setSecs(MIN * 60) }}>Reset</button>
            </div>
            <div className="muted small">Today: 1h 30m done · Goal: 3h</div>
          </div>
          {active && (
            <>
              <h2>Now: {active.title}</h2>
              <div className="list">
                <AnimatePresence initial={false}>
                  {active.tasks.map((t) => (
                    <SwipeRow key={t.id} className={`item ${t.done ? 'on' : ''}`} onTap={() => toggle(active.id, t.id)} onDelete={() => delTask(active.id, t.id)}>
                      <Check on={t.done} color="#7DD3FC" /><span className="tx"><span className="t">{t.title}</span></span>
                    </SwipeRow>
                  ))}
                </AnimatePresence>
              </div>
              <AddRow placeholder="Add a task to this topic" onAdd={(t) => addTask(active.id, t)} />
              <div className="muted small hint">Tip: swipe a task left to delete it.</div>
            </>
          )}
        </>
      )}

      {seg === 'road' && (
        <>
          <div className="row"><h2 style={{ margin: 0 }}>Learning roadmap</h2><button className="cta sm" onClick={() => setSheet(true)}>+ Topic</button></div>
          <div className="list">
            <AnimatePresence initial={false}>
              {road.map((t) => {
                const d = t.tasks.filter((x) => x.done).length, pct = t.tasks.length ? d / t.tasks.length : 0
                const isOpen = openId === t.id
                return (
                  <SwipeRow key={t.id} className={`node ${pct >= 1 ? 'done' : pct > 0 ? 'act' : ''}`} onTap={() => setOpenId(isOpen ? null : t.id)} onDelete={() => delTopic(t.id)}
                    foot={isOpen ? (
                      <div className="topic-body">
                        <AnimatePresence initial={false}>
                          {t.tasks.map((x) => (
                            <SwipeRow key={x.id} className={`item mini ${x.done ? 'on' : ''}`} onTap={() => toggle(t.id, x.id)} onDelete={() => delTask(t.id, x.id)}>
                              <Check on={x.done} color="#7DD3FC" /><span className="tx"><span className="t">{x.title}</span></span>
                            </SwipeRow>
                          ))}
                        </AnimatePresence>
                        <AddRow placeholder="Add a task" onAdd={(title) => addTask(t.id, title)} />
                      </div>
                    ) : undefined}>
                    <Ring size={46} stroke={5} pct={pct} color={pct >= 1 ? '#34D399' : '#7DD3FC'}><small>{pct >= 1 ? '✓' : Math.round(pct * 100) + '%'}</small></Ring>
                    <div style={{ flex: 1 }}><b>{t.title}</b><div className="muted small">{d}/{t.tasks.length} tasks · tap to {isOpen ? 'close' : 'open'}</div></div>
                    <motion.span animate={{ rotate: isOpen ? 90 : 0 }} className="muted">›</motion.span>
                  </SwipeRow>
                )
              })}
            </AnimatePresence>
          </div>
          <div className="muted small hint">Swipe a topic or task left to delete it.</div>
        </>
      )}

      {seg === 'learn' && <Learn />}

      <Sheet open={sheet} onClose={() => setSheet(false)} title="New topic">
        <input className="field" autoFocus placeholder="e.g. Airflow basics" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addTopic() }} />
        <button className="cta wide" onClick={addTopic}>Add topic</button>
      </Sheet>
    </div>
  )
}
