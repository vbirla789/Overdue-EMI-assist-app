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

  x.fillStyle = '#f8fafd'
  x.fillRect(0, 0, 1024, 512)

  /* the main navy band, drawn twice at the seam so it tiles cleanly */
  x.filter = 'blur(46px)'
  for (const shift of [-1024, 0, 1024]) {
    const g = x.createLinearGradient(shift + 120, 90, shift + 900, 430)
    g.addColorStop(0, 'rgba(74, 88, 122, 0)')
    g.addColorStop(0.30, 'rgba(66, 80, 116, 0.42)')
    g.addColorStop(0.50, 'rgba(45, 57, 90, 0.66)')
    g.addColorStop(0.72, 'rgba(74, 88, 122, 0.22)')
    g.addColorStop(1, 'rgba(74, 88, 122, 0)')
    x.fillStyle = g
    x.beginPath()
    x.ellipse(shift + 512, 268, 460, 84, -0.30, 0, Math.PI * 2)
    x.fill()
  }

  /* a paler wisp crossing it, so the surface has more than one gesture */
  for (const shift of [-1024, 0, 1024]) {
    const g2 = x.createLinearGradient(shift + 200, 380, shift + 850, 120)
    g2.addColorStop(0, 'rgba(120, 134, 168, 0)')
    g2.addColorStop(0.5, 'rgba(120, 134, 168, 0.20)')
    g2.addColorStop(1, 'rgba(120, 134, 168, 0)')
    x.fillStyle = g2
    x.beginPath()
    x.ellipse(shift + 512, 300, 420, 66, 0.2, 0, Math.PI * 2)
    x.fill()
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

export default function Sphere3D({ size = 128, speed = 0.0022 }) {
  const host = useRef(null)

  useEffect(() => {
    const el = host.current
    if (!el) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
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

    const frame = () => {
      if (!live) return
      if (visible) {
        if (!still) sphere.rotation.y += speed
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      live = false
      cancelAnimationFrame(raf)
      io.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [size, speed])

  return <div ref={host} className="sphere3d" style={{ width: '100%', height: '100%' }} />
}
