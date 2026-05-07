import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { PROJECTS } from '../data/index.js'

const TABS   = ['problema', 'decisiones', 'errores', 'mejoras']
const TLABEL = { problema: 'Problema', decisiones: 'Decisiones', errores: 'Errores reales', mejoras: 'Qué mejoraría' }

function ProjectCard({ project, index }) {
  const [open, setOpen]         = useState(false)
  const [activeTab, setActiveTab] = useState('problema')
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const isGreen = project.tagColor === 'green'
  const accent  = isGreen ? 'var(--green)' : 'var(--purple)'
  const accent2 = isGreen ? 'var(--green2)' : 'var(--purple2)'
  const tab     = project.tabs[activeTab]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.75, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: '1.5rem' }}
    >
      <div className="cyber-card" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Accent bar on left */}
        <motion.div
          animate={{ height: open ? '100%' : '60%', opacity: open ? 1 : 0.4 }}
          style={{
            position: 'absolute', left: 0, top: 0,
            width: 2, background: accent,
            boxShadow: `0 0 12px ${accent}`,
          }}
        />

        {/* Header */}
        <div
          onClick={() => setOpen(!open)}
          style={{
            padding: '1.5rem 1.5rem 1.5rem 2rem',
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '1rem',
            cursor: 'none',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <motion.span
                animate={{ filter: [`drop-shadow(0 0 4px ${accent})`, `drop-shadow(0 0 12px ${accent})`, `drop-shadow(0 0 4px ${accent})`] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ fontSize: '1.5rem' }}
              >
                {project.icon}
              </motion.span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 700 }}>
                {project.name}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                padding: '3px 10px',
                background: isGreen ? 'rgba(16,185,129,0.08)' : 'rgba(139,92,246,0.08)',
                border: `1px solid ${isGreen ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`,
                color: accent2,
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              }}>
                {project.tag}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted2)', paddingLeft: 0 }}>{project.summary}</div>
          </div>

          <motion.div
            animate={{ rotate: open ? 180 : 0, color: open ? accent2 : 'var(--muted)' }}
            transition={{ duration: 0.35 }}
            style={{ fontSize: 20, flexShrink: 0, marginTop: 4 }}
          >↓</motion.div>
        </div>

        {/* Stack chips (collapsed) */}
        {!open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '0 2rem 1.4rem', display: 'flex', flexWrap: 'wrap', gap: 6 }}
          >
            {project.stack.map(s => (
              <span key={s} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                padding: '3px 8px',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
              }}>{s}</span>
            ))}
          </motion.div>
        )}

        {/* Expandable body */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {/* Tab bar */}
              <div style={{
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', padding: '0 1.5rem',
                overflowX: 'auto',
              }}>
                {TABS.map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      background: 'none', border: 'none',
                      borderBottom: `2px solid ${activeTab === key ? accent : 'transparent'}`,
                      color: activeTab === key ? 'var(--text)' : 'var(--muted)',
                      fontFamily: 'var(--font-mono)', fontSize: 12,
                      padding: '11px 16px',
                      cursor: 'none', whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >{TLABEL[key]}</button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  style={{ padding: '1.5rem 1.5rem 1.5rem 2rem' }}
                >
                  {activeTab === 'problema' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                      {project.stack.map(s => (
                        <span key={s} style={{
                          fontFamily: 'var(--font-mono)', fontSize: 11,
                          padding: '3px 8px',
                          background: 'var(--bg3)',
                          border: '1px solid var(--border)',
                          color: accent2,
                        }}>{s}</span>
                      ))}
                    </div>
                  )}
                  {(tab.content      || []).map((p, i) => (
                    <p key={i} style={{ fontSize: 13.5, color: 'var(--muted2)', lineHeight: 1.75, marginBottom: '0.75rem' }}>{p}</p>
                  ))}
                  {(tab.errors       || []).map((e, i) => (
                    <div key={i} className="error-quote">{e}</div>
                  ))}
                  {(tab.improvements || []).map((imp, i) => (
                    <div key={i} className="improve-item">
                      <span className="improve-arrow">→</span>
                      <span>{imp.text}</span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function ProyectosSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="proyectos" className="section" style={{ padding: '120px 3rem', maxWidth: 860, margin: '0 auto' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: '3rem' }}
      >
        <div className="section-eyebrow">ls ~/projects/</div>
        <h2 className="section-title">Lo que he construido</h2>
        <p style={{ color: 'var(--muted2)', maxWidth: 480, lineHeight: 1.7 }}>
          Proyectos reales, con sus problemas reales. Sin exagerar ni minimizar.
        </p>
      </motion.div>

      {PROJECTS.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
    </section>
  )
}
