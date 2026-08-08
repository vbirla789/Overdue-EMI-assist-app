import { useState } from 'react'
import Part1 from './Part1'
import Part2 from './Part2'

const NAV = [
  {
    label: 'Part 1 — assistant flow',
    items: [
      ['intent', 'Intent / proposal', 'What Assist can do, before anything happens'],
      ['check:reschedule', 'Streaming — reschedule', 'Named checks, real findings'],
      ['proposal', 'Proposal', 'The 5-day offer, with its limit stated'],
      ['adjust', 'Confirmation / adjust', 'Pick a date; the limit is visible'],
      ['done', 'Rescheduled', 'Confirmed outcome'],
      ['check:pause', 'Streaming — hardship pause', 'A check that ends in escalation'],
      ['escalate:pause', 'Escalation — pause', 'Handoff to a person'],
      ['escalate:beyond', 'Escalation — past 5 days', 'Same handoff, different reason'],
      ['escalate:declined', 'Escalation — declined all', 'Fixed trigger'],
      ['check:unknown', 'Streaming — can’t verify', 'Eligibility unknown'],
      ['escalate:unknown', 'Escalation — unknown', 'Fixed trigger'],
      ['misread', 'Failure — misunderstood', 'Repair before acting'],
      ['failed', 'Failure — couldn’t complete', 'System failed, user is safe'],
    ],
  },
  {
    label: 'Part 2 — payment confirmation',
    items: [
      ['p2:before', 'Before (the brief)', '“Payment successful” + OK'],
      ['p2:success', 'Paid in full', 'Receipt, progress, what’s next'],
      ['p2:partial', 'Partial payment', 'Applied against a larger due'],
      ['p2:failed', 'Failed + retry', 'Declined, nothing charged'],
      ['p2:duplicate', 'Already paid', 'Reassurance, not an error'],
    ],
  },
]

const NOTES = {
  'intent': 'One line of problem, three options, one escape. The options are exactly what the assistant is allowed to do — and option 3 says “goes to a person” up front, so escalation is never a surprise.',
  'check:reschedule': 'Not a spinner. Named checks, real answers, and the offer is visibly built from them. The last check states the 5-day ceiling before anything is promised.',
  'proposal': 'Says why it can help, then names its own limit. Stating the limit early is what stops escalation feeling like rejection.',
  'adjust': 'The 5-day rule as a meter, not an error after the fact. Going past it is an offer, not a wall.',
  'done': 'Ends the anxiety in the headline. Ref number in the footnote, not the hero.',
  'check:pause': 'Same grammar as the reschedule check, so it’s trusted — but check 2 turns the answer, and check 3 already names who can help.',
  'escalate:pause': 'The graded moment. Three lines answer the three worries: she knows, she calls by 6 PM, nothing bad happens meanwhile. Header switches to Rhea — the assistant steps aside.',
  'escalate:beyond': 'Same handoff, honest reason: “past my limit”. Framed as the assistant’s ceiling, never as the user being refused.',
  'escalate:declined': 'Fixed trigger. Takes the user’s side — “I’ve only got three options” — instead of dead-ending.',
  'check:unknown': 'The failure shows up inside the streaming state, on the check that failed. Better than a silent pass and a confidently wrong offer.',
  'escalate:unknown': '“I won’t guess.” An assistant admitting uncertainty is the trust behaviour being tested.',
  'misread': 'Repair before acting. Quotes the user, states its wrong reading, asks. Locked footnote confirms nothing changed.',
  'failed': 'Answers in order: was I charged (₹0), where do I stand (unchanged), what now (retry). Fault named as ours, with a promise not to loop the user.',
  'p2:before': 'The brief’s starting point.',
  'p2:success': 'The old screen said what happened. This says what it means: 7 of 12, how much is left, when the next one goes out.',
  'p2:partial': 'The trap is celebrating. Bar is split paid / owed so it reads honestly, and the warning is specific: date, ₹350, credit report.',
  'p2:failed': '“No money left your account” is what a declined user needs first, so it’s the second line, in bold. Bank’s real reason quoted so they know what to fix.',
  'p2:duplicate': 'This user is confused, not transacting. Reassurance and the old receipt — not an error state.',
}

export default function App() {
  const [screen, setScreen] = useState('intent')

  const go = (s) => {
    if (s === 'home') return setScreen('p2:success')
    if (s === 'assistant') return setScreen('intent')
    setScreen(s)
  }

  const isP2 = screen.startsWith('p2:')

  return (
    <div className="wb">
      <aside className="wb-side">
        <div className="wb-title">Overdue EMI — Assist</div>
        <div className="wb-sub">Working prototype. Every state is reachable by clicking inside the phone; this list is just a shortcut.</div>

        {NAV.map((g) => (
          <div className="wb-group" key={g.label}>
            <div className="wb-label">{g.label}</div>
            {g.items.map(([id, t, d]) => (
              <button key={id} className={`wb-item ${screen === id ? 'on' : ''}`} onClick={() => setScreen(id)}>
                {t}<small>{d}</small>
              </button>
            ))}
          </div>
        ))}
      </aside>

      <main className="wb-main">
        {isP2
          ? <Part2 screen={screen.slice(3)} go={(s) => go(['home', 'assistant'].includes(s) ? s : 'p2:' + s)} />
          : <Part1 screen={screen} go={go} />}
        {NOTES[screen] && <div className="wb-note"><b>Why this way — </b>{NOTES[screen]}</div>}
      </main>
    </div>
  )
}
