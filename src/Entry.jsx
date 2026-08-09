/* Toast + option sheet, built 1:1 from Figma
   unBox-benchmarking · node 163:3357 (frames 163:3264 and 163:3278) */

import ParticleSphere from './ParticleSphere'

const A = {
  bg: '/figma/app-bg.png',
  toastIcon: '/figma/toast-icon.png',
  orb: '/figma/orb.png',
  pay: '/figma/icon-pay.svg',
  date: '/figma/icon-date.svg',
  rm: '/figma/icon-rm.svg',
  chevron: '/figma/chevron.svg',
  separator: '/figma/separator.svg',
  notch: '/figma/notch.svg',
  statusRight: '/figma/statusbar-right.svg',
  chevron2: '/figma/chevron2.svg',
  separator2: '/figma/separator2.svg',
  pointer: '/figma/pointer.svg',
  iPay: '/figma/i-pay.svg',
  iDate: '/figma/i-date.svg',
  iRm: '/figma/i-rm.svg',
}

function Frame({ children, blur }) {
  return (
    <div className="fig">
      <img className="fig-bg" src={A.bg} alt="" />
      <div className="fig-overlay" style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }}>
        {children}
      </div>
      <div className="fig-homebar"><i /></div>
    </div>
  )
}

/* ---------- 163:3264 — toast ---------- */
export function Toast({ onOpen }) {
  return (
    <Frame blur={4}>
      <div className="fig-toast-pad">
        <div className="fig-toast">
          <img className="fig-toast-icon" src={A.toastIcon} alt="" />
          <div className="fig-toast-body">
            <div className="fig-toast-text">
              <p className="fig-title-14">₹45,000 EMI due today</p>
              <p className="fig-sub-14">Pay it or move the date</p>
            </div>
            <button className="fig-btn" onClick={onOpen}>See options</button>
          </div>
        </div>
      </div>
    </Frame>
  )
}

/* ---------- 166:3429 — full-screen intro ---------- */
const INTRO_OPTIONS = [
  { icon: A.iPay, t: 'Pay ₹45,000', d: 'Clears this month. No late fee.', go: 'paid' },
  { icon: A.iDate, t: 'Move the date', d: 'Up to 5 days. Still no late fee.', go: 'loading' },
  { icon: A.iRm, t: 'Connect to your RM', d: 'For anything longer than 5 days', go: 'agent' },
]

function IntroCard({ o, go }) {
  return (
    <button className="in-card" onClick={() => go(o.go)}>
      <span className="in-card-main">
        <span className="in-card-icon"><img src={o.icon} alt="" /></span>
        <span className="in-card-text">
          <span className="fig-title-16">{o.t}</span>
          <span className="fig-sub-14">{o.d}</span>
        </span>
      </span>
      <span className="in-card-chev"><span className="fig-chevron"><img src={A.chevron2} alt="" /></span></span>
    </button>
  )
}

export function Intro({ go, onBack }) {
  const [a, b, c] = INTRO_OPTIONS
  return (
    <div className="in dotgrid">
      <div className="in-header">
        <div className="in-status">
          <span className="in-time">9:41</span>
          <img className="in-notch" src={A.notch} alt="" />
          <img className="in-status-right" src={A.statusRight} alt="" />
        </div>
        <div className="in-nav">
          <button className="in-back" onClick={onBack} aria-label="Back">
            <span className="fig-chevron flip"><img src={A.chevron2} alt="" /></span>
          </button>
          <img className="fig-sep" src={A.separator2} alt="" />
        </div>
      </div>

      <div className="in-body">
        <div className="in-hero">
          <div className="in-orb"><ParticleSphere size={118} /></div>
          <div className="in-id">
            <span className="in-pill">Nia AI</span>
            <div className="in-tooltip">
              <img className="in-pointer" src={A.pointer} alt="" />
              <div className="in-tip-body">
                <span className="in-dot"><i /></span>
                <span className="in-tip-text">Your installment is on time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="in-main">
          <p className="in-title">Your EMI is overdue</p>
          <div className="in-options">
            <div className="in-options-group">
              <IntroCard o={a} go={go} />
              <IntroCard o={b} go={go} />
            </div>
            <img className="fig-sep" src={A.separator2} alt="" />
            <IntroCard o={c} go={go} />
          </div>
        </div>
      </div>

      <div className="in-homebar"><i /></div>
    </div>
  )
}

/* ---------- 163:3278 — option sheet ---------- */
const OPTIONS = [
  { icon: A.pay, t: 'Pay it now', d: 'Pay it, or move it in seconds', go: 'paid' },
  { icon: A.date, t: 'Move the date', d: 'Up to 5 days. Still no late fee.', go: 'check:reschedule' },
  { icon: A.rm, t: 'Connect to your RM', d: 'For anything longer than 5 days', go: 'check:pause', apart: true },
]

export function Sheet({ go }) {
  const [a, b, c] = OPTIONS
  const Card = ({ o }) => (
    <button className="fig-card" onClick={() => go(o.go)}>
      <span className="fig-card-main">
        <span className="fig-card-icon"><img src={o.icon} alt="" /></span>
        <span className="fig-card-text">
          <span className="fig-title-16">{o.t}</span>
          <span className="fig-sub-14">{o.d}</span>
        </span>
      </span>
      <span className="fig-chevron"><img src={A.chevron} alt="" /></span>
    </button>
  )

  return (
    <Frame blur={7}>
      <div className="fig-sheet-pad">
        <div className="fig-grabber"><i /></div>
        <div className="fig-sheet">
          <div className="fig-sheet-head">
            <div className="fig-orb"><ParticleSphere size={94} /></div>
            <div className="fig-sheet-title">
              <p className="fig-title-24">₹45,000 EMI due today</p>
              <p className="fig-sub-16">No late fee yet</p>
            </div>
          </div>
          <div className="fig-options">
            <div className="fig-options-group">
              <Card o={a} />
              <Card o={b} />
            </div>
            <img className="fig-sep" src={A.separator} alt="" />
            <Card o={c} />
          </div>
        </div>
      </div>
    </Frame>
  )
}
