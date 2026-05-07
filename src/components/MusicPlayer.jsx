import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const TRACK_URL = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kai_Engel/Satin/Kai_Engel_-_01_-_Satin.mp3'

export default function MusicPlayer() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted,   setMuted]   = useState(false)

  useEffect(() => {
    const audio  = new Audio(TRACK_URL)
    audio.loop   = true
    audio.volume = 0.18
    audioRef.current = audio

    // Try autoplay on desktop
    audio.play().then(() => setPlaying(true)).catch(() => {})

    return () => { audio.pause(); audio.src = '' }
  }, [])

  const handleClick = () => {
    const audio = audioRef.current
    if (!audio) return

    if (!playing) {
      audio.play().then(() => { setPlaying(true); setMuted(false) }).catch(() => {})
      return
    }
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 4 }}
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        zIndex: 400, display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      {playing && !muted && (
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
          {[0,1,2,3].map(i => (
            <motion.div key={i}
              animate={{ height: [3, 10, 3] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
              style={{ width: 2, background: 'var(--purple)', borderRadius: 1 }}
            />
          ))}
        </div>
      )}
      <button
        onClick={handleClick}
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(11,11,16,0.95)',
          border: `1px solid ${playing && !muted ? 'var(--purple)' : 'var(--border)'}`,
          color: playing && !muted ? 'var(--purple2)' : 'var(--muted)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
          boxShadow: playing && !muted ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
          transition: 'all 0.2s',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {playing && !muted ? '🎵' : '🔇'}
      </button>
    </motion.div>
  )
}