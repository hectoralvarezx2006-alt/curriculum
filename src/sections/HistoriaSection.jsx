import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { COMMITS } from '../data/index.js'

function CommitItem({ commit, index, total }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} style={{ position: 'relative', paddingLeft: 44, paddingBottom: index === total - 1 ? 0 : '2.5rem' }}>
      {/* Line */}
      {index < total - 1 && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          style={{
            position: 'absolute', left: 13, top: 22,
            width: 1, bottom: 0,
            background: 'linear-gradient(to bottom, var(--purple), rgba(139,92,246,0.08))',
            transformOrigin: 'top',
          }}
        />
      )}
      {/* Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.08, type: 'spring', stiffness: 200 }}
        style={{
          position: 'absolute', left: 0, top: 4,
          width: 26, height: 26, borderRadius: '50%',
          background: commit.isHead ? 'var(--purple)' : 'var(--bg)',
          border: `2px solid ${commit.isHead ? 'var(--purple2)' : 'var(--purple)'}`,
          boxShadow: commit.isHead
            ? '0 0 20px var(--purple), 0 0 40px rgba(139,92,246,0.3)'
            : '0 0 8px rgba(139,92,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {commit.isHead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -28 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.65, delay: 0.1 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green2)', marginBottom: 5 }}>
          {commit.date}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>{commit.hash}</span>
          <span style={{ color: commit.isHead ? 'var(--purple2)' : 'var(--text)' }}>{commit.msg}</span>
          {commit.isHead && (
            <motion.span
              animate={{ boxShadow: ['0 0 6px var(--purple)', '0 0 18px var(--purple)', '0 0 6px var(--purple)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontSize: 10, padding: '2px 9px',
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.5)',
                color: 'var(--purple2)',
              }}
            >HEAD</motion.span>
          )}
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--muted2)', lineHeight: 1.7, maxWidth: 580 }}>
          {commit.desc}
        </p>
      </motion.div>
    </div>
  )
}

export default function HistoriaSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="historia" className="section" style={{
      padding: '120px 3rem',
      maxWidth: 860, margin: '0 auto',
    }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: '4rem' }}
      >
        <div className="section-eyebrow">git log --author="hector"</div>
        <h2 className="section-title">Cómo llegué hasta aquí</h2>
        <p style={{ color: 'var(--muted2)', maxWidth: 460, lineHeight: 1.7 }}>
          No un CV. Momentos donde algo hizo clic de verdad.
        </p>
      </motion.div>

      {COMMITS.map((c, i) => (
        <CommitItem key={c.hash} commit={c} index={i} total={COMMITS.length} />
      ))}
    </section>
  )
}
