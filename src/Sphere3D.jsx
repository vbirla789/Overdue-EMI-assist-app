import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* A real 3D sphere rather than a picture of one. The existing orb art is used
   as an equirectangular environment map, so the reflections keep the pale
   marble palette while the geometry gives it actual depth and parallax as it
   turns. Deliberately lightweight: no shadows, one light, modest segment
   count, and the loop stops when the element scrolls out of view. */

/* The surface is painted procedurally rather than sampled from the orb PNG.
   That art is a circular render on transparency, so wrapping it round a
   sphere dragged the transparent corners across the surface as hard dark
   edges. Drawing the band directly keeps it soft and seamless at the wrap. */
let cache = null
function marbleTexture() {
  if (cache) return cache

  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const x = c.getContext('2d')

  x.fillStyle = '#f7f9fd'
  x.fillRect(0, 0, 1024, 512)

  /* Localised swirls rather than one band wrapping the whole sphere. A
     full-width band looks identical at every angle, so the rotation was
     running but invisible — discrete features give it something to carry. */
  const swirls = [
    { u: 0.18, v: 0.52, rx: 250, ry: 92, rot: -0.34, a: 0.72 },
    { u: 0.52, v: 0.42, rx: 190, ry: 70, rot: 0.28, a: 0.55 },
    { u: 0.80, v: 0.58, rx: 220, ry: 60, rot: -0.16, a: 0.44 },
  ]

  x.filter = 'blur(38px)'
  for (const s of swirls) {
    for (const shift of [-1024, 0, 1024]) {
      const cx = shift + s.u * 1024
      const cy = s.v * 512
      const g = x.createLinearGradient(cx - s.rx, cy - s.ry, cx + s.rx, cy + s.ry)
      g.addColorStop(0, 'rgba(88, 102, 138, 0)')
      g.addColorStop(0.34, `rgba(62, 76, 112, ${s.a * 0.62})`)
      g.addColorStop(0.52, `rgba(38, 49, 82, ${s.a})`)
      g.addColorStop(0.74, `rgba(74, 88, 124, ${s.a * 0.38})`)
      g.addColorStop(1, 'rgba(88, 102, 138, 0)')
      x.fillStyle = g
      x.beginPath()
      x.ellipse(cx, cy, s.rx, s.ry, s.rot, 0, Math.PI * 2)
      x.fill()
    }
  }

  /* pale highlights between the swirls keep it reading as marble */
  x.filter = 'blur(52px)'
  for (const u of [0.35, 0.68, 0.95]) {
    for (const shift of [-1024, 0, 1024]) {
      x.fillStyle = 'rgba(255, 255, 255, 0.85)'
      x.beginPath()
      x.ellipse(shift + u * 1024, 190, 180, 96, 0.3, 0, Math.PI * 2)
      x.fill()
    }
  }
  x.filter = 'none'

  const map = new THREE.CanvasTexture(c)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.ClampToEdgeWrapping

  const env = new THREE.CanvasTexture(c)
  env.mapping = THREE.EquirectangularReflectionMapping
  env.colorSpace = THREE.SRGBColorSpace

  cache = { map, env }
  return cache
}

/* degrees per second — frame-rate independent, so a 120Hz display doesn't
   spin it twice as fast as a 60Hz one */
export default function Sphere3D({ size = 128, degPerSec = 34 }) {
  const host = useRef(null)

  useEffect(() => {
    const el = host.current
    if (!el) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    /* preserveDrawingBuffer keeps the last frame readable, so the sphere shows
       up in canvas-based screenshots instead of coming out blank */
    const renderer = new THREE.WebGLRenderer({
      alpha: true, antialias: true, preserveDrawingBuffer: true,
    })
    renderer.setPixelRatio(dpr)
    renderer.setSize(size, size, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.z = 3.15

    const geometry = new THREE.SphereGeometry(1, 64, 48)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.38,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.14,
      envMapIntensity: 0.55,
    })
    const sphere = new THREE.Mesh(geometry, material)
    /* tipped slightly so the swirl reads as a band rather than a stripe */
    sphere.rotation.z = 0.28
    scene.add(sphere)

    scene.add(new THREE.AmbientLight(0xffffff, 0.98))
    const key = new THREE.DirectionalLight(0xffffff, 1.35)
    key.position.set(-1.4, 1.7, 2.4)
    scene.add(key)
    /* cool rim from behind so the edge keeps the glassy highlight */
    const rim = new THREE.DirectionalLight(0xdfe6f5, 0.9)
    rim.position.set(1.6, -0.8, -1.4)
    scene.add(rim)

    let raf
    let live = true
    let visible = true
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(el)

    const { map, env } = marbleTexture()
    material.map = map
    material.envMap = env
    material.needsUpdate = true

    const rate = (degPerSec * Math.PI) / 180
    let last = performance.now()
    const frame = (now) => {
      if (!live) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (visible) {
        if (!still) sphere.rotation.y += rate * dt
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      live = false
      cancelAnimationFrame(raf)
      io.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [size, degPerSec])

  return <div ref={host} className="sphere3d" style={{ width: '100%', height: '100%' }} />
}
