import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const LINKS = [
  { icon: '✉',  label: 'Email',  sub: 'hectoralvarezx2006@gmail.com', href: 'mailto:hectoralvarezx2006@gmail.com', color: 'var(--purple)' },
  { icon: '⌥',  label: 'GitHub', sub: 'Próximamente',                  href: '#',                                   color: 'var(--green2)' },
]

export default function ContactoSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="contacto" className="section" style={{
      padding: '120px 3rem',
      maxWidth: 860, margin: '0 auto',
      textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Pulsing glow behind CTA */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 500, height: 500,
          background: 'radial-gradient(circle, var(--purple) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="section-eyebrow" style={{ justifyContent: 'center' }}>./contactar</div>

        {/* Title with clip reveal */}
        <div style={{ overflow: 'hidden', marginBottom: '0.5rem' }}>
          <motion.h2
            className="section-title"
            initial={{ y: '100%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Siguiente paso
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          style={{ color: 'var(--muted2)', maxWidth: 440, margin: '0 auto 3rem', lineHeight: 1.7 }}
        >
          Busco una empresa donde seguir aprendiendo mientras aporto desde el primer día.
          Si lo que has visto encaja con lo que necesitas, hablemos.
        </motion.p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16, maxWidth: 600, margin: '0 auto',
        }}>
          {LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="cyber-card"
              style={{
                padding: '1.75rem 1rem',
                textDecoration: 'none', color: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                cursor: 'none',
              }}
            >
              <motion.span
                animate={{ filter: [`drop-shadow(0 0 6px ${link.color})`, `drop-shadow(0 0 16px ${link.color})`, `drop-shadow(0 0 6px ${link.color})`] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                style={{ fontSize: '1.6rem' }}
              >
                {link.icon}
              </motion.span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{link.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>{link.sub}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
        style={{
          marginTop: '6rem', paddingTop: '2rem',
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--muted)', letterSpacing: '0.1em',
          position: 'relative', zIndex: 1,
        }}
      >
        héctor álvarez · dam 2025 · react + framer motion
      </motion.div>
    </section>
  )
}
