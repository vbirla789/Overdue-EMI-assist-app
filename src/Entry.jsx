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
  sepThin: '/figma/sep-thin.svg',
  pointer: '/figma/pointer.svg',
  iPay: '/figma/ic-pay.svg',
  iDate: '/figma/ic-date.svg',
  iRm: '/figma/ic-rm.svg',
  gridMint: '/figma/grid-mint.svg',
  gridBlue: '/figma/grid-blue.svg',
  gridCream: '/figma/grid-cream.svg',
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

/* ---------- 166:3429 — full-screen intro ---------- */
/* Each card carries its own gradient and a grid vector clipped by the card
   edge — mint for pay, blue for reschedule, cream for the RM route. */
const INTRO_OPTIONS = [
  { icon: A.iPay, grid: A.gridMint, tone: 'mint',
    t: 'Pay ₹45,000', d: 'Clears this month. No late fee.', go: 'success' },
  { icon: A.iDate, grid: A.gridBlue, tone: 'blue',
    t: 'Move the date', d: 'Up to 5 days. Still no late fee.', go: 'loading' },
  { icon: A.iRm, grid: A.gridCream, tone: 'cream',
    t: 'Connect to your RM', d: 'For anything longer than 5 days', go: 'agent' },
]

/* The first two options sit side by side with the icon stacked above the
   text; the RM route stays full width with a chevron, so the layout says
   it is a different kind of thing before the copy does. */
function IntroCard({ o, go, stacked }) {
  const grid = <span className={`in-card-grid ${stacked ? '' : 'wide'}`}><img src={o.grid} alt="" /></span>
  if (stacked) {
    return (
      <motion.button className={`in-card stacked ${o.tone}`} onClick={() => go(o.go)} {...tap}>
        {grid}
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
    <motion.button className={`in-card ${o.tone}`} onClick={() => go(o.go)} {...tap}>
      {grid}
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
/* Animates on explicit props rather than inherited variants. The hero mounts
   once and never unmounts, so these run on load only — and nothing here can
   get stranded at its initial state if a parent stops propagating a label. */
export function NiaHero({ tooltip = true }) {
  const EASE = [0.22, 0.61, 0.36, 1]
  return (
    <div className="in-hero">
      <motion.div
        className="in-orb" layoutId="nia-orb"
        initial={{ opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <Sphere3D size={128} />
      </motion.div>
      <div className="in-id">
        {/* the pill chrome cross-fades, the words themselves travel */}
        <motion.span
          className="in-pill"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: EASE, delay: 0.12 }}
        >
          <motion.span layoutId="nia-name" className="nia-name">Nia AI</motion.span>
        </motion.span>
        {/* The picker drops the status line. Rather than unmounting it — which
            snapped the layout — the wrapper animates its own height to zero and
            eats the flex gap, so the collapse eases instead of jumping. */}
        <motion.div
          className="in-tip-wrap"
          initial={{ opacity: 0 }}
          animate={{
            opacity: tooltip ? 1 : 0,
            height: tooltip ? 42 : 0,
            marginTop: tooltip ? 0 : -8,
          }}
          transition={{ duration: 0.3, ease: EASE, delay: tooltip ? 0.18 : 0 }}
          style={{ pointerEvents: tooltip ? 'auto' : 'none' }}
        >
          <div className="in-tooltip">
            <img className="in-pointer" src={A.pointer} alt="" />
            <div className="in-tip-body">
              <span className="in-dot"><i /></span>
              <span className="in-tip-text">Your installment is 3 days late</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function IntroShell({ children, onBack, tight }) {
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
      {/* layout animates the height change as the block below the hero swaps,
          so the surrounding space eases instead of snapping.

          No initial/animate variant labels here: a label on this element is
          propagated to every motion descendant and overrides their own props,
          which left the sphere, the pill and the tooltip stranded at their
          initial values. Each descendant animates itself instead. */}
      <motion.div className={`in-body ${tight ? 'tight' : ''}`} layout>
        {children}
      </motion.div>
      <div className="in-homebar"><i /></div>
    </div>
  )
}

/* Only the block below the hero. The shell and the sphere are owned by App and
   stay mounted, so nothing about the assistant re-animates when this swaps. */
export function IntroBody({ go }) {
  const [a, b, c] = INTRO_OPTIONS
  return (
    <div className="in-main">
      <p className="in-title">Three ways to clear this</p>
      <div className="in-options">
        <div className="in-options-group">
          <IntroCard o={a} go={go} stacked />
          <IntroCard o={b} go={go} stacked />
        </div>
        {/* 202:284566 — an "or" rule rather than a plain separator, so the
            RM route reads as an alternative to the pair above it */}
        <div className="fx-or">
          <img src={A.sepThin} alt="" />
          <span className="fig-sub-14">or</span>
          <img src={A.sepThin} alt="" />
        </div>
        <IntroCard o={c} go={go} />
      </div>
    </div>
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
    <motion.button className="fig-card" onClick={() => go(o.go)} {...tap}>
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
