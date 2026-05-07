import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Figure3D({ width = 300, height = 400 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // Scene
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0.5, 4.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    // Materials
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    })
    const solidMat = new THREE.MeshBasicMaterial({
      color: 0x4c1d95,
      transparent: true,
      opacity: 0.3,
      side: THREE.FrontSide,
    })
    const glitchCyan = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0,
    })
    const glitchPink = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      wireframe: true,
      transparent: true,
      opacity: 0,
    })

    // ── BUILD HUMAN FIGURE ──────────────────────────────
    const group      = new THREE.Group()
    const glitchGrpC = new THREE.Group()
    const glitchGrpP = new THREE.Group()

    const addPart = (geo, y = 0, x = 0, z = 0, scaleX = 1, scaleY = 1, scaleZ = 1) => {
      const solid = new THREE.Mesh(geo, solidMat)
      const wire  = new THREE.Mesh(geo, wireMat)
      const cyan  = new THREE.Mesh(geo, glitchCyan)
      const pink  = new THREE.Mesh(geo, glitchPink)
      ;[solid, wire, cyan, pink].forEach(m => {
        m.position.set(x, y, z)
        m.scale.set(scaleX, scaleY, scaleZ)
      })
      group.add(solid, wire)
      glitchGrpC.add(cyan)
      glitchGrpP.add(pink)
    }

    // Head
    addPart(new THREE.SphereGeometry(0.28, 12, 10), 1.72)
    // Neck
    addPart(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8), 1.38)
    // Torso
    addPart(new THREE.CylinderGeometry(0.38, 0.32, 0.9, 10), 0.83)
    // Hips
    addPart(new THREE.CylinderGeometry(0.32, 0.28, 0.35, 10), 0.24)
    // Left upper arm
    addPart(new THREE.CylinderGeometry(0.09, 0.08, 0.5, 8), 1.05, -0.52, 0, 1, 1, 1)
    // Left forearm
    addPart(new THREE.CylinderGeometry(0.07, 0.06, 0.45, 8), 0.64, -0.6, 0)
    // Right upper arm
    addPart(new THREE.CylinderGeometry(0.09, 0.08, 0.5, 8), 1.05, 0.52, 0)
    // Right forearm
    addPart(new THREE.CylinderGeometry(0.07, 0.06, 0.45, 8), 0.64, 0.6, 0)
    // Left thigh
    addPart(new THREE.CylinderGeometry(0.14, 0.12, 0.55, 8), -0.27, -0.18, 0)
    // Left shin
    addPart(new THREE.CylinderGeometry(0.1, 0.07, 0.52, 8), -0.74, -0.18, 0)
    // Right thigh
    addPart(new THREE.CylinderGeometry(0.14, 0.12, 0.55, 8), -0.27, 0.18, 0)
    // Right shin
    addPart(new THREE.CylinderGeometry(0.1, 0.07, 0.52, 8), -0.74, 0.18, 0)
    // Feet
    addPart(new THREE.BoxGeometry(0.16, 0.07, 0.28), -1.04, -0.18, 0.05)
    addPart(new THREE.BoxGeometry(0.16, 0.07, 0.28), -1.04,  0.18, 0.05)

    scene.add(group)
    scene.add(glitchGrpC)
    scene.add(glitchGrpP)

    // ── FLOATING PARTICLES ──────────────────────────────
    const particleGeo = new THREE.BufferGeometry()
    const count = 120
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 5
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x8b5cf6, size: 0.025, transparent: true, opacity: 0.6
    })
    scene.add(new THREE.Points(particleGeo, particleMat))

    // ── SCAN LINE ──────────────────────────────────────
    const scanGeo = new THREE.PlaneGeometry(2, 0.008)
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x34d399, transparent: true, opacity: 0.7, side: THREE.DoubleSide
    })
    const scanLine = new THREE.Mesh(scanGeo, scanMat)
    scene.add(scanLine)

    // ── ANIMATION ──────────────────────────────────────
    let t = 0
    let glitchTimer = 0

    const animate = () => {
      const id = requestAnimationFrame(animate)
      t += 0.012

      // Slow rotation
      group.rotation.y      = t * 0.4
      glitchGrpC.rotation.y = t * 0.4
      glitchGrpP.rotation.y = t * 0.4

      // Scanline sweep
      scanLine.position.y = 1.9 - ((t * 0.8) % 3.5)
      scanLine.position.z = 0.1

      // Glitch bursts
      glitchTimer += 0.016
      if (glitchTimer > 2.5 + Math.random() * 3) {
        glitchTimer = 0
        // Cyan glitch
        glitchGrpC.position.x = (Math.random() - 0.5) * 0.12
        glitchGrpC.position.y = (Math.random() - 0.5) * 0.06
        glitchCyan.opacity = 0.5 + Math.random() * 0.3
        setTimeout(() => {
          glitchGrpC.position.x = 0
          glitchGrpC.position.y = 0
          glitchCyan.opacity = 0
        }, 80 + Math.random() * 120)
        // Pink glitch
        setTimeout(() => {
          glitchGrpP.position.x = (Math.random() - 0.5) * 0.1
          glitchPink.opacity = 0.4 + Math.random() * 0.3
          setTimeout(() => {
            glitchGrpP.position.x = 0
            glitchPink.opacity = 0
          }, 60 + Math.random() * 100)
        }, 40)
      }

      renderer.render(scene, camera)
      return id
    }
    const rafId = animate()

    return () => {
      cancelAnimationFrame(rafId)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [width, height])

  return <div ref={mountRef} style={{ width, height, position: 'relative', zIndex: 2 }} />
}
