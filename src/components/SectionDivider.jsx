import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function SectionDivider({ label }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} style={{
      position: 'relative', zIndex: 1,
      display: 'flex', alignItems: 'center',
      padding: '0 3rem', gap: 16,
      overflow: 'hidden',
    }}>
      {/* Left line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        style={{
          flex: 1, height: 1,
          background: 'linear-gradient(90deg, transparent, var(--purple))',
          transformOrigin: 'right',
          boxShadow: '0 0 8px rgba(139,92,246,0.4)',
        }}
      />
      {/* Label */}
      {label && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--purple2)', letterSpacing: '0.15em',
            whiteSpace: 'nowrap', padding: '4px 12px',
            border: '1px solid rgba(139,92,246,0.3)',
            background: 'rgba(139,92,246,0.06)',
          }}
        >
          {label}
        </motion.span>
      )}
      {/* Right line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        style={{
          flex: 1, height: 1,
          background: 'linear-gradient(90deg, var(--purple), transparent)',
          transformOrigin: 'left',
          boxShadow: '0 0 8px rgba(139,92,246,0.4)',
        }}
      />
    </div>
  )
}
