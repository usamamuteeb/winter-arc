import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONCEPTS, CONCEPT_PYSPARK, SCENARIOS, SERVICES, SNIPPETS, type Concept } from './learnData'
import { Ring, Segments, buzz, useLocal } from './ui'

type Sub = 'concepts' | 'scenarios' | 'services' | 'pyspark'
export const LEARN_TOTAL = CONCEPTS.length + SCENARIOS.length + CONCEPT_PYSPARK.length + SNIPPETS.length

function Flow({ steps }: { steps: { n: string; t?: string }[] }) {
  return (
    <div className="flow">
      {steps.map((s, i) => (
        <motion.div key={i} className="fstep" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
          <div className="fdot"><span>{i + 1}</span>{i < steps.length - 1 && <i className="fline" />}</div>
          <div className="fbody"><b>{s.n}</b>{s.t && <small>{s.t}</small>}</div>
        </motion.div>
      ))}
    </div>
  )
}

function Got({ on, toggle }: { on: boolean; toggle: () => void }) {
  return <button className={`got ${on ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggle(); buzz() }}>{on ? '✓ Learned' : 'Mark learned'}</button>
}

function CodeBox({ code }: { code: string }) {
  const [ok, setOk] = useState(false)
  return (
    <div className="code">
      <button className="copy" onClick={() => { navigator.clipboard?.writeText(code).then(() => { setOk(true); setTimeout(() => setOk(false), 1200) }) }}>{ok ? 'Copied' : 'Copy'}</button>
      <pre>{code}</pre>
    </div>
  )
}

export default function Learn() {
  const [sub, setSub] = useState<Sub>('concepts')
  const [open, setOpen] = useState<string | null>(null)
  const [learned, setLearned] = useLocal<string[]>('wa-learned', ['c1', 'c2', 'c3', 'c5', 'c6', 'k1', 'k2', 'k3'])
  const [q, setQ] = useState('')
  const flip = (id: string) => setLearned(learned.includes(id) ? learned.filter((x) => x !== id) : [...learned, id])
  const has = (s: string) => !q || s.toLowerCase().includes(q.toLowerCase())
  const cards = (list: Concept[]) => list.filter((c) => has(c.title + c.plain + c.tag)).map((c) => (
    <motion.div layout key={c.id} className={`lcard ${open === c.id ? 'open' : ''}`} onClick={() => setOpen(open === c.id ? null : c.id)}>
      <div className="row"><div><span className="tag">{c.tag}</span><div className="lt">{c.title}</div></div>{learned.includes(c.id) && <span className="ok">✓</span>}</div>
      <AnimatePresence initial={false}>
        {open === c.id && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <p className="pl">{c.plain}</p>
            <div className="ex2"><small>EXAMPLE</small>{c.example}</div>
            <div className="rem"><small>REMEMBER</small>{c.remember}</div>
            <Got on={learned.includes(c.id)} toggle={() => flip(c.id)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  ))
  const pct = learned.length / LEARN_TOTAL
  return (
    <div className="learn">
      <div className="card row lhead">
        <Ring size={58} stroke={7} pct={pct} color="#34D399"><b style={{ fontSize: 14 }}>{learned.length}</b></Ring>
        <div style={{ flex: 1 }}><b>Data Engineering knowledge</b><div className="muted small">{learned.length} of {LEARN_TOTAL} learned. Tap a card to open it.</div></div>
      </div>
      <Segments<Sub> value={sub} onChange={(v) => { setSub(v); setOpen(null) }} items={[{ id: 'concepts', label: 'Concepts' }, { id: 'scenarios', label: 'Scenarios' }, { id: 'services', label: 'Services' }, { id: 'pyspark', label: 'PySpark' }]} />
      <input className="search" placeholder="Search e.g. CDC, star schema, broadcast" value={q} onChange={(e) => setQ(e.target.value)} />

      {sub === 'concepts' && cards(CONCEPTS)}

      {sub === 'scenarios' && (
        <>
          <div className="muted small">"How does data move?" Each scenario shows the flow and which service does each step.</div>
          {SCENARIOS.filter((s) => has(s.title + s.situation + s.tools)).map((s) => (
            <motion.div layout key={s.id} className={`lcard ${open === s.id ? 'open' : ''}`} onClick={() => setOpen(open === s.id ? null : s.id)}>
              <div className="row"><div><span className="tag">Scenario</span><div className="lt">{s.title}</div></div>{learned.includes(s.id) && <span className="ok">✓</span>}</div>
              <AnimatePresence initial={false}>
                {open === s.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <p className="pl">{s.situation}</p>
                    <Flow steps={s.flow} />
                    <div className="ex2"><small>TOOLS</small>{s.tools}</div>
                    <div className="rem"><small>WATCH OUT FOR</small><ul>{s.watch.map((w) => <li key={w}>{w}</li>)}</ul></div>
                    <div className="say"><small>WHAT TO SAY IN AN INTERVIEW</small>"{s.say}"</div>
                    <Got on={learned.includes(s.id)} toggle={() => flip(s.id)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </>
      )}

      {sub === 'services' && (
        <>
          <div className="muted small">Which service do I use for what? Azure first (your job targets), with AWS and GCP equivalents.</div>
          {SERVICES.filter((s) => has(s.need + s.azure + s.aws + s.gcp + s.when)).map((s) => (
            <div key={s.need} className="card svc">
              <b>{s.need}</b>
              <div className="cl"><span className="c az">Azure</span>{s.azure}</div>
              <div className="cl"><span className="c aw">AWS</span>{s.aws}</div>
              <div className="cl"><span className="c gc">GCP</span>{s.gcp}</div>
              <div className="muted small">{s.when}</div>
            </div>
          ))}
        </>
      )}

      {sub === 'pyspark' && (
        <>
          {cards(CONCEPT_PYSPARK)}
          <div className="muted small">Copy-paste cheat sheet. Open a Databricks notebook and run each one.</div>
          {SNIPPETS.filter((s) => has(s.title + s.plain + s.code)).map((s) => (
            <motion.div layout key={s.id} className={`lcard ${open === s.id ? 'open' : ''}`} onClick={() => setOpen(open === s.id ? null : s.id)}>
              <div className="row"><div><span className="tag">PySpark</span><div className="lt">{s.title}</div></div>{learned.includes(s.id) && <span className="ok">✓</span>}</div>
              <AnimatePresence initial={false}>
                {open === s.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                    <p className="pl">{s.plain}</p>
                    <CodeBox code={s.code} />
                    <Got on={learned.includes(s.id)} toggle={() => flip(s.id)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </>
      )}
    </div>
  )
}
