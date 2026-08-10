import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { screenSlide, sharedFade } from './motion'

/* these three hand the sphere between them, so they share one presence key
   and Framer animates the orb instead of swapping whole screens */
const SHARED = new Set(['intro', 'loading', 'resched'])
import Part1 from './Part1'
import Part2 from './Part2'
import { Sheet, Intro } from './Entry'
import { Loading, Reschedule, Agent, Success } from './Flow'

const NAV = [
  {
    label: 'Part 1 — assistant flow',
    items: [
      ['intro', 'Intro screen', 'From Figma — full screen'],
      ['loading', 'Loading — running', 'From Figma — checks resolve one by one'],
      ['loading:3', 'Loading — all done', 'From Figma — final state'],
      ['resched', 'Reschedule date', 'From Figma — user picks, nothing preselected'],
      ['agent', 'Your agent', 'From Figma — handoff as a chat thread'],
      ['success', 'Payment success', 'From Figma — the pay-now outcome'],
      ['moved', 'Reschedule success', 'From Figma — carries the date picked'],
      ['sheet', 'Options sheet', 'From Figma — earlier sheet version'],
      ['intent', 'Intent / proposal', 'Earlier version, kept for reference'],
      ['check:reschedule', 'Streaming — reschedule', 'Earlier streaming version'],
      ['adjust', 'Pick a date', 'Earlier picker version'],
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
  'intro': 'Built 1:1 from Figma (194:228975). The two self-serve options sit side by side; the RM route stays full width below a rule, so the layout says it is a different kind of thing before the copy does.',
  'loading': 'Built 1:1 from Figma (187:184623). The hero does not move — the sphere is literally the same element as on the intro, so only the lower half changes and the assistant never appears to restart. When the checks finish the dates take their place — the sphere still does not move.',
  'loading:3': 'The settled state. All three findings are readable, and the CIBIL line answers the thing people are most afraid of before they ask.',
  'resched': 'Built 1:1 from Figma (205:295611). Nothing is preselected, so the assistant never appears to have chosen for you. The "or" rule separates what the assistant can do from what needs a person.',
  'success': 'Built 1:1 from Figma (180:118152). The mark lands first with a little weight, then the copy, then the receipt — so the relief arrives before the detail. Late fee ₹0 is the line that matters most to someone who was late.',
  'moved': 'Built 1:1 from Figma (183:129204). Same shell as the paid outcome, different truth — the EMI is still owed, just later, so the subline confirms the lateness has stopped rather than claiming nothing is due. The date comes from whichever day the user picked.',
  'agent': 'Built 1:1 from Figma (184:151339). The handoff is a thread, not a status screen — Ayush opens with your case already in hand, so the promise is visible rather than described.',
  'sheet': 'Built 1:1 from Figma (163:3278). The amount stays in the header, so the number never moves between toast and sheet. The RM option sits below a rule — it is a different kind of thing, and the layout says so before the copy does.',
  'intent': 'One line of problem, three options, one escape. The options are exactly what the assistant is allowed to do — and option 3 says “goes to a person” up front, so escalation is never a surprise.',
  'check:reschedule': 'Not a spinner. Named checks, real answers, and the offer is visibly built from them. The last check states the 5-day ceiling before anything is promised.',
  'adjust': 'The assistant never picks for you — it offers the range and says why it stops there. Nothing is selected on arrival, so the CTA can’t be tapped by accident. The 5-day rule is a meter, not an error after the fact, and going past it is an offer rather than a wall.',
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

/* The rail is gone, so the states that aren't on the happy path — the four
   escalations, the two failures, Part 2 — have no visible entry point. They
   stay reachable by deep link: ?s=escalate:pause, ?s=p2:partial, and so on.
   Keys are the same ids listed in NAV. */
const deepLink = () => {
  const s = new URLSearchParams(window.location.search).get('s')
  return s && ALL_SCREENS.has(s) ? s : 'intro'
}
const ALL_SCREENS = new Set(NAV.flatMap((g) => g.items.map(([id]) => id)))

export default function App() {
  const [screen, setScreen] = useState(deepLink)
  const [movedTo, setMovedTo] = useState(null)

  const go = (s) => {
    if (s === 'home') return setScreen('p2:success')
    if (s === 'assistant') return setScreen('intent')
    setScreen(s)
  }

  const isP2 = screen.startsWith('p2:')

  return (
    <div className="wb">
      <main className="wb-main">
        <div className="device">
        <div className="device-inner">
        <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div className="wb-stage" key={SHARED.has(screen) ? 'shared' : screen} {...(SHARED.has(screen) ? sharedFade : screenSlide)}>
            {screen === 'intro' ? <Intro go={go} onBack={() => setScreen('intro')} />
              : screen === 'loading' ? <Loading key="run" onBack={() => setScreen('intro')} onDone={() => setScreen('resched')} />
              : screen === 'loading:3' ? <Loading key="done" step={3} onBack={() => setScreen('intro')} />
              : screen === 'resched' ? <Reschedule go={go} onClose={() => setScreen('intro')} onPick={(d) => { setMovedTo(d); setScreen('moved') }} />
              : screen === 'agent' ? <Agent onClose={() => setScreen('intro')} />
              : screen === 'success' ? <Success onClose={() => setScreen('intro')} />
              : screen === 'moved' ? <Success moved={movedTo ?? { label: '13 August' }} onClose={() => setScreen('intro')} />
              : screen === 'sheet' ? <Sheet go={go} />
              : isP2
                ? <Part2 screen={screen.slice(3)} go={(s) => go(['home', 'assistant'].includes(s) ? s : 'p2:' + s)} />
                : <Part1 screen={screen} go={go} />}
          </motion.div>
        </AnimatePresence>
        </LayoutGroup>
        </div>
        </div>
      </main>
    </div>
  )
}
