import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Pista cyberpunk/ambient libre de derechos de Free Music Archive
const TRACK_URL = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kai_Engel/Satin/Kai_Engel_-_01_-_Satin.mp3'

export default function MusicPlayer() {
  const audioRef = useRef(null)
  const [muted,   setMuted]   = useState(false)
  const [playing, setPlaying] = useState(false)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    const audio = new Audio(TRACK_URL)
    audio.loop   = true
    audio.volume = 0.18
    audioRef.current = audio

    audio.addEventListener('canplaythrough', () => setReady(true))

    // Autoplay — necesita interacción del usuario en algunos browsers
    // Lo intentamos después de la primera interacción
    const tryPlay = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {})
      window.removeEventListener('click', tryPlay)
      window.removeEventListener('keydown', tryPlay)
    }

    // Intentar autoplay directo primero
    audio.play().then(() => setPlaying(true)).catch(() => {
      // Si falla (política del browser), esperar primera interacción
      window.addEventListener('click', tryPlay)
      window.addEventListener('keydown', tryPlay)
    })

    return () => {
      audio.pause()
      audio.src = ''
      window.removeEventListener('click', tryPlay)
      window.removeEventListener('keydown', tryPlay)
    }
  }, [])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    if (muted) {
      audio.volume = 0.18
      setMuted(false)
    } else {
      audio.volume = 0
      setMuted(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 4, duration: 0.6 }}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Etiqueta */}
      <AnimatePresence>
        {playing && !muted && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--muted)',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {/* Barras animadas */}
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
              {[0,1,2,3].map(i => (
                <motion.div key={i}
                  animate={{ height: [3, 8+Math.random()*4, 3] }}
                  transition={{ duration: 0.4+Math.random()*0.3, repeat: Infinity, delay: i*0.1 }}
                  style={{ width: 2, background: 'var(--purple)', borderRadius: 1 }}
                />
              ))}
            </div>
            AMBIENT
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        title={muted ? 'Activar música' : 'Silenciar música'}
        style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: 'rgba(11,11,16,0.9)',
          border: `1px solid ${muted ? 'var(--border)' : 'var(--purple)'}`,
          color: muted ? 'var(--muted)' : 'var(--purple2)',
          cursor: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
          boxShadow: muted ? 'none' : '0 0 12px rgba(139,92,246,0.3)',
          transition: 'all 0.2s',
        }}
      >
        {muted ? '🔇' : '🎵'}
      </motion.button>
    </motion.div>
  )
}
