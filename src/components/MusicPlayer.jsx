import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const TRACK_URL = '/music.mp3'

export default function MusicPlayer() {
  const [on, setOn] = useState(false)
  const audio = useRef(null)

  useEffect(() => {
    audio.current = new Audio(TRACK_URL)
    audio.current.loop   = true
    audio.current.volume = 0.2
    // Try autoplay desktop
    audio.current.play().then(() => setOn(true)).catch(() => {})
    return () => { audio.current.pause(); audio.current.src = '' }
  }, [])

  const toggle = () => {
    if (!audio.current) return
    if (on) {
      audio.current.pause()
      setOn(false)
    } else {
      audio.current.play().then(() => setOn(true)).catch(e => console.log('audio error:', e))
    }
  }

  return (
    <motion.button
      onClick={toggle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3 }}
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