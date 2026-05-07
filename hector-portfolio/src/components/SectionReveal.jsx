import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// Wraps any section with a dramatic entrance animation
// variant: 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'glitch'
export default function SectionReveal({ children, variant = 'slideUp', delay = 0, id }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const variants = {
    slideUp: {
      hidden: { opacity: 0, y: 80 },
      show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } },
    },
    slideLeft: {
      hidden: { opacity: 0, x: 100 },
      show:   { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } },
    },
    slideRight: {
      hidden: { opacity: 0, x: -100 },
      show:   { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.88, filter: 'blur(8px)' },
      show:   { opacity: 1, scale: 1,    filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } },
    },
    clipReveal: {
      hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
      show:   { clipPath: 'inset(0 0% 0 0)',   opacity: 1, transition: { duration: 1,   ease: [0.76, 0, 0.24, 1], delay } },
    },
  }

  const chosen = variants[variant] || variants.slideUp

  return (
    <motion.div
      ref={ref}
      id={id}
      variants={chosen}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}
