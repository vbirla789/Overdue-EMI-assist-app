# Overdue EMI — Assist

Working prototype for the PD1 assignment. React + Vite, no dependencies beyond the template.

```
npm install
npm run dev     # http://localhost:5210
```

Left rail = state index. Everything is also reachable by clicking inside the phone.

---

## Part 1 — the assistant flow

| Required state | Screens |
|---|---|
| Intent / proposal | `intent` |
| Streaming / loading | `check:reschedule`, `check:pause`, `check:unknown` |
| Confirmation | `proposal`, `adjust`, `done` |
| Escalation handoff | `escalate:pause`, `escalate:beyond`, `escalate:declined`, `escalate:unknown` |
| Failure / repair | `misread` (misunderstood), `failed` (couldn't complete) |

**All four fixed escalation triggers are wired:**
1. hardship pause → `escalate:pause`
2. reschedule beyond 5 days → `escalate:beyond`
3. user declines all three options → `escalate:declined`
4. eligibility can't be determined → `escalate:unknown`

Three decisions worth calling out:

- **The streaming state carries content, not time.** Each check is named in plain language and returns a finding — "11 of your last 12 EMIs paid on time" — and the offer that follows is visibly built on those findings. The final check states the assistant's own 5-day ceiling *before* it promises anything.
- **The limit is stated before the user hits it.** On the proposal, and on the date picker as a filled meter rather than a post-hoc error. Escalation then reads as the rule working, not as a refusal.
- **The handoff makes three commitments**, in the user's order of worry: she already has your context (no repeating yourself), she calls today before 6 PM (a time, not "soon"), and nothing bad happens meanwhile — late fee, collection calls and bureau reporting all frozen. The header switches to Rhea; the assistant is visibly out of the way.

## Part 2 — payment confirmation

`p2:before` is the brief's starting point. Then `p2:success`, `p2:partial`, `p2:failed`, `p2:duplicate`.

- **Partial** — the trap is celebrating. The progress bar is split paid / still-owed, and the warning is specific: amount, date, ₹350, bureau. Vague warnings in lending are worse than none.
- **Failed** — "no money left your account" is in the opening line, in bold, because that's the first thing a declined user needs. The bank's actual reason is quoted so the user knows what to fix. Three exits, including back into the Part 1 assistant.
- **Already paid** — this user is confused, not transacting. Reassurance plus the original 3 Aug receipt as evidence, then a redirect to what they may have actually wanted. Not an error state.

---

## AI workflow

_To fill in before submitting:_

- Tool: Claude Code (Opus) — built straight to React rather than static frames, so the streaming state has real timing.
- Attach a 60–90s screen recording mid-prompt, plus one before/after copy excerpt.
