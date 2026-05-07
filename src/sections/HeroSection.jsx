import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SKILLS } from '../data/index.js'

const LINES = [
  { type: 'cmd', text: 'whoami' },
  { type: 'out', text: 'Héctor Álvarez · Programador · DAM 2025' },
  { type: 'cmd', text: 'cat skills.txt' },
  { type: 'out', text: 'Java, Flutter, Python, APIs, LLMs, SQL, Git' },
  { type: 'cmd', text: 'ls proyectos/' },
  { type: 'out', text: 'reproductor-musica/   app-presupuestos-ia/' },
  { type: 'cmd', text: './disponible --primer-empleo' },
  { type: 'out', text: 'Abierto a oportunidades · Listo para empezar ✓' },
]

function Particles() {
  const items = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 1,
    dur: Math.random() * 8 + 5,
    delay: Math.random() * 6,
    color: i % 3 === 0 ? 'var(--purple2)' : i % 3 === 1 ? 'var(--green2)' : 'var(--cyan)',
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map(p => (
        <motion.div key={p.id}
          animate={{ y: [0, -70, 0], opacity: [0, 0.5, 0], scale: [0, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
        />
      ))}
    </div>
  )
}

function ScanLines() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.div
        animate={{ y: ['-5vh', '110vh'] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(52,211,153,0.4), transparent)',
        }}
      />
      <motion.div
        animate={{ x: ['-5vw', '110vw'] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
        style={{
          position: 'absolute', top: 0, bottom: 0, width: 1,
          background: 'linear-gradient(180deg, transparent, rgba(139,92,246,0.25), transparent)',
        }}
      />
    </div>
  )
}

function Terminal({ started }) {
  const [lines, setLines] = useState([])
  const [done,  setDone]  = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (!started) return
    let li = 0, ci = 0, current = []
    let t
    const tick = () => {
      if (li >= LINES.length) { setDone(true); return }
      const line = LINES[li]
      if (ci === 0) current = [...current, { ...line, display: '' }]
      if (ci < line.text.length) {
        current = current.map((l, i) =>
          i === current.length - 1 ? { ...l, display: line.text.slice(0, ci + 1) } : l
        )
        setLines([...current]); ci++
        t = setTimeout(tick, line.type === 'cmd' ? 44 : 13)
      } else {
        ci = 0; li++
        t = setTimeout(tick, line.type === 'cmd' ? 100 : 200)
      }
    }
    t = setTimeout(tick, 700)
    return () => clearTimeout(t)
  }, [started])

  // scroll interno del terminal sin mover la pagina
  useEffect(() => {
    if (endRef.current) {
      const body = endRef.current.closest(".terminal-body")
      if (body) body.scrollTop = body.scrollHeight
    }
  }, [lines])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={started ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="terminal" style={{ maxWidth: 520 }}
    >
      <div className="terminal-bar">
        <div className="t-dot t-dot-r" /><div className="t-dot t-dot-y" /><div className="t-dot t-dot-g" />
        <span style={{ marginLeft: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
          hector@dev — bash
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green2)' }}>● LIVE</span>
      </div>
      <div className="terminal-body" style={{ maxHeight: 220, overflowY: 'auto' }}>
        {lines.map((line, i) => (
          <div className="t-line" key={i}>
            {line.type === 'cmd'
              ? <><span className="t-prompt">❯</span><span className="t-cmd"> {line.display}</span></>
              : <span className="t-out">{line.display}</span>}
          </div>
        ))}
        {!done && <div className="t-line"><span className="t-cursor" /></div>}
        <div ref={endRef} />
      </div>
    </motion.div>
  )
}

export default function HeroSection({ started }) {
  const sectionRef = useRef(null)

  // Report visibility to parent for nav highlight
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) window.__heroVisible?.()
    }, { threshold: 0.3 })
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const words = ['Héctor', 'Álvarez.']

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="section"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '100px 3rem 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Particles />
      <ScanLines />

      {/* Ambient glows */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{
          position: 'absolute', top: '10%', right: '0%',
          width: 560, height: 560,
          background: 'radial-gradient(circle, rgba(139,92,246,1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        style={{
          position: 'absolute', bottom: '5%', left: '-5%',
          width: 460, height: 460,
          background: 'radial-gradient(circle, rgba(16,185,129,1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 860, position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={started ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="section-eyebrow"
        >
          recién graduado · dam 2025
        </motion.div>

        {/* Name — word by word, no parallax */}
        <h1
          className="glitch"
          data-text="Héctor Álvarez."
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2.2rem, 6vw, 6rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: '0.25em',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: -80 }}
              animate={started ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'inline-block', marginRight: '0.25em', transformOrigin: 'bottom' }}
            >
              {w}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(1.3rem, 2.8vw, 2rem)',
            fontWeight: 600, color: 'var(--muted)',
            letterSpacing: '-0.02em', marginBottom: '1.4rem',
          }}
        >
          Programador{' '}
          <span style={{ color: 'transparent', WebkitTextStroke: '1px var(--purple2)' }}>
            en construcción.
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.52 }}
          style={{ color: 'var(--muted2)', maxWidth: 500, lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.97rem' }}
        >
          Acabo de terminar DAM. He construido cosas que funcionan, pienso como programador
          y tengo muy claro hacia dónde voy. Esto no es un portfolio perfecto.{' '}
          <span style={{ color: 'var(--purple2)' }}>Es real.</span>
        </motion.p>

        {/* Terminal */}
        <Terminal started={started} />

        {/* Skills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '1.75rem 0' }}>
          {SKILLS.map((s, i) => (
            <motion.span
              key={s}
              className="skill-chip"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={started ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1.5 + i * 0.045, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {s}
            </motion.span>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1.3 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
        >
          <a href="#proyectos"><button className="btn-cyber">ver proyectos →</button></a>
          <a href="#interactuar"><button className="btn-cyber btn-cyber-green">habla conmigo →</button></a>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={started ? { opacity: 1 } : {}}
        transition={{ delay: 3.5, duration: 1 }}
        style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          zIndex: 2,
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em' }}>SCROLL</span>
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, var(--purple), transparent)' }}
        />
      </motion.div>
    </section>
  )
}
