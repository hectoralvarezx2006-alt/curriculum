import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { p: 15,  t: '> inicializando sistema...' },
  { p: 32,  t: '> cargando módulos...' },
  { p: 55,  t: '> compilando proyectos...' },
  { p: 74,  t: '> conectando asistente IA...' },
  { p: 90,  t: '> preparando experiencia...' },
  { p: 100, t: '> listo. bienvenido.' },
]

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [lines,    setLines]    = useState([])
  const [exiting,  setExiting]  = useState(false)
  const [gone,     setGone]     = useState(false)

  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      if (i < STEPS.length) {
        const step = STEPS[i]
        setProgress(step.p)
        setLines(prev => [...prev, step.t])
        i++
      } else {
        clearInterval(iv)
        setTimeout(() => setExiting(true), 400)
        setTimeout(() => {
          setGone(true)
          onDone()
        }, 1600)
      }
    }, 420)
    return () => clearInterval(iv)
  }, [])

  if (gone) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 9900,
      overflow: 'hidden',
    }}>
      {/* Main panel */}
      <motion.div
        animate={exiting ? { y: '-100%' } : { y: 0 }}
        initial={{ y: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        style={{
          position: 'absolute', inset: 0,
          background: '#050507',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2.5rem',
        }}
      >
        {/* Scanline */}
        <motion.div
          animate={{ y: ['-5vh', '105vh'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* Corner brackets */}
        {[
          { top: 24, left: 24,  borderTop: '1px solid var(--purple)', borderLeft:  '1px solid var(--purple)' },
          { top: 24, right: 24, borderTop: '1px solid var(--purple)', borderRight: '1px solid var(--purple)' },
          { bottom: 24, left: 24,  borderBottom: '1px solid var(--purple)', borderLeft:  '1px solid var(--purple)' },
          { bottom: 24, right: 24, borderBottom: '1px solid var(--purple)', borderRight: '1px solid var(--purple)' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{ position: 'absolute', width: 20, height: 20, ...s }}
          />
        ))}

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={{
              textShadow: [
                '0 0 20px rgba(139,92,246,0.8)',
                '0 0 50px rgba(139,92,246,1), 0 0 80px rgba(139,92,246,0.4)',
                '0 0 20px rgba(139,92,246,0.8)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: 700,
              color: 'var(--purple2)',
              letterSpacing: '0.1em',
              lineHeight: 1,
            }}
          >
            HA
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, var(--purple), transparent)',
              margin: '8px 0',
            }}
          />

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11, color: 'var(--muted)',
            letterSpacing: '0.3em',
          }}>
            HÉCTOR ÁLVAREZ · DAM 2025
          </div>
        </motion.div>

        {/* Terminal log */}
        <div style={{
          width: 'min(440px, 88vw)',
          background: 'rgba(11,11,16,0.9)',
          border: '1px solid var(--border)',
          padding: '1rem 1.25rem',
          minHeight: 140,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--muted)', letterSpacing: '0.12em',
            marginBottom: 10,
            borderBottom: '1px solid var(--border)', paddingBottom: 8,
          }}>
            SYSTEM LOG
          </div>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: i === lines.length - 1 ? 'var(--green2)' : 'rgba(152,150,168,0.55)',
                lineHeight: 1.9,
              }}
            >
              {line}
            </motion.div>
          ))}
          {!exiting && (
            <span style={{
              display: 'inline-block',
              width: 7, height: 13,
              background: 'var(--green2)',
              animation: 'blink 1s step-end infinite',
              verticalAlign: 'middle',
              marginTop: 2,
            }} />
          )}
        </div>

        {/* Progress bar */}
        <div style={{ width: 'min(440px, 88vw)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>
              CARGANDO
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--purple2)' }}>
              {progress}%
            </span>
          </div>
          <div style={{ height: 2, background: 'rgba(139,92,246,0.12)', position: 'relative', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--purple), var(--green2))',
                boxShadow: '0 0 10px var(--purple)',
              }}
            />
            <motion.div
              animate={{ x: ['-100%', '500%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '25%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Purple curtain that swipes up on exit */}
      <AnimatePresence>
        {exiting && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '-100%' }}
            exit={{}}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, var(--purple) 0%, #4c1d95 100%)',
              zIndex: 2,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
