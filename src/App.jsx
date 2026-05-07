import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cursor            from './components/Cursor.jsx'
import MusicPlayer       from './components/MusicPlayer.jsx'
import LoadingScreen     from './components/LoadingScreen.jsx'
import SectionDivider    from './components/SectionDivider.jsx'
import HeroSection       from './sections/HeroSection.jsx'
import HistoriaSection   from './sections/HistoriaSection.jsx'
import ProyectosSection  from './sections/ProyectosSection.jsx'
import TransicionSection from './sections/TransicionSection.jsx'
import ContactoSection   from './sections/ContactoSection.jsx'

const NAV_ITEMS = [
  { label: 'inicio',    href: '#hero' },
  { label: 'historia',  href: '#historia' },
  { label: 'proyectos', href: '#proyectos' },
  { label: 'contacto',  href: '#contacto' },
]

function SiteNav({ current }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 500, height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(5,5,7,0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--purple2)', letterSpacing: '0.05em' }}>
          hector.dev<span style={{ color: 'var(--green2)' }}>_</span>
        </span>

        {/* Desktop */}
        <ul className="nav-desktop" style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV_ITEMS.map((item, i) => (
            <li key={item.href}>
              <a href={item.href} style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: current === i ? 'var(--text)' : 'var(--muted)',
                textDecoration: 'none', letterSpacing: '0.05em',
                transition: 'color 0.2s', cursor: 'none',
              }}>
                {current === i && <span style={{ color: 'var(--green2)', marginRight: 4 }}>›</span>}
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/chat" style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--purple2)', textDecoration: 'none',
              letterSpacing: '0.05em', cursor: 'none',
              border: '1px solid rgba(139,92,246,0.4)',
              padding: '4px 12px',
            }}>chat →</a>
          </li>
        </ul>

        {/* Hamburger móvil */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(!open)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text)', cursor: 'none',
            flexDirection: 'column', gap: 5, padding: 4,
          }}
        >
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{
                rotate:  open ? (i === 0 ? 45 : i === 2 ? -45 : 0) : 0,
                y:       open ? (i === 0 ? 7  : i === 2 ? -7  : 0) : 0,
                opacity: open && i === 1 ? 0 : 1,
              }}
              style={{ width: 22, height: 1.5, background: 'var(--purple2)', borderRadius: 2 }}
            />
          ))}
        </button>
      </motion.nav>

      {/* Dropdown móvil */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 60, left: 0, right: 0,
              zIndex: 499,
              background: 'rgba(5,5,7,0.98)',
              borderBottom: '1px solid var(--border)',
              padding: '0.5rem 1.5rem 1rem',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {[...NAV_ITEMS, { label: 'chat →', href: '/chat' }].map((item, i) => (
              <a key={item.href} href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 14,
                  color: item.href === '/chat' ? 'var(--purple2)' : 'var(--text)',
                  textDecoration: 'none', padding: '0.75rem 0',
                  borderBottom: i < NAV_ITEMS.length ? '1px solid var(--border)' : 'none',
                  cursor: 'none',
                }}
              >{item.label}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  const [ready,   setReady]   = useState(false)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top    = '0'
    body.style.left   = '0'
    body.style.right  = '0'
    body.style.width  = '100%'
    window.scrollTo(0, 0)
  }, [])

  const handleDone = () => {
    const html = document.documentElement
    const body = document.body
    html.style.overflow = ''
    body.style.overflow = ''
    body.style.position = ''
    body.style.top    = ''
    body.style.left   = ''
    body.style.right  = ''
    body.style.width  = ''
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      setReady(true)
    }))
  }

  useEffect(() => {
    if (!ready) return
    const ids = ['hero', 'historia', 'proyectos', 'contacto']
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = ids.indexOf(e.target.id)
          if (idx !== -1) setCurrent(idx)
        }
      }),
      { threshold: 0.35 }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [ready])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Cursor />
      <LoadingScreen onDone={handleDone} />
      {ready && <SiteNav current={current} />}
      {ready && <MusicPlayer />}
      <main style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <HeroSection started={ready} />
        <SectionDivider label="// historia" />
        <HistoriaSection />
        <SectionDivider label="// proyectos" />
        <ProyectosSection />
        <TransicionSection />
        <SectionDivider label="// contacto" />
        <ContactoSection />
      </main>
    </div>
  )
}
