import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PILLARS } from './data'
import { Ring, SwipeRow, buzz, useDaily, useLocal } from './ui'
import './routine.css'

interface Prayer { id: string; name: string }

const PRAYERS: Prayer[] = [
  { id: 'fajr', name: 'Fajr' },
  { id: 'zohar', name: 'Zohar' },
  { id: 'asr', name: 'Asr' },
  { id: 'maghrib', name: 'Maghrib' },
  { id: 'isha', name: 'Isha' },
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
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTime, setEditTime] = useState('')

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
    buzz()
  }

  const startEdit = (routine: any) => {
    setEditId(routine.id)
    setEditTitle(routine.title)
    setEditTime(routine.time)
  }

  const saveEdit = () => {
    if (!editId || !editTitle.trim() || !editTime) return
    const updated = routineList.map((r: any) =>
      r.id === editId ? { ...r, title: editTitle.trim(), time: editTime } : r
    )
    setRoutines(JSON.stringify(updated))
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
        <div className="prayers-grid">
          {PRAYERS.map((prayer) => (
            <motion.button
              key={prayer.id}
              className={`prayer-item ${prayers[prayer.id] ? 'done' : ''}`}
              onClick={() => { togglePrayer(prayer.id); buzz() }}
              whileTap={{ scale: 0.95 }}
            >
              <Ring
                size={64}
                stroke={5}
                pct={prayers[prayer.id] ? 1 : 0}
                color={PILLARS.routine.color}
                glow={prayers[prayer.id]}
              >
                <span className="prayer-icon">🕌</span>
              </Ring>
              <div className="prayer-name">{prayer.name}</div>
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
          {routineList.map((routine: any) =>
            editId === routine.id ? (
              <motion.div
                key={routine.id}
                className="card edit-routine"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <input
                  className="field"
                  type="text"
                  placeholder="Routine title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  className="field"
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                />
                <div className="btns">
                  <button className="cta" onClick={saveEdit}>Save</button>
                  <button className="ghost" onClick={cancelEdit}>Cancel</button>
                </div>
              </motion.div>
            ) : (
              <SwipeRow
                key={routine.id}
                className="item"
                onDelete={() => deleteRoutine(routine.id)}
              >
                <span className="tx">
                  <span className="t">{routine.title}</span>
                  <span className="muted small">{routine.time}</span>
                </span>
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
