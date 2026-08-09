import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stagger, riseItem, fadeItem, orbIn, tap, EASE } from './motion'

/* Part 1 screens, built 1:1 from Figma
   unBox-benchmarking · section 169:7315
   Loading 168:3813–168:3922 · Reschedule 168:4190 · Agent 169:7234 */

const F = {
  notch: '/figma/notch2.svg',
  statusRight: '/figma/statusbar-right2.svg',
  rail: '/figma/check-rail.svg',
  tick: '/figma/check-tick.svg',
  calBig: '/figma/cal-big.svg',
  sepDashed: '/figma/sep-dashed.svg',
  sepThin: '/figma/sep-thin.svg',
  iRm: '/figma/i-rm2.svg',
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

export function Loading({ onDone, step: fixedStep }) {
  const [step, setStep] = useState(fixedStep ?? 0)
  const fired = useRef(false)

  useEffect(() => {
    if (fixedStep !== undefined) return
    if (step > CHECKS.length) {
      if (fired.current) return
      fired.current = true
      const t = setTimeout(() => onDone?.(), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 500 : 1150)
    return () => clearTimeout(t)
  }, [step, fixedStep, onDone])

  return (
    <div className="fx fx-loading dotgrid">
      <StatusBar />
      <motion.div className="fx-load-body" initial="initial" animate="animate" {...stagger(0.1, 0.05)}>
        <motion.div className="fx-load-orb-row">
          <motion.div className="fx-orb-96" variants={orbIn}><img src={F.orb} alt="" /></motion.div>
        </motion.div>
        <motion.div className="fx-checks" variants={fadeItem}>
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
        </motion.div>
      </motion.div>
      <HomeBar />
    </div>
  )
}

/* ---------- Payment success · 180:118152 ---------- */
export function Success({ onClose }) {
  const EASE_OUT = [0.22, 0.61, 0.36, 1]
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
              <p className="fx-succ-title">₹45,000 paid. You’re all clear.</p>
              <p className="fx-succ-sub">Nothing else is due this month</p>
            </motion.div>
          </motion.div>

          <motion.div className="fx-succ-card" variants={riseItem}>
            <p className="fx-title-16">Transaction Details</p>
            <div className="fx-succ-rows">
              <div className="fx-succ-row">
                <span className="fx-succ-k">Late fee</span>
                <span className="fx-succ-v good">₹0</span>
              </div>
              <img className="fx-sep" src={F.sepRow} alt="" />
              <div className="fx-succ-row">
                <span className="fx-succ-k">Next EMI</span>
                <span className="fx-succ-v">5 September, 2026</span>
              </div>
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
  { d: 9, w: 'Saturday' }, { d: 10, w: 'Sunday' },
  { d: 11, w: 'Monday' }, { d: 12, w: 'Tuesday' },
  { d: 13, w: 'Wednesday' },
]

export function Reschedule({ go }) {
  const [sel, setSel] = useState(null)
  const Cell = ({ day }) => (
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

  return (
    <div className="fx fx-resched dotgrid">
      <StatusBar />
      <div className="fx-pad">
        <motion.div
          className="fx-agent"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div className="fx-agent-row">
            <div className="fx-orb-40"><img src={F.orb} alt="" /></div>
            <div className="fx-agent-name">
              <span className="fx-title-16">Nia AI</span>
              <span className="fx-sub-14">Move the date</span>
            </div>
          </div>
          <img className="fx-sep" src={F.sepDashed} alt="" />
        </motion.div>

        <div className="fx-resched-body">
          <motion.div className="fx-resched-top" initial="initial" animate="animate" {...stagger(0.05, 0.1)}>
            <motion.div className="fx-pick">
              <motion.img className="fx-cal" src={F.calBig} alt="" variants={orbIn} />
              <motion.p className="fx-title-24" variants={riseItem}>Which day works?</motion.p>
              <motion.div className="fx-days">
                <motion.div className="fx-day-row"><Cell day={DAYS[0]} /><Cell day={DAYS[1]} /></motion.div>
                <motion.div className="fx-day-row"><Cell day={DAYS[2]} /><Cell day={DAYS[3]} /></motion.div>
                <motion.div className="fx-day-row single"><Cell day={DAYS[4]} /></motion.div>
              </motion.div>
            </motion.div>

            <motion.div className="fx-or" variants={fadeItem}>
              <img src={F.sepThin} alt="" />
              <span className="fx-sub-14">or</span>
              <img src={F.sepThin} alt="" />
            </motion.div>

            <motion.button className="fx-card" onClick={() => go('agent')} variants={riseItem} {...tap}>
              <span className="fx-card-main">
                <span className="fx-card-icon"><img src={F.iRm} alt="" /></span>
                <span className="fx-card-text">
                  <span className="fx-title-16">Connect to your RM</span>
                  <span className="fx-sub-14">For anything longer than 5 days</span>
                </span>
              </span>
              <span className="fx-chev"><img src={F.chevron} alt="" /></span>
            </motion.button>
          </motion.div>
        </div>
      </div>
      <HomeBar />
    </div>
  )
}

/* ---------- Your agent · 169:7234 ---------- */
const THREAD = [
  { from: 'them', text: 'Hey Vishal', time: '7:56 PM' },
  { from: 'them', text: 'I’ve got your case no need to explain it again. I’ll call you before 6 PM today. Nothing is charged till then.', time: '8:00 PM' },
  { from: 'me', text: 'I need your help to extend this for month', time: '7:56 PM' },
]

export function Agent() {
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
            <div className="fx-avatar"><img src={F.avatar} alt="" /></div>
            <div className="fx-agent-name">
              <span className="fx-title-16">Ayush Sehgal</span>
              <span className="fx-sub-14">Relationship manager · online</span>
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
