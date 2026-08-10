import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* A glass marble drawn by a custom fragment shader rather than a picture of
   one. The form is shaded off the sphere's own normal, so the highlights stay
   put while the mesh turns beneath them — only the cool wash inside drifts,
   and slowly. A tight specular hotspot, a bounce highlight low on the far
   side and a white fresnel rim do the rest.

   Deliberately cheap: no shadows, no textures, no environment map, one mesh,
   and the loop pauses when the tab is hidden. */

const VERT = `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = `
  precision highp float;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;

  /* one soft diagonal sheet of ink, fully feathered so it has no edge */
  float sheet(vec2 uv, float phase, float thick, float tilt) {
    float y = 0.50
      + tilt * (uv.x - 0.5)
      + 0.085 * sin(uv.x * 6.2831 + phase)
      + 0.032 * sin(uv.x * 12.566 - phase * 0.7);
    return smoothstep(thick, 0.0, abs(uv.y - y));
  }

  void main() {
    /* Near-white glass shell. The body is kept very light so the swirl reads
       as something suspended inside rather than painted on the surface. */
    vec3 glass = vec3(0.961, 0.968, 0.980);
    vec3 cool  = vec3(0.874, 0.890, 0.918);
    vec3 slate = vec3(0.478, 0.510, 0.596);
    vec3 navy  = vec3(0.216, 0.243, 0.337);

    float up = clamp(vN.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(cool, glass, smoothstep(0.10, 0.85, up));

    /* The ink lives in UV space, so it travels with the surface as the mesh
       turns — that rotation is what makes the sphere feel alive. Three
       feathered sheets at different tilts; depth only where they overlap. */
    float i1 = sheet(vUv,                     uTime * 0.30,       0.150, -0.26) * 0.62;
    float i2 = sheet(vUv + vec2(0.0, 0.052),  uTime * 0.23 + 1.8, 0.115, -0.32) * 0.50;
    float i3 = sheet(vUv - vec2(0.0, 0.046),  uTime * 0.37 + 3.4, 0.088, -0.19) * 0.40;
    float ink = clamp(i1 + i2 + i3, 0.0, 1.0);

    /* fades toward the silhouette, as if seen through the curve of the glass */
    ink *= 0.35 + 0.65 * max(dot(vN, vView), 0.0);

    col = mix(col, slate, ink * 0.88);
    col = mix(col, navy, pow(ink, 2.1) * 0.86);

    vec3 L = normalize(vec3(-0.40, 0.82, 0.76));
    vec3 H = normalize(L + vView);

    /* broad sheen, then the tight hotspot that sells it as glass */
    col += vec3(1.0) * pow(max(dot(vN, H), 0.0), 18.0) * 0.16;
    col += vec3(1.0) * pow(max(dot(vN, H), 0.0), 260.0) * 0.85;

    /* bounce light low on the far side */
    vec3 B = normalize(vec3(0.64, -0.62, 0.55));
    col += vec3(0.90, 0.93, 1.0) * pow(max(dot(vN, normalize(B + vView)), 0.0), 120.0) * 0.34;

    /* thin bright rim — the giveaway of a glass edge */
    float fres = pow(1.0 - max(dot(vN, vView), 0.0), 3.0);
    col = mix(col, vec3(1.0), fres * 0.72);

    gl_FragColor = vec4(col, 1.0);
  }
`

/* degrees per second — frame-rate independent, so a 120Hz display doesn't
   spin it twice as fast as a 60Hz one. Kept low; the motion should be felt
   rather than watched. */
export default function Sphere3D({ size = 128, degPerSec = 16 }) {
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
    /* 3.38 leaves a hair of margin — nothing clips at the edges, and the
       sphere still nearly fills its ring */
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.z = 3.38

    const geometry = new THREE.SphereGeometry(1, 96, 64)
    const uniforms = { uTime: { value: 0 } }
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    })
    const sphere = new THREE.Mesh(geometry, material)
    sphere.rotation.z = 0.2
    scene.add(sphere)

    let raf
    let live = true
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    /* Paused on tab visibility rather than IntersectionObserver: these screens
       arrive via a transform rather than a scroll, so IO can latch to "not
       visible" on mount and never fire again, silently freezing the sphere. */
    const awake = () => document.visibilityState === 'visible'

    const rate = (degPerSec * Math.PI) / 180
    let last = performance.now()
    const frame = (now) => {
      if (!live) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (awake()) {
        if (!still) {
          sphere.rotation.y += rate * dt
          uniforms.uTime.value += dt
        }
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      live = false
      cancelAnimationFrame(raf)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [size, degPerSec])

  return <div ref={host} className="sphere3d" style={{ width: '100%', height: '100%' }} />
}
