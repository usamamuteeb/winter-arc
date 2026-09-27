import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GOALS, MEALS, SLOTS, type Meal } from './data'
import { Ring, Sheet, SwipeRow, buzz, uid, useCount, useLocal } from './ui'

type Draft = { id?: string; slot: string; name: string; kcal: string; protein: string; fat: string; sugar: string }
const blank: Draft = { slot: 'Breakfast', name: '', kcal: '', protein: '', fat: '', sugar: '' }
const num = (s: string) => Math.max(0, Math.round(parseFloat(s) || 0))

function Macro({ label, val, goal, color, limit, unit = 'g' }: { label: string; val: number; goal: number; color: string; limit?: boolean; unit?: string }) {
  const pct = Math.min(100, (val / goal) * 100)
  const over = limit && val > goal
  const col = limit ? (over ? '#F87171' : val / goal > 0.75 ? '#FBBF24' : '#34D399') : color
  return (
    <div className="mac">
      <div className="row"><span className="muted">{label}</span><b style={{ color: over ? '#F87171' : undefined }}>{unit === 'g' ? `${val}g / ${goal}g` : `${val} / ${goal}${unit}`}{limit ? ' max' : ''}</b></div>
      <div className="bar"><motion.div className="fill" style={{ background: col, boxShadow: `0 0 12px ${col}88` }} animate={{ width: `${pct}%` }} /></div>
      {limit && <div className="small" style={{ color: over ? '#F87171' : '#34D399', marginTop: 4 }}>{over ? `Over your sugar limit by ${val - goal}g` : `${goal - val}g of sugar left today`}</div>}
    </div>
  )
}

export default function Diet() {
  const [glasses, setGlasses] = useLocal('wa-water', 5)
  const [meals, setMeals] = useLocal<Meal[]>('wa-meals-v2', MEALS)
  const [goals, setGoals] = useLocal('wa-goals', GOALS)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [gsheet, setGsheet] = useState(false)
  const [gd, setGd] = useState({ kcal: '', protein: '', fat: '', sugar: '' })
  const skip = useRef(false)

  const eaten = meals.filter((m) => m.eaten)
  const sum = (k: 'kcal' | 'protein' | 'fat' | 'sugar') => eaten.reduce((a, m) => a + m[k], 0)
  const kcal = sum('kcal'), protein = sum('protein'), fat = sum('fat'), sugar = sum('sugar')
  const pShown = useCount(protein)

  const openAdd = () => setDraft({ ...blank })
  const openEdit = (m: Meal) => setDraft({ id: m.id, slot: m.slot, name: m.name, kcal: String(m.kcal), protein: String(m.protein), fat: String(m.fat), sugar: String(m.sugar) })
  const save = () => {
    if (!draft || !draft.name.trim()) return
    const m: Meal = { id: draft.id ?? uid(), slot: draft.slot, name: draft.name.trim(), kcal: num(draft.kcal), protein: num(draft.protein), fat: num(draft.fat), sugar: num(draft.sugar), eaten: draft.id ? (meals.find((x) => x.id === draft.id)?.eaten ?? false) : true }
    setMeals(draft.id ? meals.map((x) => (x.id === m.id ? m : x)) : [...meals, m]); setDraft(null); buzz()
  }
  const remove = (id: string) => { setMeals(meals.filter((m) => m.id !== id)); setDraft(null) }
  const set = (k: keyof Draft, v: string) => draft && setDraft({ ...draft, [k]: v })

  return (
    <div className="page">
      <div className="top"><div><div className="muted">Fuel</div><h1>Diet</h1></div><button className="cta sm" onClick={openAdd}>+ Meal</button></div>

      <div className="card macro" onClick={() => { setGd({ kcal: String(goals.kcal), protein: String(goals.protein), fat: String(goals.fat), sugar: String(goals.sugar) }); setGsheet(true) }}>
        <Ring size={120} stroke={12} pct={protein / goals.protein} color="#34D399" glow><div className="big sm">{pShown}g</div><div className="muted small">protein</div></Ring>
        <div className="mm">
          <Macro label="Calories" val={kcal} goal={goals.kcal} color="#FBBF24" unit=" kcal" />
          <Macro label="Protein" val={protein} goal={goals.protein} color="#34D399" />
          <Macro label="Fat" val={fat} goal={goals.fat} color="#C4B5FD" />
        </div>
      </div>
      <div className="card"><Macro label="Sugar" val={sugar} goal={goals.sugar} color="#F87171" limit />
        <div className="muted small" style={{ marginTop: 6 }}>Tap the cards above to change your targets.</div></div>

      <div className="card water">
        <div className="bottle">
          <motion.div className="liquid" animate={{ height: `${Math.min(100, (glasses / 8) * 100)}%` }} transition={{ type: 'spring', stiffness: 50, damping: 12 }}><div className="wave" /></motion.div>
          <div className="btxt"><b>{glasses}</b><small>/ 8</small></div>
        </div>
        <div className="wr">
          <b>Water</b><div className="muted small">Glasses today</div>
          <div className="btns"><button className="ghost" onClick={() => setGlasses(Math.max(0, glasses - 1))}>−</button><button className="cta" onClick={() => { setGlasses(Math.min(12, glasses + 1)); buzz() }}>+ Glass</button></div>
        </div>
      </div>

      <div className="row"><h2 style={{ margin: 0 }}>Meals</h2><span className="muted small">Tap = eaten · swipe left = delete</span></div>
      <div className="list">
        <AnimatePresence initial={false}>
          {meals.map((m) => (
            <SwipeRow key={m.id} className={`meal ${m.eaten ? 'eaten' : ''}`} onDelete={() => remove(m.id)}
              onTap={() => { if (skip.current) { skip.current = false; return } setMeals(meals.map((x) => (x.id === m.id ? { ...x, eaten: !x.eaten } : x))); buzz() }}>
              <div style={{ flex: 1 }}>
                <div className="muted small">{m.slot.toUpperCase()}{m.eaten ? ' · EATEN ✓' : ''}</div>
                <b>{m.name}</b>
                <div className="chips"><span>{m.kcal} kcal</span><span className="p">P {m.protein}g</span><span className="f">F {m.fat}g</span><span className="s">Sugar {m.sugar}g</span></div>
              </div>
              <button className="edit" onPointerDown={() => { skip.current = true; setTimeout(() => { skip.current = false }, 500) }} onClick={() => openEdit(m)}>Edit</button>
            </SwipeRow>
          ))}
        </AnimatePresence>
      </div>
      {meals.length === 0 && <div className="card center muted">No meals yet. Tap + Meal to add one.</div>}

      <Sheet open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Edit meal' : 'Add meal'}>
        {draft && (
          <>
            <div className="slots">{SLOTS.map((s) => <button key={s} className={draft.slot === s ? 'act' : ''} onClick={() => set('slot', s)}>{s}</button>)}</div>
            <input className="field" placeholder="What did you eat? e.g. Chicken karahi + 1 roti" value={draft.name} onChange={(e) => set('name', e.target.value)} />
            <div className="grid2">
              <label>Calories<input className="field" inputMode="decimal" placeholder="kcal" value={draft.kcal} onChange={(e) => set('kcal', e.target.value)} /></label>
              <label>Protein (g)<input className="field" inputMode="decimal" placeholder="0" value={draft.protein} onChange={(e) => set('protein', e.target.value)} /></label>
              <label>Fat (g)<input className="field" inputMode="decimal" placeholder="0" value={draft.fat} onChange={(e) => set('fat', e.target.value)} /></label>
              <label>Sugar (g)<input className="field" inputMode="decimal" placeholder="0" value={draft.sugar} onChange={(e) => set('sugar', e.target.value)} /></label>
            </div>
            <div className="btns">
              {draft.id && <button className="ghost danger" onClick={() => remove(draft.id!)}>Delete</button>}
              <button className="cta grow" onClick={save}>{draft.id ? 'Save changes' : 'Add meal'}</button>
            </div>
          </>
        )}
      </Sheet>

      <Sheet open={gsheet} onClose={() => setGsheet(false)} title="Daily targets">
        <div className="grid2">
          <label>Calories<input className="field" inputMode="decimal" value={gd.kcal} onChange={(e) => setGd({ ...gd, kcal: e.target.value })} /></label>
          <label>Protein (g)<input className="field" inputMode="decimal" value={gd.protein} onChange={(e) => setGd({ ...gd, protein: e.target.value })} /></label>
          <label>Fat (g)<input className="field" inputMode="decimal" value={gd.fat} onChange={(e) => setGd({ ...gd, fat: e.target.value })} /></label>
          <label>Sugar limit (g)<input className="field" inputMode="decimal" value={gd.sugar} onChange={(e) => setGd({ ...gd, sugar: e.target.value })} /></label>
        </div>
        <button className="cta wide" onClick={() => { setGoals({ kcal: num(gd.kcal) || goals.kcal, protein: num(gd.protein) || goals.protein, fat: num(gd.fat) || goals.fat, sugar: num(gd.sugar) || goals.sugar }); setGsheet(false); buzz() }}>Save targets</button>
      </Sheet>
    </div>
  )
}
