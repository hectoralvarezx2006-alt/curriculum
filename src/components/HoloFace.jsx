import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ──────────────────────────────────────────────────────────────
   HoloFace — cabeza holográfica 3D procedural (sin modelos externos)

   Props
   · speaking → la boca se mueve y la mandíbula baja (el bot está respondiendo)
   · thinking → mirada hacia arriba y anillos más rápidos (esperando respuesta)

   Para cambiar el color del holograma toca solo el objeto C.
────────────────────────────────────────────────────────────── */
const C = {
  deep:  new THREE.Color(0x0a2a8a),
  main:  new THREE.Color(0x2f7bff),
  light: new THREE.Color(0x9fd4ff),
  ring:  0x4aa3ff,
  eye:   0xbfeaff,
  line:  0x8fd0ff,
  glow:  '60,140,255',
}

const HEAD = { sx: 0.78, sy: 1.05, sz: 0.86 }
const MOUTH = { y: -0.52, half: 0.2, n: 26 }

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/* Estrechamiento de la mandíbula según la altura (v en esfera unidad) */
function taper(v) {
  if (v >= 0.15) return [1, 1]
  const k = Math.min(1, (0.15 - v) / 1.15)
  return [1 - 0.38 * Math.pow(k, 1.3), 1 - 0.18 * k]
}

/* Esfera unidad → forma de cabeza */
function deform(u, v, w) {
  const [tx, tz] = taper(v)
  let z = w * tz * HEAD.sz
  if (w < 0) z *= 0.85
  return [u * tx * HEAD.sx, v * HEAD.sy, z]
}

/* Profundidad (z) de la superficie frontal de la cara en (x, y) */
function surf(x, y) {
  const v = y / HEAD.sy
  const [tx, tz] = taper(v)
  const u = x / (tx * HEAD.sx)
  const w2 = 1 - u * u - v * v
  return w2 > 0 ? Math.sqrt(w2) * tz * HEAD.sz : 0
}

function glowTexture(rgb) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  gr.addColorStop(0, `rgba(${rgb},1)`)
  gr.addColorStop(0.25, `rgba(${rgb},0.45)`)
  gr.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = gr
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export default function HoloFace({ speaking = false, thinking = false, listening = false }) {
  const mountRef = useRef(null)
  const stateRef = useRef({ speaking, thinking, listening })

  useEffect(() => {
    stateRef.current = { speaking, thinking, listening }
  }, [speaking, thinking, listening])

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const ADD = THREE.AdditiveBlending

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch (e) {
      console.warn('[HoloFace] WebGL no disponible', e)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.display = 'block'
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
    const glowTex = glowTexture('255,255,255')

    /* ── CABEZA ───────────────────────────────────────────── */
    const head = new THREE.Group()
    scene.add(head)

    const headGeo = new THREE.SphereGeometry(1, 72, 54)
    const pos = headGeo.attributes.position
    const count = pos.count
    const base = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const jawIdx = []
    const jawW = []
    const tmp = new THREE.Color()

    for (let i = 0; i < count; i++) {
      const u = pos.getX(i)
      const v = pos.getY(i)
      const w = pos.getZ(i)
      const [x, y, z] = deform(u, v, w)
      pos.setXYZ(i, x, y, z)
      base[i * 3] = x
      base[i * 3 + 1] = y
      base[i * 3 + 2] = z

      // Brillo: más intenso de frente y en el contorno (efecto holograma)
      const rim = Math.pow(1 - Math.abs(w), 2)
      const b = 0.22 + 0.55 * Math.max(w, 0) + 0.6 * rim
      tmp.copy(C.deep).lerp(C.main, Math.min(1, b)).lerp(C.light, Math.max(0, b - 0.75))
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b

      // Vértices que acompañan a la mandíbula al hablar
      const f = smooth(-0.3, -0.75, y) * smooth(-0.35, 0.35, z)
      if (f > 0.001) {
        jawIdx.push(i)
        jawW.push(f)
      }
    }
    headGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Cuerpo oscuro tipo cristal: tapa lo que queda detrás de la cabeza
    const solid = new THREE.Mesh(
      headGeo,
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.14, 0.14, 0.14), vertexColors: true }),
    )
    solid.scale.setScalar(0.985)
    const wire = new THREE.Mesh(
      headGeo,
      new THREE.MeshBasicMaterial({
        vertexColors: true, wireframe: true, transparent: true,
        opacity: 0.16, blending: ADD, depthWrite: false,
      }),
    )
    const dots = new THREE.Points(
      headGeo,
      new THREE.PointsMaterial({
        size: 0.035, map: glowTex, vertexColors: true, transparent: true,
        opacity: 0.9, blending: ADD, depthWrite: false, sizeAttenuation: true,
      }),
    )
    ;[solid, wire, dots].forEach((m) => { m.frustumCulled = false; head.add(m) })

    /* ── CUELLO (se desvanece hacia abajo) ────────────────── */
    const neckGeo = new THREE.CylinderGeometry(0.3, 0.38, 0.9, 28, 10, true)
    neckGeo.translate(0, -1.5, 0)
    const np = neckGeo.attributes.position
    const nColors = new Float32Array(np.count * 3)
    for (let i = 0; i < np.count; i++) {
      const k = smooth(-1.95, -1.1, np.getY(i)) * 0.5
      tmp.copy(C.deep).lerp(C.main, k)
      nColors[i * 3] = tmp.r * k
      nColors[i * 3 + 1] = tmp.g * k
      nColors[i * 3 + 2] = tmp.b * k
    }
    neckGeo.setAttribute('color', new THREE.BufferAttribute(nColors, 3))
    const neckPts = new THREE.Points(
      neckGeo,
      new THREE.PointsMaterial({
        size: 0.03, map: glowTex, vertexColors: true, transparent: true,
        opacity: 0.8, blending: ADD, depthWrite: false,
      }),
    )
    const neckWire = new THREE.Mesh(
      neckGeo,
      new THREE.MeshBasicMaterial({
        vertexColors: true, wireframe: true, transparent: true,
        opacity: 0.12, blending: ADD, depthWrite: false,
      }),
    )
    ;[neckPts, neckWire].forEach((m) => { m.frustumCulled = false; head.add(m) })

    /* ── RASGOS ───────────────────────────────────────────── */
    const lineMat = (opacity) => new THREE.LineBasicMaterial({
      color: C.line, transparent: true, opacity, blending: ADD, depthWrite: false,
    })
    const surfLine = (pts, mat, loop = false, off = 0.012) => {
      const arr = []
      for (const [x, y, o] of pts) arr.push(x, y, surf(x, y) + (o ?? off))
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3))
      const l = loop ? new THREE.LineLoop(g, mat) : new THREE.Line(g, mat)
      l.frustumCulled = false
      return l
    }

    // Ojos
    const eyes = []
    const eyeGlows = []
    for (const s of [-1, 1]) {
      const cx = s * 0.3
      const cy = 0.18
      const g = new THREE.Group()
      g.position.set(cx, cy, 0)
      const almond = []
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2
        const ox = Math.cos(a)
        const oy = Math.sin(a) * (1 - 0.25 * Math.abs(ox))
        const px = ox * 0.135
        const py = oy * 0.055 + ox * s * 0.018
        almond.push([px, py, surf(cx + px, cy + py) + 0.012])
      }
      const arr = almond.flat()
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3))
      const lid = new THREE.LineLoop(geo, lineMat(0.85))
      lid.frustumCulled = false
      g.add(lid)

      const z = surf(cx, cy)
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: C.eye, transparent: true, blending: ADD, depthWrite: false, opacity: 0.9,
      }))
      glow.scale.set(0.3, 0.3, 1)
      glow.position.set(0, 0, z + 0.04)
      const iris = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: 0xffffff, transparent: true, blending: ADD, depthWrite: false, opacity: 0.95,
      }))
      iris.scale.set(0.085, 0.085, 1)
      iris.position.set(0, 0, z + 0.05)
      g.add(glow, iris)
      head.add(g)
      eyes.push(g)
      eyeGlows.push(glow)
    }

    // Cejas
    for (const s of [-1, 1]) {
      const pts = []
      for (let i = 0; i <= 14; i++) {
        const t = i / 14
        pts.push([s * (0.12 + 0.38 * t), 0.36 + 0.07 * Math.sin(Math.PI * t * 0.85) - 0.02 * t])
      }
      head.add(surfLine(pts, lineMat(0.5), false, 0.014))
    }

    // Nariz
    const noseOff = (y) => 0.012 + 0.09 * Math.min(1, Math.max(0, (0.15 - y) / 0.3))
    for (const s of [-1, 1]) {
      const pts = [[s * 0.07, 0.2], [s * 0.06, 0.04], [s * 0.085, -0.07], [s * 0.1, -0.12]]
      head.add(surfLine(pts.map(([x, y]) => [x, y, noseOff(y)]), lineMat(0.55)))
    }
    const tip = [[-0.1, -0.12], [-0.05, -0.17], [0, -0.155], [0.05, -0.17], [0.1, -0.12]]
    head.add(surfLine(tip.map(([x, y]) => [x, y, noseOff(y) + 0.005]), lineMat(0.7)))

    // Orejas
    for (const s of [-1, 1]) {
      const pts = []
      for (let i = 0; i <= 16; i++) {
        const a = -Math.PI / 2 + (i / 16) * Math.PI
        pts.push(new THREE.Vector3(s * (0.745 + 0.1 * Math.cos(a)), -0.02 + 0.22 * Math.sin(a), -0.02))
      }
      const ear = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0.5))
      ear.frustumCulled = false
      head.add(ear)
    }

    // Boca (labios + interior, se actualizan cada frame)
    const N = MOUTH.n
    const mkLip = (opacity) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3))
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({
        color: 0xa5dcff, transparent: true, opacity, blending: ADD, depthWrite: false,
      }))
      l.frustumCulled = false
      head.add(l)
      return g.attributes.position
    }
    const upperPos = mkLip(0.9)
    const lowerPos = mkLip(0.9)

    const fillGeo = new THREE.BufferGeometry()
    const fillPos = new THREE.Float32BufferAttribute(new Float32Array(N * 2 * 3), 3)
    fillGeo.setAttribute('position', fillPos)
    const idx = []
    for (let i = 0; i < N - 1; i++) {
      idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2)
    }
    fillGeo.setIndex(idx)
    const mouthFill = new THREE.Mesh(
      fillGeo,
      new THREE.MeshBasicMaterial({ color: 0x01030a, side: THREE.DoubleSide }),
    )
    mouthFill.frustumCulled = false
    mouthFill.visible = false
    head.add(mouthFill)

    const updateMouth = (open) => {
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1)
        const edge = Math.sin(Math.PI * t)
        const x = (t * 2 - 1) * MOUTH.half * (1 - open * 0.14 * edge)
        const smile = 0.035 * Math.pow(2 * t - 1, 2)
        const yu = MOUTH.y + smile + 0.006 * edge
        const yl = MOUTH.y + smile - 0.006 * edge - open * 0.12 * Math.pow(edge, 0.85)
        const zu = surf(x, yu) + 0.028
        const zl = surf(x, yl) + 0.028 - open * 0.03 * edge
        upperPos.setXYZ(i, x, yu, zu)
        lowerPos.setXYZ(i, x, yl, zl)
        fillPos.setXYZ(2 * i, x, yu, zu - 0.004)
        fillPos.setXYZ(2 * i + 1, x, yl, zl - 0.004)
      }
      upperPos.needsUpdate = true
      lowerPos.needsUpdate = true
      fillPos.needsUpdate = true
      mouthFill.visible = open > 0.05
    }
    updateMouth(0)

    // Mandíbula: baja los vértices de la parte inferior de la cara
    let lastJaw = 0
    const applyJaw = (open) => {
      const d = open * 0.1
      if (Math.abs(d - lastJaw) < 0.0004) return
      lastJaw = d
      for (let k = 0; k < jawIdx.length; k++) {
        const i = jawIdx[k]
        const f = jawW[k]
        pos.setY(i, base[i * 3 + 1] - d * f)
        pos.setZ(i, base[i * 3 + 2] - d * f * 0.35)
      }
      pos.needsUpdate = true
    }

    /* ── ANILLOS ORBITALES ────────────────────────────────── */
    const dotTex = glowTexture('255,255,255')
    const rings = []
    const makeRing = (rx, rz, tiltX, tiltZ, speed, opacity) => {
      const g = new THREE.Group()
      g.position.y = 0.1
      const pts = []
      for (let i = 0; i < 180; i++) {
        const a = (i / 180) * Math.PI * 2
        pts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz))
      }
      g.add(new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: C.ring, transparent: true, opacity, blending: ADD, depthWrite: false }),
      ))
      const dg = new THREE.BufferGeometry()
      dg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 3), 3))
      g.add(new THREE.Points(dg, new THREE.PointsMaterial({
        size: 0.08, map: dotTex, color: 0xcfeaff, transparent: true,
        blending: ADD, depthWrite: false,
      })))
      g.rotation.set(tiltX, 0, tiltZ)
      g.children.forEach((c) => { c.frustumCulled = false })
      scene.add(g)
      rings.push({ g, rx, rz, speed, phase: Math.random() * 6, dg })
    }
    makeRing(1.55, 1.2, 0.22, 0.05, 0.35, 0.4)
    makeRing(1.25, 0.95, -0.35, -0.12, -0.5, 0.28)
    makeRing(1.9, 1.5, 0.1, 0.0, 0.18, 0.16)

    /* ── PARTÍCULAS ───────────────────────────────────────── */
    const pc = 180
    const parr = new Float32Array(pc * 3)
    for (let i = 0; i < pc; i++) {
      const r = 1.5 + Math.random() * 1.4
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      parr[i * 3] = r * Math.sin(ph) * Math.cos(th)
      parr[i * 3 + 1] = r * Math.cos(ph) * 0.8
      parr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th)
    }
    const pg = new THREE.BufferGeometry()
    pg.setAttribute('position', new THREE.BufferAttribute(parr, 3))
    const particles = new THREE.Points(pg, new THREE.PointsMaterial({
      size: 0.04, map: dotTex, color: 0x7cc0ff, transparent: true,
      opacity: 0.7, blending: ADD, depthWrite: false,
    }))
    particles.frustumCulled = false
    scene.add(particles)

    /* ── LUCES (halo trasero y bajo la barbilla) ──────────── */
    const backGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: new THREE.Color(`rgb(${C.glow})`), transparent: true,
      blending: ADD, depthWrite: false, opacity: 0.5,
    }))
    backGlow.scale.set(4.4, 4.8, 1)
    backGlow.position.set(0, 0, -1.4)
    scene.add(backGlow)

    const chinGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0x6fb4ff, transparent: true,
      blending: ADD, depthWrite: false, opacity: 0.5,
    }))
    chinGlow.scale.set(2.8, 1.0, 1)
    chinGlow.position.set(0, -1.12, 0.4)
    scene.add(chinGlow)

    // Línea de escaneo
    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.012),
      new THREE.MeshBasicMaterial({
        color: 0x7cc8ff, transparent: true, opacity: 0.35,
        blending: ADD, depthWrite: false, side: THREE.DoubleSide,
      }),
    )
    scan.frustumCulled = false
    scene.add(scan)

    /* ── TAMAÑO RESPONSIVE ────────────────────────────────── */
    const resize = () => {
      const w = Math.max(1, el.clientWidth)
      const h = Math.max(1, el.clientHeight)
      renderer.setSize(w, h)
      camera.aspect = w / h
      // Encuadre: que quepa la cabeza en alto y los anillos en ancho
      const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const zH = 1.4 / halfTan
      const zW = 2.05 / (halfTan * camera.aspect)
      camera.position.set(0, 0.05, Math.max(zH, zW))
      camera.lookAt(0, -0.1, 0)
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const mouse = { x: 0, y: 0 }
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    /* ── BUCLE DE ANIMACIÓN ───────────────────────────────── */
    const clock = new THREE.Clock()
    let t = 0
    let open = 0
    let energy = 0
    let blinkT = -1
    let nextBlink = 2.5
    let raf = 0

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.05)
      t += dt
      const { speaking: sp, thinking: th, listening: li } = stateRef.current

      energy += ((sp ? 1 : th ? 0.6 : li ? 0.5 : 0) - energy) * Math.min(1, dt * 4)
      const motion = reduced ? 0.15 : 1

      // Boca: sílabas + énfasis + pausas de respiración
      let target = 0
      if (sp) {
        const syl = Math.abs(Math.sin(t * 11))
        const env = 0.55 + 0.45 * Math.abs(Math.sin(t * 3.1 + 1.3))
        const breath = smooth(-0.85, -0.55, Math.sin(t * 0.8))
        target = (0.12 + 0.88 * syl * env) * (0.15 + 0.85 * breath)
      }
      open += (target - open) * Math.min(1, dt * 22)
      if (open < 0.002) open = 0
      updateMouth(open)
      applyJaw(open)

      // Cabeza: sigue al ratón, respira y asiente al hablar
      const nod = sp ? Math.sin(t * 4.2) * 0.012 : 0
      const tY = (reduced ? 0 : mouse.x * 0.28 + Math.sin(t * 0.45) * 0.05) + (th ? -0.18 : 0)
      // Al escuchar, inclina un poco la cabeza hacia ti
      const tX = (reduced ? 0 : mouse.y * 0.14 + Math.sin(t * 0.6) * 0.02) + (th ? -0.07 : 0) + (li ? 0.05 : 0) + nod
      head.rotation.y += (tY - head.rotation.y) * Math.min(1, dt * 3)
      head.rotation.x += (tX - head.rotation.x) * Math.min(1, dt * 3)
      head.scale.setScalar(1 + 0.006 * Math.sin(t * 1.6) * motion)

      // Parpadeo (y entrecerrar los ojos al pensar)
      let blink = 0
      if (blinkT < 0 && t > nextBlink) blinkT = 0
      if (blinkT >= 0) {
        blinkT += dt
        const p = blinkT / 0.16
        blink = p < 0.5 ? p * 2 : Math.max(0, 2 - p * 2)
        if (p >= 1) {
          blinkT = -1
          nextBlink = t + 2.5 + Math.random() * 3.5
        }
      }
      const lid = Math.max(0.08, (th ? 0.8 : 1) - blink * 0.92)
      eyes.forEach((e) => { e.scale.y = lid })
      eyeGlows.forEach((g) => { g.material.opacity = 0.75 + 0.2 * Math.sin(t * 3) + 0.15 * energy })

      // Anillos y puntos que los recorren
      const spin = (0.6 + energy * 1.6) * motion
      rings.forEach((r, ri) => {
        r.g.rotation.y += r.speed * spin * dt
        const arr = r.dg.attributes.position
        for (let k = 0; k < 3; k++) {
          const a = r.phase + t * (0.5 + energy) * (ri % 2 ? -1 : 1) + (k * Math.PI * 2) / 3
          arr.setXYZ(k, Math.cos(a) * r.rx, 0, Math.sin(a) * r.rz)
        }
        arr.needsUpdate = true
      })
      particles.rotation.y = t * 0.05 * motion
      particles.position.y = Math.sin(t * 0.4) * 0.05 * motion

      // Luces
      backGlow.material.opacity = 0.42 + 0.1 * Math.sin(t * 1.2) + 0.12 * energy + 0.18 * open
      chinGlow.material.opacity = 0.4 + 0.1 * Math.sin(t * 1.7 + 1) + 0.2 * open

      // Línea de escaneo, ajustada al ancho de la cabeza
      const sy = 1.15 - ((t * 0.28) % 1) * 2.3
      const v = sy / HEAD.sy
      const [tx] = taper(v)
      scan.position.set(0, sy, surf(0, sy) * 0.75 + 0.02)
      scan.scale.x = Math.max(0.01, 2 * HEAD.sx * tx * Math.sqrt(Math.max(0, 1 - v * v)) * 1.06)
      scan.material.opacity = (0.18 + 0.2 * energy) * (reduced ? 0 : 1) * smooth(0.97, 0.8, Math.abs(v))

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        o.geometry?.dispose?.()
        const m = o.material
        ;(Array.isArray(m) ? m : [m]).forEach((mm) => mm?.dispose?.())
      })
      glowTex.dispose()
      dotTex.dispose()
      renderer.dispose()
      renderer.forceContextLoss?.()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // La máscara desvanece el cuello y el halo en el borde inferior (sin corte duro)
  const fade = 'linear-gradient(to bottom, #000 78%, transparent 100%)'
  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, WebkitMaskImage: fade, maskImage: fade }}
    />
  )
}