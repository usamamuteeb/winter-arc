import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, animate } from 'framer-motion'

export const buzz = () => { try { navigator.vibrate?.(12) } catch { /* ignore */ } }
export const uid = () => Math.random().toString(36).slice(2, 9)

export function useCount(value: number, dur = 0.9) {
  const [v, setV] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const c = animate(prev.current, value, { duration: dur, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) })
    prev.current = value
    return () => c.stop()
  }, [value, dur])
  return v
}

export function useLocal<T>(key: string, init: T) {
  const [s, setS] = useState<T>(() => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : init } catch { return init } })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(s)) }, [key, s])
  return [s, setS] as const
}

export function Ring({ size, stroke, pct, color, children, glow }: { size: number; stroke: number; pct: number; color: string; children?: React.ReactNode; glow?: boolean }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ filter: glow ? `drop-shadow(0 0 10px ${color}88)` : undefined }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.08)" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.max(0, Math.min(1, pct))) }}
          transition={{ type: 'spring', stiffness: 60, damping: 14 }} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-in">{children}</div>
    </div>
  )
}

export function Snow() {
  const flakes = useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    left: (i * 37) % 100, size: 2 + (i % 4), dur: 10 + (i % 7) * 2.2, delay: -(i * 1.7), drift: ((i % 5) - 2) * 14,
  })), [])
  return (
    <div className="snow" aria-hidden>
      {flakes.map((f, i) => (
        <span key={i} style={{ left: `${f.left}%`, width: f.size, height: f.size, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, ['--dx' as string]: `${f.drift}px` }} />
      ))}
    </div>
  )
}

export function Confetti({ fire }: { fire: number }) {
  const parts = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    x: (Math.sin(i * 7.1) * 0.5) * 340, y: -140 - ((i * 53) % 220), r: (i * 47) % 360, c: ['#7DD3FC', '#FBBF24', '#34D399', '#F87171', '#C4B5FD'][i % 5], d: (i % 6) * 0.03,
  })), [])
  if (!fire) return null
  return (
    <div className="confetti" key={fire} aria-hidden>
      {parts.map((p, i) => (
        <motion.i key={i} style={{ background: p.c }} initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 520], opacity: [1, 1, 0], rotate: p.r * 3 }} transition={{ duration: 1.9, delay: p.d, ease: 'easeOut' }} />
      ))}
    </div>
  )
}

/** bottom sheet */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return createPortal(
    <AnimatePresence>
      {open && [
        <motion.div key="scrim" className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />,
        <motion.div key="sheet" className="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }} onDragEnd={(_, i) => { if (i.offset.y > 120) onClose() }}>
          <div className="grab" />
          <h3>{title}</h3>
          {children}
        </motion.div>,
      ]}
    </AnimatePresence>,
    document.body,
  )
}

/** swipe left to delete. Wrap lists in <AnimatePresence initial={false}>. */
export function SwipeRow({ children, onDelete, onTap, foot, className = '' }: { children: React.ReactNode; onDelete: () => void; onTap?: () => void; foot?: React.ReactNode; className?: string }) {
  const moved = useRef(false)
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ x: -480, opacity: 0, height: 0, marginTop: -5, marginBottom: -4 }} transition={{ duration: 0.28 }} className="swipe">
      <div className="swipe-bg"><span>🗑 Delete</span></div>
      <motion.div className={`swipe-fg ${className}`} drag="x" dragDirectionLock dragSnapToOrigin dragConstraints={{ left: -140, right: 0 }} dragElastic={{ left: 0.5, right: 0 }}
        onDragStart={() => { moved.current = true }}
        onDragEnd={(_, i) => { setTimeout(() => { moved.current = false }, 60); if (i.offset.x < -95 || i.velocity.x < -650) { buzz(); onDelete() } }}
        onTap={() => { if (moved.current) return; onTap?.() }}>
        {children}
      </motion.div>
      {foot && <div className="swipe-foot">{foot}</div>}
    </motion.div>
  )
}

export function AddRow({ placeholder, onAdd, cta = 'Add' }: { placeholder: string; onAdd: (t: string) => void; cta?: string }) {
  const [v, setV] = useState('')
  const go = () => { const t = v.trim(); if (!t) return; onAdd(t); setV(''); buzz() }
  return (
    <div className="addrow">
      <input value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') go() }} />
      <button className="cta sm" onClick={go}>{cta}</button>
    </div>
  )
}

export function Check({ on, color }: { on: boolean; color: string }) {
  return (
    <span className="chk" style={{ borderColor: color, background: on ? color : 'transparent' }}>
      <AnimatePresence>{on && <motion.svg width="16" height="16" viewBox="0 0 24 24" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#0B1220" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></motion.svg>}</AnimatePresence>
    </span>
  )
}

export function Segments<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div className="seg">
      {items.map((it) => (
        <button key={it.id} className={value === it.id ? 'act' : ''} onClick={() => { onChange(it.id); buzz() }}>
          {value === it.id && <motion.span layoutId={`seg-${items.map((i) => i.id).join('')}`} className="segbg" />}
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  )
}
