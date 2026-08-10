/* Toast + intro + option sheet, built 1:1 from Figma
   unBox-benchmarking · 163:3264, 166:3429, 163:3278

   Note: Framer variants only propagate through motion components, so every
   wrapper between a stagger parent and an animated child is a motion.div. */

import { motion } from 'framer-motion'
import Sphere3D from './Sphere3D'
import { toastRise, sheetRise, stagger, riseItem, orbIn, fadeItem, tap } from './motion'

const A = {
  bg: '/figma/app-bg.jpg',
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
  pointer: '/figma/pointer2.svg',
  iPay: '/figma/i-pay.svg',
  iDate: '/figma/i-date.svg',
  iRm: '/figma/i-rm.svg',
}

/* The backdrop never changes, so the image is blurred once rather than
   re-sampling the backdrop every frame — backdrop-filter was the single
   most expensive thing on the page on mobile. */
function Frame({ children, blur, center }) {
  return (
    <div className="fig">
      <img className="fig-bg" src={A.bg} alt="" style={{ filter: `blur(${blur}px)` }} />
      <div className={`fig-overlay ${center ? 'center' : ''}`}>{children}</div>
      <div className="fig-homebar"><i /></div>
    </div>
  )
}

/* ---------- 175:73758 — modal over the app ---------- */
export function Toast({ onOpen }) {
  return (
    <Frame blur={4} center>
      <motion.div
        className="fig-modal"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <img className="fig-modal-icon" src={A.toastIcon} alt="" />
        <div className="fig-modal-text">
          <p className="fig-modal-title">₹45,000 EMI is 3 days late</p>
          <p className="fig-modal-sub">Pay it or move the date</p>
        </div>
        <div className="fig-modal-actions">
          <motion.button className="fig-modal-btn ghost" onClick={onOpen} {...tap}>Close</motion.button>
          <motion.button className="fig-modal-btn solid" onClick={onOpen} {...tap}>See options</motion.button>
        </div>
      </motion.div>
    </Frame>
  )
}

/* ---------- 166:3429 — full-screen intro ---------- */
const INTRO_OPTIONS = [
  { icon: A.iPay, t: 'Pay ₹45,000', d: 'Clears this month. No late fee.', go: 'success' },
  { icon: A.iDate, t: 'Move the date', d: 'Up to 5 days. Still no late fee.', go: 'loading' },
  { icon: A.iRm, t: 'Connect to your RM', d: 'For anything longer than 5 days', go: 'agent' },
]

/* The first two options sit side by side with the icon stacked above the
   text; the RM route stays full width with a chevron, so the layout says
   it is a different kind of thing before the copy does. */
function IntroCard({ o, go, stacked }) {
  if (stacked) {
    return (
      <motion.button className="in-card stacked" onClick={() => go(o.go)} variants={riseItem} {...tap}>
        <span className="in-card-stack">
          <span className="in-card-icon"><img src={o.icon} alt="" /></span>
          <span className="in-card-text">
            <span className="fig-title-16">{o.t}</span>
            <span className="fig-sub-14">{o.d}</span>
          </span>
        </span>
      </motion.button>
    )
  }
  return (
    <motion.button className="in-card" onClick={() => go(o.go)} variants={riseItem} {...tap}>
      <span className="in-card-main">
        <span className="in-card-icon"><img src={o.icon} alt="" /></span>
        <span className="in-card-text">
          <span className="fig-title-16">{o.t}</span>
          <span className="fig-sub-14">{o.d}</span>
        </span>
      </span>
      <span className="in-card-chev"><span className="fig-chevron"><img src={A.chevron2} alt="" /></span></span>
    </motion.button>
  )
}

/* Shared across the intro and the loading state. The orb carries a layoutId
   so Framer treats it as one element travelling between screens — it holds
   still from intro to loading, then shrinks into the reschedule header. */
export function NiaHero({ animate = true }) {
  return (
    <motion.div className="in-hero">
      <motion.div className="in-orb" layoutId="nia-orb" variants={animate ? orbIn : undefined}>
        <Sphere3D size={128} />
      </motion.div>
      <motion.div className="in-id" layout>
        {/* the pill chrome cross-fades, the words themselves travel */}
        <motion.span className="in-pill" variants={animate ? fadeItem : undefined}>
          <motion.span layoutId="nia-name" className="nia-name">Nia AI</motion.span>
        </motion.span>
        <motion.div className="in-tooltip" variants={animate ? fadeItem : undefined}>
          <img className="in-pointer" src={A.pointer} alt="" />
          <div className="in-tip-body">
            <span className="in-dot"><i /></span>
            <span className="in-tip-text">Your installment is 3 days late</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export function IntroShell({ children, onBack, stagger: st }) {
  return (
    <div className="in dotgrid">
      <div className="in-header">
        <div className="in-status">
          <span className="in-time">9:41</span>
          <img className="in-notch" src={A.notch} alt="" />
          <img className="in-status-right" src={A.statusRight} alt="" />
        </div>
        <div className="in-nav">
          <motion.button className="in-back" onClick={onBack} aria-label="Back" {...tap}>
            <span className="fig-chevron flip"><img src={A.chevron2} alt="" /></span>
          </motion.button>
          <img className="fig-sep" src={A.separator2} alt="" />
        </div>
      </div>
      <motion.div className="in-body" initial="initial" animate="animate" {...st}>
        {children}
      </motion.div>
      <div className="in-homebar"><i /></div>
    </div>
  )
}

export function Intro({ go, onBack }) {
  const [a, b, c] = INTRO_OPTIONS
  return (
    <IntroShell onBack={onBack} stagger={stagger(0.07, 0.08)}>
      <NiaHero />
      <motion.div className="in-main" layout>
        <motion.p className="in-title" variants={riseItem}>Three ways to clear this</motion.p>
        <motion.div className="in-options">
          <motion.div className="in-options-group">
            <IntroCard o={a} go={go} stacked />
            <IntroCard o={b} go={go} stacked />
          </motion.div>
          <motion.img className="fig-sep" src={A.separator2} alt="" variants={fadeItem} />
          <IntroCard o={c} go={go} />
        </motion.div>
      </motion.div>
    </IntroShell>
  )
}

/* ---------- 163:3278 — option sheet ---------- */
const OPTIONS = [
  { icon: A.pay, t: 'Pay it now', d: 'Pay it, or move it in seconds', go: 'paid' },
  { icon: A.date, t: 'Move the date', d: 'Up to 5 days. Still no late fee.', go: 'check:reschedule' },
  { icon: A.rm, t: 'Connect to your RM', d: 'For anything longer than 5 days', go: 'check:pause' },
]

export function Sheet({ go }) {
  const [a, b, c] = OPTIONS
  const Card = ({ o }) => (
    <motion.button className="fig-card" onClick={() => go(o.go)} variants={riseItem} {...tap}>
      <span className="fig-card-main">
        <span className="fig-card-icon"><img src={o.icon} alt="" /></span>
        <span className="fig-card-text">
          <span className="fig-title-16">{o.t}</span>
          <span className="fig-sub-14">{o.d}</span>
        </span>
      </span>
      <span className="fig-chevron"><img src={A.chevron} alt="" /></span>
    </motion.button>
  )

  return (
    <Frame blur={7}>
      <div className="fig-sheet-pad">
        <motion.div {...sheetRise}>
          <div className="fig-grabber"><i /></div>
          <motion.div className="fig-sheet" initial="initial" animate="animate" {...stagger(0.06, 0.14)}>
            <motion.div className="fig-sheet-head">
              <motion.div className="fig-orb" variants={orbIn}><Sphere3D size={96} /></motion.div>
              <motion.div className="fig-sheet-title" variants={riseItem}>
                <p className="fig-title-24">₹45,000 EMI due today</p>
                <p className="fig-sub-16">No late fee yet</p>
              </motion.div>
            </motion.div>
            <motion.div className="fig-options">
              <motion.div className="fig-options-group">
                <Card o={a} />
                <Card o={b} />
              </motion.div>
              <motion.img className="fig-sep" src={A.separator} alt="" variants={fadeItem} />
              <Card o={c} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </Frame>
  )
}
