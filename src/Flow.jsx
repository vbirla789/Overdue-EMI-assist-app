import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stagger, riseItem, fadeItem, orbIn, tap, EASE } from './motion'
import { IntroShell, NiaHero } from './Entry'
import Sphere3D from './Sphere3D'

/* Part 1 screens, built 1:1 from Figma
   unBox-benchmarking · section 169:7315
   Loading 168:3813–168:3922 · Reschedule 168:4190 · Agent 169:7234 */

const F = {
  notch: '/figma/notch2.svg',
  statusRight: '/figma/statusbar-right2.svg',
  rail: '/figma/check-rail.svg',
  tick: '/figma/check-tick.svg',
  calBig: '/figma/ic-date.svg',
  sepDashed: '/figma/sep-dashed.svg',
  sepThin: '/figma/sep-thin.svg',
  iRm: '/figma/ic-rm.svg',
  gridCream: '/figma/grid-cream.svg',
  chevron: '/figma/chevron3.svg',
  avatar: '/figma/rm-avatar.png',
  sepChat: '/figma/sep-chat.svg',
  send: '/figma/send.svg',
  orb: '/figma/orb.png',
  tickHero: '/figma/success-tick.svg',
  sepRow: '/figma/sep-row.svg',
  cross: '/figma/cross.svg',
}

function StatusBar() {
  return (
    <div className="fx-status">
      <img className="fx-notch" src={F.notch} alt="" />
      <span className="fx-time">9:41</span>
      <img className="fx-status-right" src={F.statusRight} alt="" />
    </div>
  )
}

const HomeBar = () => <div className="fx-homebar"><i /></div>

/* ---------- Loading · 4 states ---------- */
const CHECKS = [
  { t: 'Payment history', d: '11 of 12 instalments were on time' },
  { t: 'Account standing', d: 'Good, no active holds' },
  { t: 'CIBIL report', d: 'Nothing reported yet' },
]

export function LoadingBody({ onDone, step: fixedStep }) {
  const [step, setStep] = useState(fixedStep ?? 0)
  /* held in a ref so a new callback identity from the parent doesn't restart
     the sequence, and so the effect needs no once-only guard — a guard plus
     StrictMode's double-invoke silently swallowed the final timer. */
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    if (fixedStep !== undefined) return
    if (step > CHECKS.length) {
      const t = setTimeout(() => done.current?.(), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 500 : 1150)
    return () => clearTimeout(t)
  }, [step, fixedStep])

  return (
      <div className="fx-checks">
          <img className="fx-rail" src={F.rail} alt="" />
          <div className="fx-check-list">
            {CHECKS.map((c, i) => {
              const done = step >= i + 1
              const active = !done && step === i
              return (
                <div className={`fx-check ${done ? '' : 'pending'}`} key={c.t}>
                  <span className={`fx-check-mark ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                    {done
                      ? <motion.img
                          src={F.tick} alt=""
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.26, ease: EASE }}
                        />
                      : <i />}
                  </span>
                  <span className="fx-check-text">
                    <span className="fx-title-16">{c.t}</span>
                    <AnimatePresence>
                      {done && (
                        <motion.span
                          className="fx-sub-14"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: EASE, delay: 0.08 }}
                        >
                          {c.d}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </div>
              )
            })}
        </div>
      </div>
  )
}

/* ---------- Success · 180:118152 (paid) and 183:129204 (moved) ----------
   Same shell, two outcomes. `moved` carries the date the user picked, so the
   headline and the receipt always agree with the choice they made. */
export function Success({ onClose, moved }) {
  const EASE_OUT = [0.22, 0.61, 0.36, 1]

  const title = moved ? `EMI moved to ${moved.label}` : '₹45,000 paid. You’re all clear.'
  const sub = moved ? 'Nothing is overdue any more' : 'Nothing else is due this month'
  const rows = moved
    ? [
        ['Due amount', '₹45,000', false],
        ['New due date', `${moved.label}, 2026`, false],
        ['Late fee', '₹0', true],
      ]
    : [
        ['Late fee', '₹0', true],
        ['Next EMI', '5 September, 2026', false],
      ]

  return (
    <div className="fx fx-success dotgrid">
      <StatusBar />
      <div className="fx-succ-nav">
        <motion.button className="fx-close" onClick={onClose} aria-label="Close" {...tap}>
          <span className="fx-cross"><img src={F.cross} alt="" /></span>
        </motion.button>
      </div>

      <div className="fx-succ-body">
        <motion.div className="fx-succ-top" initial="initial" animate="animate" {...stagger(0.09, 0.12)}>
          <motion.div className="fx-succ-hero" variants={fadeItem}>
            {/* the mark lands with a little weight, then the copy follows */}
            <motion.img
              className="fx-succ-tick" src={F.tickHero} alt=""
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1.2, 0.4, 1], delay: 0.08 }}
            />
            <motion.div className="fx-succ-text" variants={riseItem}>
              <p className={`fx-succ-title ${moved ? 'wide' : ''}`}>{title}</p>
              <p className="fx-succ-sub">{sub}</p>
            </motion.div>
          </motion.div>

          <motion.div className="fx-succ-card" variants={riseItem}>
            <p className="fx-title-16">Transaction Details</p>
            <div className="fx-succ-rows">
              {rows.map(([k, v, good], i) => (
                <div key={k} style={{ display: 'contents' }}>
                  {i > 0 && <img className="fx-sep" src={F.sepRow} alt="" />}
                  <div className="fx-succ-row">
                    <span className="fx-succ-k">{k}</span>
                    <span className={`fx-succ-v ${good ? 'good' : ''}`}>{v}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.button
          className="fx-succ-cta" onClick={onClose}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: EASE_OUT, delay: 0.5 }}
          whileTap={{ scale: 0.985 }}
        >
          Done
        </motion.button>
      </div>
      <HomeBar />
    </div>
  )
}

/* ---------- Reschedule date · 168:4190 ---------- */
const DAYS = [
  { d: 9, w: 'Saturday', label: '9 August' },
  { d: 10, w: 'Sunday', label: '10 August' },
  { d: 11, w: 'Monday', label: '11 August' },
  { d: 12, w: 'Tuesday', label: '12 August' },
  { d: 13, w: 'Wednesday', label: '13 August' },
]

/* Defined outside Reschedule on purpose. Declaring it inside makes React see
   a brand-new component type on every render, so selecting a date remounted
   all five cells and replayed their enter animation. */
function Cell({ day, sel, setSel }) {
  return (
    <motion.button
      className={`fx-day ${sel === day.d ? 'on' : ''}`}
      onClick={() => setSel(day.d)}
      variants={riseItem}
      whileTap={{ scale: 0.96 }}
    >
      <span className="fx-day-n">{day.d}</span>
      <span className="fx-day-w">{day.w}</span>
    </motion.button>
  )
}

export function PickerBody({ go, onPick }) {
  const [sel, setSel] = useState(null)
  /* hold on the selected state briefly so the choice is visibly registered
     before the screen changes — otherwise the tap feels unacknowledged */
  const choose = (d) => {
    setSel(d)
    const day = DAYS.find((x) => x.d === d)
    setTimeout(() => onPick?.(day), 420)
  }
  const cell = (i) => <Cell day={DAYS[i]} sel={sel} setSel={choose} />

  return (
      <div className="fx-pick">
        <p className="fx-title-24">Which day works?</p>
        <div className="fx-days">
          <div className="fx-day-row">{cell(0)}{cell(1)}{cell(2)}</div>
          <div className="fx-day-row centred">{cell(3)}{cell(4)}</div>
        </div>

        <div className="fx-or">
          <img src={F.sepThin} alt="" />
          <span className="fx-sub-14">or</span>
          <img src={F.sepThin} alt="" />
        </div>

        <motion.button className="fx-card" onClick={() => go('agent')} {...tap}>
          <span className="fx-card-grid"><img src={F.gridCream} alt="" /></span>
          <span className="fx-card-main">
            <span className="fx-card-icon"><img src={F.iRm} alt="" /></span>
            <span className="fx-card-text">
              <span className="fx-title-16">Connect to your RM</span>
              <span className="fx-sub-14">For anything longer than 5 days</span>
            </span>
          </span>
          <span className="fx-chev"><img src={F.chevron} alt="" /></span>
        </motion.button>
      </div>
  )
}

/* ---------- Your agent · 169:7234 ---------- */
const THREAD = [
  { from: 'them', text: 'Hey Vishal', time: '7:56 PM' },
  { from: 'them', text: 'I’ve got your case no need to explain it again. I’ll call you before 6 PM today. Nothing is charged till then.', time: '8:00 PM' },
  { from: 'me', text: 'I need your help to extend this for month', time: '7:56 PM' },
]

export function Agent({ onClose }) {
  return (
    <div className="fx fx-agent-screen dotgrid">
      <StatusBar />
      <div className="fx-pad">
        <motion.div
          className="fx-agent"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div className="fx-agent-row">
            <motion.button className="fx-back" onClick={onClose} aria-label="Back" {...tap}>
              <span className="fx-chev flip"><img src={F.chevron} alt="" /></span>
            </motion.button>
            <div className="fx-avatar"><img src={F.avatar} alt="" /></div>
            <div className="fx-agent-name">
              <span className="fx-title-16">Ayush Sehgal (RM)</span>
              <span className="fx-sub-14">online</span>
            </div>
          </div>
          <img className="fx-sep" src={F.sepChat} alt="" />
        </motion.div>

        <div className="fx-chat">
          <motion.div className="fx-thread" initial="initial" animate="animate" {...stagger(0.14, 0.18)}>
            <motion.div className="fx-msg-group">
              {THREAD.filter((m) => m.from === 'them').map((m) => (
                <motion.div className="fx-bubble them" key={m.text} variants={riseItem}>
                  <p className="fx-msg">{m.text}</p>
                  <span className="fx-time-stamp">{m.time}</span>
                </motion.div>
              ))}
            </motion.div>
            <motion.div className="fx-msg-out">
              {THREAD.filter((m) => m.from === 'me').map((m) => (
                <motion.div className="fx-bubble me" key={m.text} variants={riseItem}>
                  <p className="fx-msg">{m.text}</p>
                  <span className="fx-time-stamp">{m.time}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="fx-composer"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: EASE, delay: 0.3 }}
          >
            <span className="fx-placeholder">Send a message...</span>
            <motion.button className="fx-send" {...tap}><img src={F.send} alt="Send" /></motion.button>
          </motion.div>
        </div>
      </div>
      <HomeBar />
    </div>
  )
}
