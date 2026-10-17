import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PILLARS } from './data'
import { Ring, SwipeRow, buzz, useDaily, useLocal } from './ui'
import './routine.css'

interface Prayer { id: string; name: string; time: string }

const PRAYERS: Prayer[] = [
  { id: 'fajr', name: 'Fajr', time: '05:45 AM' },
  { id: 'zohar', name: 'Zohar', time: '12:30 PM' },
  { id: 'asr', name: 'Asr', time: '03:45 PM' },
  { id: 'maghrib', name: 'Maghrib', time: '06:15 PM' },
  { id: 'isha', name: 'Isha', time: '07:45 PM' },
]

export default function Routine() {
  const [routines, setRoutines] = useLocal<string>('wa-routines-v1', JSON.stringify([
    { id: 'r1', title: 'Wake up at 5:45 AM', time: '05:45' },
    { id: 'r2', title: 'Phone off at 9:30 PM', time: '21:30' },
    { id: 'r3', title: "Plan tomorrow's 3 priorities", time: '21:40' },
    { id: 'r4', title: 'Sleep by 10:30 PM', time: '22:30' },
  ]))
  const [prayers, setPrayers] = useDaily<Record<string, boolean>>('wa-prayers-v1', {}, {})
  const [newRoutine, setNewRoutine] = useState('')
  const [newTime, setNewTime] = useState('')

  const routineList = JSON.parse(routines)
  const prayersDone = Object.values(prayers).filter(Boolean).length

  const togglePrayer = (id: string) => {
    setPrayers({ ...prayers, [id]: !prayers[id] })
  }

  const addRoutine = () => {
    const title = newRoutine.trim()
    if (!title || !newTime) return
    const id = Math.random().toString(36).slice(2, 9)
    const updated = [...routineList, { id, title, time: newTime }]
    setRoutines(JSON.stringify(updated))
    setNewRoutine('')
    setNewTime('')
    buzz()
  }

  const deleteRoutine = (id: string) => {
    const updated = routineList.filter((r: any) => r.id !== id)
    setRoutines(JSON.stringify(updated))
  }

  return (
    <div className="page">
      <div className="top"><div><div className="muted">Daily practices</div><h1>Routine</h1></div></div>

      {/* Prayer Checkbar */}
      <div className="card prayer-bar">
        <h2>Five Daily Prayers</h2>
        <div className="prayers-grid">
          {PRAYERS.map((prayer) => (
            <motion.button
              key={prayer.id}
              className={`prayer-item ${prayers[prayer.id] ? 'done' : ''}`}
              onClick={() => { togglePrayer(prayer.id); buzz() }}
              whileTap={{ scale: 0.95 }}
            >
              <Ring
                size={72}
                stroke={6}
                pct={prayers[prayer.id] ? 1 : 0}
                color={PILLARS.routine.color}
                glow={prayers[prayer.id]}
              >
                <span className="prayer-icon">🕌</span>
              </Ring>
              <div className="prayer-name">{prayer.name}</div>
              <div className="prayer-time">{prayer.time}</div>
              {prayers[prayer.id] && <div className="prayer-check">✓</div>}
            </motion.button>
          ))}
        </div>
        <div className="prayer-progress">
          <b>{prayersDone} / {PRAYERS.length}</b> prayers done
        </div>
      </div>

      {/* Daily Routines */}
      <h2>Daily Routines</h2>
      <div className="list">
        <AnimatePresence initial={false}>
          {routineList.map((routine: any) => (
            <SwipeRow
              key={routine.id}
              className="item"
              onDelete={() => deleteRoutine(routine.id)}
            >
              <span className="tx">
                <span className="t">{routine.title}</span>
                <span className="muted small">{routine.time}</span>
              </span>
            </SwipeRow>
          ))}
        </AnimatePresence>
      </div>

      {/* Add New Routine */}
      <div className="card add-routine">
        <h3>Add routine</h3>
        <input
          className="field"
          type="text"
          placeholder="e.g. Meditate 10 min"
          value={newRoutine}
          onChange={(e) => setNewRoutine(e.target.value)}
        />
        <input
          className="field"
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
        />
        <button className="cta wide" onClick={addRoutine}>
          Add routine
        </button>
      </div>

      <div className="muted small hint">Swipe a routine left to delete it.</div>
    </div>
  )
}
