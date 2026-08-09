import { useEffect, useRef, useState } from 'react'
import ParticleSphere from './ParticleSphere'

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
    <div className="fx fx-loading">
      <StatusBar />
      <div className="fx-load-body">
        <div className="fx-load-orb-row">
          <div className="fx-orb-96"><ParticleSphere size={94} /></div>
        </div>
        <div className="fx-checks">
          <img className="fx-rail" src={F.rail} alt="" />
          <div className="fx-check-list">
            {CHECKS.map((c, i) => {
              const done = step > i + 0 && step >= i + 1
              return (
                <div className="fx-check" key={c.t}>
                  <span className={`fx-check-mark ${done ? 'done' : ''}`}>
                    {done ? <img src={F.tick} alt="" /> : <i />}
                  </span>
                  <span className="fx-check-text">
                    <span className="fx-title-16">{c.t}</span>
                    {done && <span className="fx-sub-14 fade">{c.d}</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
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
    <button className={`fx-day ${sel === day.d ? 'on' : ''}`} onClick={() => setSel(day.d)}>
      <span className="fx-day-n">{day.d}</span>
      <span className="fx-day-w">{day.w}</span>
    </button>
  )

  return (
    <div className="fx fx-resched">
      <StatusBar />
      <div className="fx-pad">
        <div className="fx-agent">
          <div className="fx-agent-row">
            <div className="fx-orb-40"><ParticleSphere size={38} /></div>
            <div className="fx-agent-name">
              <span className="fx-title-16">Nia AI</span>
              <span className="fx-sub-14">Move the date</span>
            </div>
          </div>
          <img className="fx-sep" src={F.sepDashed} alt="" />
        </div>

        <div className="fx-resched-body">
          <div className="fx-resched-top">
            <div className="fx-pick">
              <img className="fx-cal" src={F.calBig} alt="" />
              <p className="fx-title-24">Which day works?</p>
              <div className="fx-days">
                <div className="fx-day-row"><Cell day={DAYS[0]} /><Cell day={DAYS[1]} /></div>
                <div className="fx-day-row"><Cell day={DAYS[2]} /><Cell day={DAYS[3]} /></div>
                <div className="fx-day-row single"><Cell day={DAYS[4]} /></div>
              </div>
            </div>

            <div className="fx-or">
              <img src={F.sepThin} alt="" />
              <span className="fx-sub-14">or</span>
              <img src={F.sepThin} alt="" />
            </div>

            <button className="fx-card" onClick={() => go('agent')}>
              <span className="fx-card-main">
                <span className="fx-card-icon"><img src={F.iRm} alt="" /></span>
                <span className="fx-card-text">
                  <span className="fx-title-16">Connect to your RM</span>
                  <span className="fx-sub-14">For anything longer than 5 days</span>
                </span>
              </span>
              <span className="fx-chev"><img src={F.chevron} alt="" /></span>
            </button>
          </div>
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
    <div className="fx fx-agent-screen">
      <StatusBar />
      <div className="fx-pad">
        <div className="fx-agent">
          <div className="fx-agent-row">
            <div className="fx-avatar"><img src={F.avatar} alt="" /></div>
            <div className="fx-agent-name">
              <span className="fx-title-16">Ayush Sehgal</span>
              <span className="fx-sub-14">Relationship manager · online</span>
            </div>
          </div>
          <img className="fx-sep" src={F.sepChat} alt="" />
        </div>

        <div className="fx-chat">
          <div className="fx-thread">
            <div className="fx-msg-group">
              {THREAD.filter((m) => m.from === 'them').map((m) => (
                <div className="fx-bubble them" key={m.text}>
                  <p className="fx-msg">{m.text}</p>
                  <span className="fx-time-stamp">{m.time}</span>
                </div>
              ))}
            </div>
            <div className="fx-msg-out">
              {THREAD.filter((m) => m.from === 'me').map((m) => (
                <div className="fx-bubble me" key={m.text}>
                  <p className="fx-msg">{m.text}</p>
                  <span className="fx-time-stamp">{m.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fx-composer">
            <span className="fx-placeholder">Send a message...</span>
            <button className="fx-send"><img src={F.send} alt="Send" /></button>
          </div>
        </div>
      </div>
      <HomeBar />
    </div>
  )
}
