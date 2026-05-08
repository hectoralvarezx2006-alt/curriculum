import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function MusicPlayer() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const audio = window.__audio
    if (!audio) return
    // Sync state with actual audio state
    const update = () => setOn(!audio.paused && audio.volume > 0)
    update()
    audio.addEventListener('play',  update)
    audio.addEventListener('pause', update)
    return () => {
      audio.removeEventListener('play',  update)
      audio.removeEventListener('pause', update)
    }
  }, [])

  const toggle = () => {
    const audio = window.__audio
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => setOn(true)).catch(() => {})
    } else {
      audio.pause()
      setOn(false)
    }
  }

  return (
    <motion.button
      onClick={toggle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      title={on ? 'Silenciar' : 'Activar música'}
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        zIndex: 9000,
        width: 42, height: 42, borderRadius: '50%',
        background: 'rgba(5,5,7,0.95)',
        border: `1.5px solid ${on ? 'var(--purple)' : 'var(--border)'}`,
        fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: on ? '0 0 16px rgba(139,92,246,0.4)' : 'none',
        transition: 'all 0.2s',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      {on ? '🎵' : '🔇'}
    </motion.button>
  )
}