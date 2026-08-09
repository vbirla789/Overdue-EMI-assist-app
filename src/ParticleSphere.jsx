import { useEffect, useRef } from 'react'

/* Aurora particle sphere — ported from ~/noon proto/particle-sphere/index.html.
   Rendered at a multiple of the display size so the dots stay crisp when
   scaled down to avatar sizes. */

const STOPS = [
  [34, 211, 238], [59, 130, 246], [37, 37, 220],
  [168, 85, 247], [236, 72, 200], [253, 186, 140],
]

function ramp(u) {
  u = u - Math.floor(u)
  const f = u * STOPS.length
  const i0 = Math.floor(f) % STOPS.length
  const i1 = (i0 + 1) % STOPS.length
  const k = f - Math.floor(f)
  const A = STOPS[i0], B = STOPS[i1]
  return [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k]
}

/* overscan renders the canvas larger than the frame so the sphere — which
   only spans ~71% of its own canvas — fills the circle edge to edge. */
export default function ParticleSphere({ size = 94, speed = 0.0032, overscan = 1.4 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const x = canvas.getContext('2d')

    const draw = size * overscan
    const W = Math.min(700, Math.round(draw * 4))
    const scale = W / 1200
    const cx = W / 2, cy = W / 2
    const R = 430 * scale
    const N = Math.round(16000 * scale * scale * 2.2)
    canvas.width = W
    canvas.height = W

    const p = []
    for (let i = 0; i < N; i++) {
      const y = 1 - Math.random() * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const t = Math.random() * 6.2832
      p.push({
        x: Math.cos(t) * r, y, z: Math.sin(t) * r,
        j: 0.45 + Math.random() * 0.55,
        seed: Math.random() * 6.2832,
      })
    }

    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let a = 0
    let t = 0
    let raf

    function frame() {
      x.clearRect(0, 0, W, W)
      const ca = Math.cos(a), sa = Math.sin(a)
      /* tilt drifts, so the sphere never settles into a flat spin */
      const tilt = 0.35 + Math.sin(t * 0.23) * 0.30
      const tl = Math.cos(tilt), ts = Math.sin(tilt)
      /* slow breath in and out */
      const breath = 1 + Math.sin(t * 0.55) * 0.035
      for (let i = 0; i < N; i++) {
        const q = p[i]
        /* each particle swims a little around its anchor point */
        const sw = 0.045 * q.j
        const px = q.x + Math.sin(t * 0.9 + q.seed) * sw
        const py = q.y + Math.sin(t * 0.7 + q.seed * 1.7) * sw
        const pz = q.z + Math.cos(t * 0.8 + q.seed * 1.3) * sw
        const X = px * ca - pz * sa
        const Z = px * sa + pz * ca
        const Y = py
        const Y2 = Y * tl - Z * ts
        const Z2 = Y * ts + Z * tl
        const pe = 1 / (1.9 - Z2 * 0.55)
        const sx = cx + X * R * pe * 1.35 * breath
        const sy = cy + Y2 * R * pe * 1.35 * breath
        const d = (Z2 + 1) / 2
        const rim = Math.pow(1 - Math.abs(Z2), 1.6)
        const al = Math.min(1, (0.30 + d * 0.60 + rim * 0.30) * q.j)
        const rad = Math.max(0.4, (1.0 + d * 2.6) * q.j * scale * 2.4)
        const u = 0.34 * X + 0.20 * Y2
          + 0.14 * Math.sin(1.6 * X + 1.1 * Y2 + a * 1.7)
          + 0.10 * Math.sin(2.0 * Y2 - 1.3 * Z2 + a * 1.1)
          + a * 0.07
        const col = ramp(u)
        const w = (1 - d) * 0.20
        x.fillStyle = 'rgba('
          + Math.round(col[0] + (255 - col[0]) * w) + ','
          + Math.round(col[1] + (255 - col[1]) * w) + ','
          + Math.round(col[2] + (255 - col[2]) * w) + ','
          + al.toFixed(3) + ')'
        x.beginPath()
        x.arc(sx, sy, rad, 0, 6.2832)
        x.fill()
      }
      if (still) return
      a += speed
      t += 0.016
      raf = requestAnimationFrame(frame)
    }
    frame()

    return () => cancelAnimationFrame(raf)
  }, [size, speed, overscan])

  const draw = size * overscan
  const offset = (size - draw) / 2

  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
      <canvas
        ref={ref}
        style={{ width: draw, height: draw, display: 'block', position: 'absolute', left: offset, top: offset }}
      />
    </div>
  )
}
