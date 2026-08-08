import { useEffect, useState, useRef } from 'react'
import { Phone, TopBar, Option, Row, Gap, money } from './ui'

const EMI = 4500
const DUE = '5 Aug'
const REF = 'EMI-4821'

const DATES = [
  { d: 9, w: 'Sat', label: '9 Aug', off: 1 },
  { d: 10, w: 'Sun', label: '10 Aug', off: 2 },
  { d: 11, w: 'Mon', label: '11 Aug', off: 3 },
  { d: 12, w: 'Tue', label: '12 Aug', off: 4 },
  { d: 13, w: 'Wed', label: '13 Aug', off: 5 },
]

/* ------------------------------------------------------------------ */
const RUNS = {
  reschedule: {
    title: 'Checking your account…',
    steps: [
      { t: 'Payment history', r: '11 of 12 on time', ms: 1200 },
      { t: 'Account standing', r: 'Good', ms: 1100 },
      { t: 'How far I can move it', r: '5 days', ms: 1100 },
    ],
    next: 'proposal',
  },
  pause: {
    title: 'Checking if I can do this…',
    steps: [
      { t: 'Payment history', r: '11 of 12 on time', ms: 1200 },
      { t: 'Can I approve a pause?', r: 'No — it changes your loan term', ms: 1300, tone: 'warn' },
      { t: 'Who can', r: 'Rhea, your manager. Online now', ms: 1100 },
    ],
    next: 'escalate:pause',
  },
  unknown: {
    title: 'Checking your account…',
    steps: [
      { t: 'Payment history', r: '11 of 12 on time', ms: 1200 },
      { t: 'Account standing', r: 'Can’t read this right now', ms: 1400, tone: 'bad' },
    ],
    next: 'escalate:unknown',
  },
}

function Checking({ run, onDone }) {
  const cfg = RUNS[run]
  const [i, setI] = useState(0)
  const fired = useRef(false)

  useEffect(() => {
    if (i >= cfg.steps.length) {
      if (fired.current) return
      fired.current = true
      const t = setTimeout(onDone, 650)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setI((v) => v + 1), cfg.steps[i].ms)
    return () => clearTimeout(t)
  }, [i, cfg, onDone])

  return (
    <>
      <TopBar mode="think" sub="One moment" />
      <div className="pad stack" style={{ gap: 18 }}>
        <div className="bubble">{cfg.title}</div>
        <div>
          {cfg.steps.map((s, n) => {
            const state = n < i ? 'done' : n === i ? 'run' : 'pend'
            return (
              <div className={`check ${state === 'pend' ? 'pend' : ''}`} key={n}>
                <span className={`check-dot ${state === 'pend' ? '' : state}`}>✓</span>
                <span>
                  <span className="check-t">{s.t}</span>
                  {state === 'done' && (
                    <span className="check-r fade" style={s.tone ? { color: `var(--${s.tone})` } : undefined}>{s.r}</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="spacer" />
      <div className="pad" style={{ paddingBottom: 24 }}>
        <p className="small">Nothing changes until you say so.</p>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
export default function Part1({ screen, go }) {
  const [date, setDate] = useState(DATES[4])
  const [draft, setDraft] = useState('')
  const s = screen

  /* ---------- intent ---------- */
  if (s === 'intent') return (
    <Phone>
      <div className="screen">
        <TopBar mode="ai" sub="About your EMI" onClose={() => {}} />
        <div className="pad stack" style={{ gap: 14 }}>
          <div className="bubble">
            Your EMI of <b>{money(EMI)}</b> is 3 days late. I can sort it out now.
          </div>

          <div className="card" style={{ background: 'var(--line-2)', border: 'none', padding: '4px 16px' }}>
            <Row k="Was due" v={DUE} />
            <Row k="Late fee" v="₹0" sub="waived till 11 Aug" tone="good" />
          </div>

          <Option icon="💳" title={`Pay ${money(EMI)} now`} desc="Done in a tap" onClick={() => go('paid')} />
          <Option icon="📅" title="Move my due date" desc="Up to 5 days — I can do this" onClick={() => go('check:reschedule')} />
          <Option icon="🤝" title="I need longer" desc="Goes to a person" onClick={() => go('check:pause')} />

          <div className="input">
            <input
              placeholder="Or just tell me…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && draft.trim() && go('misread')}
            />
            <button disabled={!draft.trim()} onClick={() => draft.trim() && go('misread')}>↑</button>
          </div>

          <button className="link" onClick={() => go('escalate:declined')}>None of these work</button>
        </div>
      </div>
    </Phone>
  )

  /* ---------- streaming ---------- */
  if (s.startsWith('check:')) {
    const run = s.split(':')[1]
    return (
      <Phone><div className="screen"><Checking run={run} onDone={() => go(RUNS[run].next)} /></div></Phone>
    )
  }

  /* ---------- proposal ---------- */
  if (s === 'proposal') return (
    <Phone>
      <div className="screen">
        <TopBar mode="ai" sub="Here’s what I can do" />
        <div className="pad stack" style={{ gap: 14 }}>
          <div className="bubble">
            You pay on time, so I can move this to <b>13 Aug</b>.
            <br />That’s 5 days — my limit without a manager.
          </div>

          <div className="card">
            <Row k="Amount" v={money(EMI)} />
            <Row k="Due date" v={<><s style={{ color: 'var(--ink-3)', fontWeight: 400 }}>{DUE}</s>&nbsp; 13 Aug</>} />
            <Row k="Extra cost" v="₹0" tone="good" />
          </div>
        </div>
        <div className="spacer" />
        <div className="footer">
          <button className="btn brand" onClick={() => { setDate(DATES[4]); go('done') }}>Move to 13 Aug</button>
          <button className="btn ghost" onClick={() => go('adjust')}>Choose another date</button>
        </div>
      </div>
    </Phone>
  )

  /* ---------- adjust ---------- */
  if (s === 'adjust') return (
    <Phone>
      <div className="screen">
        <TopBar mode="ai" sub="Pick a date" />
        <div className="pad stack" style={{ gap: 16 }}>
          <div className="bubble">Anything up to 13 Aug works.</div>

          <div className="stack" style={{ gap: 10 }}>
            <div className="dates">
              {DATES.map((d) => (
                <button key={d.d} className={`date ${date.d === d.d ? 'on' : ''}`} onClick={() => setDate(d)}>
                  <b>{d.d}</b><span>{d.w}</span>
                </button>
              ))}
            </div>
            <div className="limit">
              <span>{date.off} of 5 days</span>
              <span className="limit-bar"><i style={{ width: `${(date.off / 5) * 100}%` }} /></span>
              <span>my limit</span>
            </div>
          </div>

          <Option icon="🗓️" title="I need past 13 Aug" desc="Rhea, your manager, decides that" onClick={() => go('escalate:beyond')} />
        </div>
        <div className="spacer" />
        <div className="footer">
          <button className="btn brand" onClick={() => go('done')}>Move to {date.label}</button>
          <button className="btn ghost" onClick={() => go('intent')}>Back</button>
        </div>
      </div>
    </Phone>
  )

  /* ---------- done ---------- */
  if (s === 'done') return (
    <Phone>
      <div className="screen">
        <Gap h={56} />
        <div className="pad stack" style={{ gap: 18 }}>
          <div className="hero good">✓</div>
          <div>
            <h1 className="h1">Moved to {date.label}.</h1>
            <p className="body" style={{ marginTop: 6 }}>Nothing’s overdue any more.</p>
          </div>
          <div className="card">
            <Row k="Pay" v={money(EMI)} />
            <Row k="By" v={date.label} />
            <Row k="Late fee" v="₹0" tone="good" />
          </div>
          <p className="small">I’ll remind you on {date.d - 1} Aug · Ref {REF}</p>
        </div>
        <div className="spacer" />
        <div className="footer">
          <button className="btn" onClick={() => go('intent')}>Done</button>
        </div>
      </div>
    </Phone>
  )

  /* ---------- paid ---------- */
  if (s === 'paid') return (
    <Phone>
      <div className="screen">
        <Gap h={56} />
        <div className="pad stack" style={{ gap: 18 }}>
          <div className="hero good">✓</div>
          <div>
            <h1 className="h1">Paid. You’re on track.</h1>
            <p className="body" style={{ marginTop: 6 }}>{money(EMI)} sent. Nothing overdue.</p>
          </div>
          <div className="card">
            <Row k="Late fee" v="₹0" tone="good" />
            <Row k="Next EMI" v="5 Sep" />
          </div>
        </div>
        <div className="spacer" />
        <div className="footer"><button className="btn" onClick={() => go('intent')}>Done</button></div>
      </div>
    </Phone>
  )

  /* ---------- escalation ---------- */
  if (s.startsWith('escalate:')) {
    const why = s.split(':')[1]
    const line = {
      pause: 'A pause changes your loan term — I can’t approve that.',
      beyond: 'More than 5 days is past my limit.',
      declined: 'I’ve only got three options, and none fit.',
      unknown: 'I couldn’t read your account, so I won’t guess.',
    }[why]

    return (
      <Phone>
        <div className="screen">
          <TopBar mode="person" sub="Your manager · online" />
          <div className="pad stack" style={{ gap: 18 }}>
            <div>
              <h1 className="h1">Rhea’s taking over.</h1>
              <p className="body" style={{ marginTop: 6 }}>{line}</p>
            </div>

            <div className="card" style={{ background: 'var(--human-soft)', border: 'none' }}>
              <div className="step">
                <span className="step-n">1</span>
                <span><span className="step-t">She has your case</span><span className="step-d">No need to explain again.</span></span>
              </div>
              <div className="step">
                <span className="step-n">2</span>
                <span><span className="step-t">She calls you today, by 6 PM</span><span className="step-d">On ····9012.</span></span>
              </div>
              <div className="step">
                <span className="step-n">3</span>
                <span><span className="step-t">Nothing happens till then</span><span className="step-d">No late fee. No credit report.</span></span>
              </div>
            </div>

            <p className="small">Ref {REF} · saved to your chats</p>
          </div>
          <div className="spacer" />
          <div className="footer">
            <button className="btn human" onClick={() => go('intent')}>Call Rhea now</button>
            <button className="btn ghost" onClick={() => go('intent')}>Wait for her call</button>
          </div>
        </div>
      </Phone>
    )
  }

  /* ---------- misunderstood ---------- */
  if (s === 'misread') return (
    <Phone>
      <div className="screen">
        <TopBar mode="ai" sub="Checking I got that right" />
        <div className="pad stack" style={{ gap: 14 }}>
          <div className="bubble me">can i just skip this month</div>
          <div className="bubble">
            I read that as <b>move the date by a few days</b>. Skipping a month is different — which did you mean?
          </div>

          <Option icon="📅" title="Move it a few days" desc="I can do this now" onClick={() => go('check:reschedule')} />
          <Option icon="🤝" title="Skip the month" desc="Rhea handles that" onClick={() => go('check:pause')} />
          <Option icon="✍️" title="Neither — let me retype" onClick={() => go('intent')} />

          <p className="small">🔒 Nothing’s changed. Still {money(EMI)}, still due {DUE}.</p>
        </div>
      </div>
    </Phone>
  )

  /* ---------- couldn't complete ---------- */
  if (s === 'failed') return (
    <Phone>
      <div className="screen">
        <Gap h={56} />
        <div className="pad stack" style={{ gap: 18 }}>
          <div className="hero warn">!</div>
          <div>
            <h1 className="h1">That didn’t go through.</h1>
            <p className="body" style={{ marginTop: 6 }}>Our system timed out — our fault, not yours.</p>
          </div>
          <div className="card">
            <Row k="Charged" v="₹0" tone="good" />
            <Row k="Due date" v={DUE} sub="unchanged" />
          </div>
          <p className="small">If it fails again, I’ll get Rhea instead of asking you twice.</p>
        </div>
        <div className="spacer" />
        <div className="footer">
          <button className="btn brand" onClick={() => go('check:reschedule')}>Try again</button>
          <button className="btn ghost" onClick={() => go('escalate:unknown')}>Get a person</button>
        </div>
      </div>
    </Phone>
  )

  return null
}
