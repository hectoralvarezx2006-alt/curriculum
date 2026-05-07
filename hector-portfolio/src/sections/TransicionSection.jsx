import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FLOAT = [
  { t:'01', x:'8%',  y:'15%', d:0    },
  { t:'10', x:'85%', y:'20%', d:0.7  },
  { t:'</>', x:'12%', y:'75%', d:1.4 },
  { t:'/>', x:'80%', y:'70%', d:0.4  },
  { t:'{}', x:'45%', y:'10%', d:1.1  },
  { t:'[]', x:'50%', y:'85%', d:1.8  },
  { t:'=>', x:'25%', y:'50%', d:0.9  },
  { t:'::',  x:'70%', y:'45%', d:1.6 },
]

export default function TransicionSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="section" style={{
      minHeight: '70vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 3rem',
      position: 'relative', overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Floating code chars */}
      {FLOAT.map((f, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.08, 0.2, 0.08], y: [0, -12, 0] }}
          transition={{ duration: 4 + i * 0.3, delay: f.d, repeat: Infinity }}
          style={{
            position: 'absolute', left: f.x, top: f.y,
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--purple2)', userSelect: 'none', pointerEvents: 'none',
          }}
        >{f.t}</motion.div>
      ))}

      {/* Expanding rings on enter */}
      {inView && [0, 0.6, 1.2].map(d => (
        <motion.div key={d}
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 3.5, opacity: 0 }}
          transition={{ duration: 3, delay: d, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 180, height: 180, borderRadius: '50%',
            border: '1px solid var(--purple)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Neon lines */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        style={{
          position:'absolute', top:0, left:0, right:0, height:1,
          background:'linear-gradient(90deg, transparent, var(--purple), var(--green2), transparent)',
          boxShadow:'0 0 14px var(--purple)', transformOrigin:'center',
        }}
      />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.15, ease: [0.76, 0, 0.24, 1] }}
        style={{
          position:'absolute', bottom:0, left:0, right:0, height:1,
          background:'linear-gradient(90deg, transparent, var(--green2), var(--purple), transparent)',
          boxShadow:'0 0 14px var(--green)', transformOrigin:'center',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
        {/* Words animate in */}
        {[
          { words: ['Ya', 'has', 'visto', 'lo', 'que', 'construyo.'], baseDelay: 0.2, muted: false },
          { words: ['Ahora', 've', 'cómo', 'pienso.'], baseDelay: 0.55, muted: true },
        ].map((line, li) => (
          <div key={li} style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(1.7rem, 4vw, 3rem)',
            fontWeight: 800, lineHeight: 1.2,
            marginBottom: li === 0 ? '0.2em' : '1.4rem',
            overflow: 'hidden',
          }}>
            {line.words.map((w, wi) => (
              <motion.span key={wi}
                initial={{ y: '110%', opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.65, delay: line.baseDelay + wi * 0.07, ease: [0.16,1,0.3,1] }}
                style={{
                  display: 'inline-block', marginRight: '0.28em',
                  WebkitTextStroke: line.muted && wi >= 2 ? '1px var(--purple2)' : 'none',
                  color: line.muted && wi >= 2 ? "transparent" : line.muted && wi < 2 ? "var(--muted)" : "var(--text)",
                  fontWeight: line.muted && wi >= 2 ? 800 : line.muted ? 600 : 800,
                }}
              >{w}</motion.span>
            ))}
          </div>
        ))}

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.95 }}
          style={{ color: 'var(--muted2)', marginBottom: '2.5rem', fontSize: '1rem' }}
        >
          Hazme preguntas. Prueba cómo razono. Habla conmigo directamente.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.1 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {/* Main CTA → /chat */}
          <a href="/chat">
            <motion.button
              whileHover={{ boxShadow: 'var(--glow-purple)' }}
              className="btn-cyber"
              style={{ fontSize: '1rem', padding: '14px 40px' }}
            >
              abrir chat con héctor →
            </motion.button>
          </a>
          <a href="#interactuar">
            <button className="btn-cyber btn-cyber-green" style={{ fontSize: '0.9rem', padding: '12px 24px' }}>
              ver más opciones ↓
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
