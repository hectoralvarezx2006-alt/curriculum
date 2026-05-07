import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
  { label: 'inicio',      href: '#hero' },
  { label: 'historia',    href: '#historia' },
  { label: 'proyectos',   href: '#proyectos' },
  { label: 'interactuar', href: '#interactuar' },
  { label: 'contacto',    href: '#contacto' },
]

export default function Nav({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="nav-logo">
            hector.dev<span style={{ color: 'var(--green2)' }}>_</span>
          </span>
          <ul className="nav-links">
            {LINKS.map(l => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
