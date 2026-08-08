export const money = (n) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0 })

export function Phone({ children }) {
  return (
    <div className="phone">
      <div className="status">
        <span>9:41</span>
        <span style={{ letterSpacing: 2 }}>▮▮▮ ᯤ ▰</span>
      </div>
      {children}
    </div>
  )
}

export function TopBar({ mode = 'ai', sub, onClose }) {
  return (
    <div className="topbar">
      <div className={mode === 'ai' ? 'orb' : mode === 'think' ? 'orb think' : 'orb person'}>
        {mode === 'person' ? 'RM' : ''}
      </div>
      <div>
        <div className="topbar-name">{mode === 'person' ? 'Rhea Menon' : 'Assist'}</div>
        <div className="topbar-sub">{sub}</div>
      </div>
      {onClose && <button className="x" onClick={onClose}>✕</button>}
    </div>
  )
}

export function Option({ icon, title, desc, onClick }) {
  return (
    <button className="opt" onClick={onClick}>
      <span className="opt-i">{icon}</span>
      <span style={{ flex: 1 }}>
        <span className="opt-t" style={{ display: 'block' }}>{title}</span>
        {desc && <span className="opt-d" style={{ display: 'block' }}>{desc}</span>}
      </span>
      <span className="arrow">›</span>
    </button>
  )
}

export function Row({ k, v, sub, tone }) {
  return (
    <div className="row">
      <span className="row-k">{k}</span>
      <span className="row-v" style={tone ? { color: `var(--${tone})` } : undefined}>
        {v}
        {sub && <span style={{ display: 'block', fontWeight: 400, fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</span>}
      </span>
    </div>
  )
}

export function Gap({ h = 16 }) {
  return <div style={{ height: h, flex: 'none' }} />
}
