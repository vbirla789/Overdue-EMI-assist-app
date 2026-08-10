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

  void main() {
    /* silver crown falling into a dark navy base */
    vec3 lift  = vec3(0.949, 0.953, 0.965);
    vec3 body  = vec3(0.796, 0.808, 0.835);
    vec3 shade = vec3(0.353, 0.380, 0.447);
    vec3 core  = vec3(0.204, 0.224, 0.286);

    /* Form comes from the world normal, not the UVs, so the light stays where
       it is while the sphere rotates — otherwise the highlight would swim. */
    float up = clamp(vN.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(core, shade, smoothstep(0.02, 0.50, up));
    col = mix(col, body, smoothstep(0.42, 0.80, up));
    col = mix(col, lift, smoothstep(0.74, 1.00, up) * 0.90);

    /* the light drift — two slow, low-amplitude washes riding the UVs, so they
       travel with the surface as it turns */
    float w1 = 0.5 + 0.5 * sin(vUv.x * 6.2831 + uTime * 0.15);
    float w2 = 0.5 + 0.5 * sin(vUv.x * 12.566 - uTime * 0.10 + 1.9);
    col = mix(col, shade, w1 * 0.13);
    col = mix(col, vec3(0.545, 0.635, 0.792), w2 * 0.10);

    vec3 L = normalize(vec3(-0.40, 0.82, 0.76));
    vec3 H = normalize(L + vView);

    /* broad sheen, then the tight hotspot that sells it as glass */
    col += vec3(1.0) * pow(max(dot(vN, H), 0.0), 16.0) * 0.20;
    col += vec3(1.0) * pow(max(dot(vN, H), 0.0), 240.0) * 1.00;

    /* bounce light low on the far side */
    vec3 B = normalize(vec3(0.64, -0.62, 0.55));
    col += vec3(0.90, 0.93, 1.0) * pow(max(dot(vN, normalize(B + vView)), 0.0), 110.0) * 0.45;

    /* thin bright rim — the giveaway of a glass edge */
    float fres = pow(1.0 - max(dot(vN, vView), 0.0), 3.2);
    col = mix(col, vec3(1.0), fres * 0.68);

    gl_FragColor = vec4(col, 1.0);
  }
`

/* degrees per second — frame-rate independent, so a 120Hz display doesn't
   spin it twice as fast as a 60Hz one. Kept low; the motion should be felt
   rather than watched. */
export default function Sphere3D({ size = 128, degPerSec = 10 }) {
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
