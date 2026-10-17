import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SwipeRow, buzz, useDaily } from './ui'
import { type RoutineEntry } from './data'
import { recordPrayerDay } from './prayers'
import './routine.css'

interface Prayer { id: string; name: string }

const PRAYERS: Prayer[] = [
  { id: 'fajr', name: 'Fajr' },
  { id: 'zohar', name: 'Zohar' },
  { id: 'asr', name: 'Asr' },
  { id: 'maghrib', name: 'Maghrib' },
  { id: 'isha', name: 'Isha' },
]

export default function Routine({ routines: routineList, setRoutines, done, toggle }: {
  routines: RoutineEntry[]; setRoutines: (routines: RoutineEntry[]) => void; done: string[]; toggle: (id: string) => void
}) {
  const [prayers, setPrayers] = useDaily<Record<string, boolean>>('wa-prayers-v1', {}, {})
  const [newRoutine, setNewRoutine] = useState('')
  const [newTime, setNewTime] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTime, setEditTime] = useState('')

  const prayersDone = Object.values(prayers).filter(Boolean).length

  const togglePrayer = (id: string) => {
    const next = { ...prayers, [id]: !prayers[id] }
    recordPrayerDay(next)
    setPrayers(next)
  }

  const addRoutine = () => {
    const title = newRoutine.trim()
    if (!title || !newTime) return
    const id = Math.random().toString(36).slice(2, 9)
    const updated = [...routineList, { id, title, time: newTime }]
    setRoutines(updated)
    setNewRoutine('')
    setNewTime('')
    buzz()
  }

  const deleteRoutine = (id: string) => {
    const updated = routineList.filter((r) => r.id !== id)
    setRoutines(updated)
    buzz()
  }

  const startEdit = (routine: any) => {
    setEditId(routine.id)
    setEditTitle(routine.title)
    setEditTime(routine.time)
  }

  const saveEdit = () => {
    if (!editId || !editTitle.trim() || !editTime) return
    const updated = routineList.map((r) =>
      r.id === editId ? { ...r, title: editTitle.trim(), time: editTime } : r
    )
    setRoutines(updated)
    setEditId(null)
    setEditTitle('')
    setEditTime('')
    buzz()
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditTitle('')
    setEditTime('')
  }

  return (
    <div className="page">
      <div className="top"><div><div className="muted">Daily practices</div><h1>Routine</h1></div></div>

      {/* Prayer Checkbar */}
      <div className="card prayer-bar">
        <h2>Five Daily Prayers</h2>
        <div className="prayers-compact">
          {PRAYERS.map((prayer) => (
            <motion.button
              key={prayer.id}
              className={`prayer-compact ${prayers[prayer.id] ? 'done' : ''}`}
              onClick={() => { togglePrayer(prayer.id); buzz() }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="prayer-circle">
                <span className="prayer-icon">🕌</span>
                {prayers[prayer.id] && <span className="prayer-tick">✓</span>}
              </div>
              <span className="prayer-label">{prayer.name}</span>
            </motion.button>
          ))}
        </div>
        <div className="prayer-progress">
          <div className="progress-bar">
            <motion.div className="progress-fill" animate={{ width: `${(prayersDone / PRAYERS.length) * 100}%` }} />
          </div>
          <span className="progress-text"><b>{prayersDone}</b> of <b>{PRAYERS.length}</b></span>
        </div>
      </div>

      {/* Daily Routines */}
      <h2>Daily Routines</h2>
      <div className="list">
        <AnimatePresence initial={false}>
          {routineList.map((routine) =>
            editId === routine.id ? (
              <motion.div
                key={routine.id}
                className="edit-routine-inline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="edit-inputs">
                  <input
                    className="field"
                    type="text"
                    placeholder="Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <input
                    className="field-time"
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>
                <div className="edit-btns">
                  <button className="cta sm" onClick={saveEdit}>✓</button>
                  <button className="ghost sm" onClick={cancelEdit}>✕</button>
                </div>
              </motion.div>
            ) : (
              <SwipeRow
                key={routine.id}
                className={`item ${done.includes(`routine:${routine.id}`) ? 'on' : ''}`}
                onDelete={() => deleteRoutine(routine.id)}
              >
                <span className="tx">
                  <span className="t">{routine.title}</span>
                  <span className="muted small">{routine.time}</span>
                </span>
                <button className="edit-btn" aria-label={`${done.includes(`routine:${routine.id}`) ? 'Mark incomplete' : 'Mark complete'}: ${routine.title}`} onClick={(e) => { e.stopPropagation(); toggle(`routine:${routine.id}`); buzz() }}>{done.includes(`routine:${routine.id}`) ? '✓' : '○'}</button>
                <button className="edit-btn" onClick={(e) => { e.stopPropagation(); startEdit(routine) }}>✎</button>
              </SwipeRow>
            )
          )}
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
