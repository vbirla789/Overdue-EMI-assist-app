import { useState } from 'react'
import { Phone, Row, Gap, money } from './ui'

const DUE = 4500

function Receipt({ items }) {
  return (
    <div className="card">
      {items.map(([k, v, sub, tone]) => <Row key={k} k={k} v={v} sub={sub} tone={tone} />)}
    </div>
  )
}

export default function Part2({ screen, go }) {
  const [retrying, setRetrying] = useState(false)

  /* ---------- paid in full ---------- */
  if (screen === 'success') return (
    <Phone>
      <div className="screen">
        <Gap h={56} />
        <div className="pad stack" style={{ gap: 20 }}>
          <div className="hero good">✓</div>
          <div>
            <h1 className="h1">Paid {money(DUE)}.</h1>
            <p className="body" style={{ marginTop: 6 }}>Installment 7 of 12 done.</p>
          </div>

          <div>
            <div className="row" style={{ padding: '0 0 8px' }}>
              <span className="row-k">7 of 12 paid</span>
              <span className="row-v" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-3)' }}>{money(22500)} left</span>
            </div>
            <div className="bar"><i style={{ width: '58%' }} /></div>
          </div>

          <Receipt items={[
            ['From', 'HDFC ····4432'],
            ['On', '8 Aug, 9:41 AM'],
            ['Next EMI', `${money(DUE)} · 5 Sep`, 'auto-debit on'],
          ]} />

          <p className="small">Ref PAY-77301</p>
        </div>
        <div className="spacer" />
        <div className="footer">
          <button className="btn" onClick={() => go('home')}>Done</button>
          <button className="btn ghost" onClick={() => go('home')}>Share receipt</button>
        </div>
      </div>
    </Phone>
  )

  /* ---------- partial ---------- */
  if (screen === 'partial') {
    const paid = 2000, left = DUE - paid
    return (
      <Phone>
        <div className="screen">
          <Gap h={56} />
          <div className="pad stack" style={{ gap: 20 }}>
            <div className="hero warn">◑</div>
            <div>
              <h1 className="h1">{money(left)} still to go.</h1>
              <p className="body" style={{ marginTop: 6 }}>We got {money(paid)} and put it towards August.</p>
            </div>

            <div>
              <div className="row" style={{ padding: '0 0 8px' }}>
                <span className="row-k">August EMI</span>
                <span className="row-v" style={{ fontSize: 13, fontWeight: 500 }}>
                  <span style={{ color: 'var(--good)' }}>{money(paid)}</span>
                  <span style={{ color: 'var(--ink-3)' }}> of {money(DUE)}</span>
                </span>
              </div>
              <div className="bar"><i style={{ width: '44%' }} /><i className="pending" style={{ width: '56%' }} /></div>
            </div>

            <div className="banner warn">
              <span>⚠️</span>
              <span>Pay the rest by <b>11 Aug</b> or a ₹350 late fee kicks in and it hits your credit report.</span>
            </div>
          </div>
          <div className="spacer" />
          <div className="footer">
            <button className="btn brand" onClick={() => go('success')}>Pay {money(left)}</button>
            <button className="btn ghost" onClick={() => go('home')}>Remind me on 10 Aug</button>
          </div>
        </div>
      </Phone>
    )
  }

  /* ---------- failed ---------- */
  if (screen === 'failed') return (
    <Phone>
      <div className="screen">
        <Gap h={56} />
        <div className="pad stack" style={{ gap: 20 }}>
          <div className="hero bad">✕</div>
          <div>
            <h1 className="h1">Your bank said no.</h1>
            <p className="body" style={{ marginTop: 6 }}><b>No money left your account.</b></p>
          </div>

          <Receipt items={[
            ['Reason', 'Not enough balance', 'HDFC ····4432', 'bad'],
            ['Still due', money(DUE), 'was due 5 Aug'],
            ['Late fee starts', '11 Aug'],
          ]} />
        </div>
        <div className="spacer" />
        <div className="footer">
          <button className="btn brand" disabled={retrying}
            onClick={() => { setRetrying(true); setTimeout(() => { setRetrying(false); go('success') }, 1300) }}>
            {retrying ? <span className="typing"><i /><i /><i /></span> : 'Try again'}
          </button>
          <button className="btn ghost" onClick={() => go('success')}>Use another account</button>
          <button className="link" onClick={() => go('assistant')}>Can’t pay right now?</button>
        </div>
      </div>
    </Phone>
  )

  /* ---------- already paid ---------- */
  if (screen === 'duplicate') return (
    <Phone>
      <div className="screen">
        <Gap h={56} />
        <div className="pad stack" style={{ gap: 20 }}>
          <div className="hero brand">✓</div>
          <div>
            <h1 className="h1">Already paid.</h1>
            <p className="body" style={{ marginTop: 6 }}>
              You paid August on 3 Aug. <b>We haven’t charged you again.</b>
            </p>
          </div>

          <Receipt items={[
            ['August EMI', money(DUE), 'paid 3 Aug', 'good'],
            ['From', 'HDFC ····4432'],
            ['Next due', '5 Sep'],
          ]} />

          <p className="small">Ref PAY-76980</p>
        </div>
        <div className="spacer" />
        <div className="footer">
          <button className="btn" onClick={() => go('home')}>Got it</button>
          <button className="btn ghost" onClick={() => go('home')}>Pay September early</button>
        </div>
      </div>
    </Phone>
  )

  /* ---------- the "before" ---------- */
  if (screen === 'before') return (
    <Phone>
      <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', padding: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 17 }}>Your payment of Rs. 4,500 was successful</p>
        <Gap h={24} />
        <button className="btn" style={{ width: 120 }} onClick={() => go('success')}>OK</button>
      </div>
    </Phone>
  )

  return null
}
