import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HoloFace from '../components/HoloFace.jsx'
import Cursor from '../components/Cursor.jsx'
import { SYSTEM_PROMPT } from '../data/index.js'

/* ══════════════════════════════════════════════════════════
   TEMA (cambia aquí los colores del chat)
══════════════════════════════════════════════════════════ */
const T = {
  accent:   '#3b82f6',
  accent2:  '#60a5fa',
  ice:      '#dbe7ff',
  muted:    '#7f93b8',
  line:     'rgba(96,165,250,0.28)',
  lineSoft: 'rgba(96,165,250,0.14)',
  field:    'rgba(12,22,48,0.58)',
  panel:    'rgba(7,12,28,0.96)',
}
const SANS = "'Inter', var(--font-sans), system-ui, sans-serif"
const MONO = 'var(--font-mono)'

// Reconocimiento de voz del navegador (Chrome, Edge, Safari…). En Firefox no existe.
const SpeechRec =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

const GREETING =
  'Hola, soy el asistente de Héctor. Puedo responderte sobre su experiencia, proyectos o forma de trabajar. ¿Qué quieres saber?'

const QUICK_QS = [
  '¿Qué proyectos has hecho?',
  '¿Qué tecnologías dominas?',
  '¿Qué haces en Altia?',
  '¿Cómo aprendes cosas nuevas?',
  '¿Por qué te interesa la IA?',
]

const PANELS = {
  history: 'Historial',
}

const css = `
  .holo-root { height: 100vh; }
  @supports (height: 100dvh) { .holo-root { height: 100dvh; } }
  @keyframes holo-eq { 0%,100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  @keyframes holo-live {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,.55), 0 0 16px rgba(239,68,68,.45); }
    50%     { box-shadow: 0 0 0 9px rgba(239,68,68,0), 0 0 22px rgba(239,68,68,.6); }
  }
  .holo-live { animation: holo-live 1.4s ease-out infinite; }
  .holo-eq i { display:block; width:3px; height:16px; border-radius:2px; background:#fff; transform: scaleY(.3); transform-origin:center; }
  .holo-eq.on i { animation: holo-eq .9s ease-in-out infinite; }
  .holo-eq i:nth-child(1) { animation-delay: 0s; }
  .holo-eq i:nth-child(2) { animation-delay: .15s; }
  .holo-eq i:nth-child(3) { animation-delay: .3s; }
  .holo-eq i:nth-child(4) { animation-delay: .1s; }
  .holo-eq i:nth-child(5) { animation-delay: .25s; }
  .holo-input::placeholder { color: #6f84ad; }
  .holo-chip:hover { border-color: rgba(96,165,250,.6) !important; color: #dbe7ff !important; background: rgba(59,130,246,.14) !important; }
  .holo-menu-item:hover { background: rgba(59,130,246,.14) !important; }
  .holo-reply::-webkit-scrollbar { width: 3px; }
  .holo-reply::-webkit-scrollbar-thumb { background: rgba(96,165,250,.5); }
  @media (max-width: 640px) {
    .holo-chips { flex-wrap: nowrap !important; overflow-x: auto; justify-content: flex-start !important; scrollbar-width: none; }
    .holo-chips::-webkit-scrollbar { display: none; }
    .holo-chips button { flex-shrink: 0; white-space: nowrap; }
  }
`

/* ══════════════════════════════════════════════════════════
   EFECTO MÁQUINA DE ESCRIBIR
   La cara "habla" mientras `typing` es true.
══════════════════════════════════════════════════════════ */
function useTypewriter(text, id, cps = 45) {
  const [shown, setShown] = useState('')
  const [typing, setTyping] = useState(false)
  const skipRef = useRef(false)

  useEffect(() => {
    skipRef.current = false
    if (!text) {
      setShown('')
      setTyping(false)
      return
    }
    let i = 0
    let timer
    setShown('')
    setTyping(true)
    const step = () => {
      if (skipRef.current) {
        setShown(text)
        setTyping(false)
        return
      }
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) {
        setTyping(false)
        return
      }
      const ch = text[i - 1]
      const extra = /[.!?¿¡]/.test(ch) && /\s/.test(text[i] || ' ') ? 260 : /[,;:]/.test(ch) ? 120 : 0
      timer = setTimeout(step, 1000 / cps + extra)
    }
    timer = setTimeout(step, 250)
    return () => clearTimeout(timer)
  }, [text, id, cps])

  const skip = useCallback(() => {
    skipRef.current = true
    setShown(text)
    setTyping(false)
  }, [text])

  return { shown, typing, skip }
}

/* ══════════════════════════════════════════════════════════
   PANELES (historial)
══════════════════════════════════════════════════════════ */
function HistoryPanel({ msgs }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [])
  return (
    <div ref={ref} style={{ padding: '1.25rem', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {msgs.map((m, i) => (
        <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: m.role === 'user' ? T.muted : T.accent2, marginBottom: 4 }}>
            {m.role === 'user' ? 'TÚ' : 'HÉCTOR (IA)'}
          </div>
          <div style={{
            padding: '10px 14px', borderRadius: 14, fontFamily: SANS, fontSize: 14, lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            color: m.role === 'user' ? T.ice : '#b9c8e6',
            background: m.role === 'user' ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${m.role === 'user' ? T.line : T.lineSoft}`,
          }}>{m.text}</div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MÚSICA (usa el audio global creado en main.jsx)
══════════════════════════════════════════════════════════ */
function MusicToggle() {
  const [on, setOn] = useState(false)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    const audio = window.__audio
    if (!audio) {
      setAvailable(false)
      return
    }
    const update = () => setOn(!audio.paused)
    update()
    audio.addEventListener('play', update)
    audio.addEventListener('pause', update)
    return () => {
      audio.removeEventListener('play', update)
      audio.removeEventListener('pause', update)
    }
  }, [])

  const toggle = () => {
    const audio = window.__audio
    if (!audio) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }

  if (!available) return null

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Pausar música' : 'Activar música'}
      style={{
        position: 'absolute', top: 14, left: 16, zIndex: 5,
        height: 32, padding: '0 12px', borderRadius: 999,
        display: 'flex', alignItems: 'center', gap: 7,
        background: on ? 'rgba(59,130,246,0.16)' : 'rgba(12,22,48,0.5)',
        border: `1px solid ${on ? T.line : T.lineSoft}`,
        color: on ? T.ice : T.muted,
        fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em',
        cursor: 'none', transition: 'all .2s',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" />
        {on ? (
          <>
            <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M12.5 3.5a6.5 6.5 0 0 1 0 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </>
        ) : (
          <path d="M10.5 6l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        )}
      </svg>
      MÚSICA {on ? 'ON' : 'OFF'}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════
   PÁGINA
══════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const [msgs,     setMsgs]     = useState([{ role: 'bot', text: GREETING }])
  const [history,  setHistory]  = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [lastQ,    setLastQ]    = useState('')
  const [reply,    setReply]    = useState({ id: 0, text: GREETING })
  const [panel,    setPanel]    = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const inputRef = useRef(null)
  const replyRef = useRef(null)
  const menuRef  = useRef(null)

  const { shown, typing, skip } = useTypewriter(reply.text, reply.id)
  const speaking = typing && !loading
  const hasText  = input.trim().length > 0
  const isTouch  = typeof window !== 'undefined' && 'ontouchstart' in window

  /* ── Entrada por voz ─────────────────────────────────────── */
  const [listening, setListening] = useState(false)
  const [micMsg,    setMicMsg]    = useState('')
  const recRef   = useRef(null)
  const heardRef = useRef('')
  const sendRef  = useRef(null)
  const canMic   = !!SpeechRec

  const cancelListening = useCallback(() => {
    const r = recRef.current
    recRef.current = null
    heardRef.current = ''
    setListening(false)
    if (r) setInput('') // lo dictado se descarta; si no estaba escuchando, no toca lo escrito
    try { r?.abort() } catch { /* ya estaba parado */ }
  }, [])

  const startListening = () => {
    if (!SpeechRec || loading || recRef.current) return
    if (typing) skip()
    setMicMsg('')
    const rec = new SpeechRec()
    rec.lang = 'es-ES'
    rec.interimResults = true
    rec.continuous = false
    rec.maxAlternatives = 1
    heardRef.current = ''

    rec.onresult = (e) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript
      heardRef.current = text.trim()
      setInput(text)
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicMsg('Permiso de micrófono denegado. Actívalo en el navegador para poder hablar.')
      } else if (e.error === 'no-speech') {
        setMicMsg('No te he oído. Prueba otra vez.')
      } else if (e.error !== 'aborted') {
        setMicMsg('No he podido usar el micrófono. Puedes escribir tu mensaje.')
      }
    }
    rec.onend = () => {
      const cancelled = recRef.current !== rec
      recRef.current = null
      setListening(false)
      const text = heardRef.current
      heardRef.current = ''
      if (!cancelled && text) sendRef.current?.(text)
    }

    recRef.current = rec
    setInput('')
    setListening(true)
    try {
      rec.start()
    } catch {
      recRef.current = null
      setListening(false)
    }
  }

  const stopListening = () => {
    try { recRef.current?.stop() } catch { /* ya estaba parado */ }
  }

  // Aviso de micrófono: desaparece solo
  useEffect(() => {
    if (!micMsg) return
    const t = setTimeout(() => setMicMsg(''), 4500)
    return () => clearTimeout(t)
  }, [micMsg])

  // Al salir de la página, corta el micrófono
  useEffect(() => () => cancelListening(), [cancelListening])

  // Mantiene visible el final de la respuesta mientras se escribe
  useEffect(() => {
    if (replyRef.current) replyRef.current.scrollTop = replyRef.current.scrollHeight
  }, [shown, loading])

  // Esc cierra panel / menú
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      setPanel(null)
      cancelListening()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cancelListening])

  // Clic fuera cierra el menú "+"
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [menuOpen])

  const send = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setMenuOpen(false)
    setLastQ(msg)
    setMsgs((prev) => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    const hist = [...history, { role: 'user', content: msg }]
    setHistory(hist)

    let answer
    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
      if (!API_KEY || API_KEY === 'tu_api_key_aqui') {
        answer = '⚠️ Falta la API key. Crea .env con VITE_GEMINI_API_KEY=tu_key y reinicia.'
      } else {
        console.log('[Gemma] usando key:', API_KEY.slice(0, 8) + '...')

        const gemmaBody = JSON.stringify({
          contents: [
            { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'Entendido.' }] },
            ...hist.map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
          ],
          generationConfig: { maxOutputTokens: 800, temperature: 0.75 },
        })
        const gemmaURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`

        let data
        for (let attempt = 0; attempt < 3; attempt++) {
          const res = await fetch(gemmaURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: gemmaBody,
          })
          data = await res.json()
          if (!data.error) break
          if (attempt < 2) await new Promise((r) => setTimeout(r, 2000))
        }
        if (data.error) {
          console.error('[Gemma] error:', data.error)
          throw new Error(data.error.message || 'api_error')
        }
        const parts = data.candidates?.[0]?.content?.parts || []
        // Gemma-4 devuelve parts con thought:true (razonamiento) y thought:false (respuesta)
        const replyPart = parts.find((p) => !p.thought) || parts[parts.length - 1]
        let out = replyPart?.text || 'Error al procesar.'
        out = out.replace(/\*[^*]+\*/g, '').replace(/^[\s\n]+/, '').trim()
        setHistory((prev) => [...prev, { role: 'assistant', content: out }])
        answer = out
      }
    } catch {
      answer = 'Error de conexión. Prueba de nuevo.'
    }

    setMsgs((prev) => [...prev, { role: 'bot', text: answer }])
    setReply((r) => ({ id: r.id + 1, text: answer }))
    setLoading(false)
    if (!isTouch) inputRef.current?.focus()
  }

  sendRef.current = send

  const openPanel = (key) => {
    setMenuOpen(false)
    setPanel(key)
  }

  const status = loading
    ? { label: 'PENSANDO', color: '#fbbf24' }
    : listening
      ? { label: 'ESCUCHANDO', color: '#22d3ee' }
      : speaking
        ? { label: 'RESPONDIENDO', color: T.accent2 }
        : { label: 'EN ESPERA', color: 'var(--green2)' }

  const showChips = msgs.length <= 1 && !loading

  // Botón de la derecha: enviar (hay texto) · micrófono (vacío) · parar (escuchando)
  const showSend = hasText && !listening
  const micMode  = !showSend && canMic
  const rightLabel = listening
    ? 'Dejar de escuchar y enviar'
    : showSend
      ? 'Enviar mensaje'
      : micMode
        ? 'Hablar con el micrófono'
        : 'Estado del asistente'

  return (
    <div className="holo-root" style={{
      width: '100vw',
      background: '#04060f',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      <style>{css}</style>
      <Cursor />

      {/* TOP BAR */}
      <div className="chat-topbar" style={{
        height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(5,5,7,0.92)',
        backdropFilter: 'blur(20px)',
        zIndex: 10,
      }}>
        <a href="/" style={{ textDecoration: 'none', cursor: 'none' }}>
          <motion.span whileHover={{ color: 'var(--purple2)' }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', transition: 'color 0.2s' }}>
            ← hector.dev
          </motion.span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green2)', boxShadow: '0 0 8px var(--green)' }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green2)', letterSpacing: '0.1em' }}>
            HÉCTOR ÁLVAREZ · EN LÍNEA
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}>POWERED BY GEMMA 4</span>
      </div>

      {/* ESCENARIO */}
      <div style={{
        flex: 1, minHeight: 0, position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'radial-gradient(ellipse 70% 55% at 50% 36%, rgba(30,80,200,0.18), transparent 70%)',
      }}>
        {/* Rejilla de puntos */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(120,170,255,0.12) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, #000 25%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, #000 25%, transparent 80%)',
        }} />

        {/* Música (arriba a la izquierda) */}
        <MusicToggle />

        {/* Botón historial (arriba a la derecha) */}
        <button
          type="button"
          onClick={() => openPanel('history')}
          aria-label="Ver historial de la conversación"
          style={{
            position: 'absolute', top: 14, right: 16, zIndex: 5,
            height: 32, padding: '0 12px', borderRadius: 999,
            background: 'rgba(12,22,48,0.5)', border: `1px solid ${T.lineSoft}`,
            color: T.muted, fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em',
            cursor: 'none', transition: 'all .2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.color = T.ice }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.lineSoft; e.currentTarget.style.color = T.muted }}
        >
          HISTORIAL
        </button>

        {/* Cara */}
        <div style={{ flex: '1 1 0', minHeight: 200, width: '100%', maxWidth: 820, position: 'relative' }}>
          <HoloFace speaking={speaking && !listening} thinking={loading} listening={listening} />
        </div>

        {/* Estado */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, marginBottom: 10,
          fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em', color: status.color, zIndex: 2,
        }}>
          <motion.span
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: loading ? 0.8 : 1.6, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: status.color, boxShadow: `0 0 8px ${status.color}` }}
          />
          {status.label}
        </div>

        {/* Zona de texto: altura fija (la cara no se mueve) con respuesta + preguntas rápidas */}
        <div style={{
          width: '100%', maxWidth: 680, height: 'clamp(170px, 28vh, 250px)',
          flexShrink: 0, display: 'flex', flexDirection: 'column', zIndex: 2,
        }}>
        <div
          ref={replyRef}
          className="holo-reply"
          onClick={typing ? skip : undefined}
          style={{
            flex: 1, minHeight: 0, padding: '0 1.25rem',
            overflowY: 'auto', textAlign: 'center',
            cursor: typing ? 'pointer' : 'default',
          }}
        >
          {lastQ && (
            <div style={{
              fontFamily: MONO, fontSize: 11, color: T.muted, marginBottom: 8,
              letterSpacing: '0.02em', wordBreak: 'break-word',
            }}>
              ❯ {lastQ}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingTop: 10 }} aria-label="Pensando">
              {[0, 1, 2].map((i) => (
                <motion.span key={i}
                  animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent2 }}
                />
              ))}
            </div>
          ) : (
            <>
              <p aria-hidden="true" style={{
                fontFamily: SANS, fontSize: 'clamp(15px, 1.5vw, 17px)', lineHeight: 1.65,
                color: T.ice, whiteSpace: 'pre-wrap', margin: 0,
              }}>
                {shown}
                {typing && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ display: 'inline-block', width: 7, height: '1em', marginLeft: 3, verticalAlign: '-0.15em', background: T.accent2 }}
                  />
                )}
              </p>
              {/* Texto completo para lectores de pantalla (sin efecto de escritura) */}
              <p role="status" style={{
                position: 'absolute', width: 1, height: 1, overflow: 'hidden',
                clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
              }}>{typing ? '' : reply.text}</p>
            </>
          )}
        </div>

        {/* Preguntas rápidas (solo al empezar; luego la respuesta ocupa todo el espacio) */}
        {showChips && (
          <div className="holo-chips" style={{
            flexShrink: 0, padding: '10px 1.25rem 0',
            display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
          }}>
            {QUICK_QS.map((q, i) => (
              <motion.button key={q}
                type="button"
                className="holo-chip"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                onClick={() => send(q)}
                style={{
                  fontFamily: SANS, fontSize: 12, padding: '6px 13px', borderRadius: 999,
                  background: 'rgba(12,22,48,0.5)', border: `1px solid ${T.lineSoft}`,
                  color: T.muted, cursor: 'none', transition: 'all .2s',
                }}
              >{q}</motion.button>
            ))}
          </div>
        )}
        </div>

        {/* Barra de mensaje */}
        <div style={{
          width: '100%', maxWidth: 680, padding: '10px 1.25rem 0',
          position: 'relative', zIndex: 3, flexShrink: 0,
        }} ref={menuRef}>
          {micMsg && (
            <div role="alert" style={{
              position: 'absolute', left: 0, right: 0, bottom: 'calc(100% - 4px)',
              display: 'flex', justifyContent: 'center', padding: '0 1.25rem', pointerEvents: 'none',
            }}>
              <span style={{
                fontFamily: SANS, fontSize: 12, color: '#fbbf24', textAlign: 'center',
                background: 'rgba(4,6,15,0.9)', border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: 999, padding: '6px 14px',
              }}>{micMsg}</span>
            </div>
          )}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                role="menu"
                style={{
                  position: 'absolute', left: '1.25rem', bottom: 'calc(100% - 4px)',
                  width: 260, padding: 6, borderRadius: 16,
                  background: T.panel, border: `1px solid ${T.line}`,
                  boxShadow: '0 18px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)',
                }}
              >
                {[
                  { key: 'history', title: 'Historial',        sub: 'Revisa la conversación completa' },
                ].map((it) => (
                  <button key={it.key} type="button" role="menuitem"
                    className="holo-menu-item"
                    onClick={() => openPanel(it.key)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 11,
                      background: 'transparent', border: 'none', cursor: 'none', display: 'block',
                    }}
                  >
                    <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: T.ice }}>{it.title}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.muted, marginTop: 2 }}>{it.sub}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={(e) => { e.preventDefault(); if (hasText) send() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              height: 56, padding: '0 8px', borderRadius: 999,
              border: `1px solid ${T.line}`, background: T.field,
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.45), inset 0 0 24px rgba(59,130,246,0.08), 0 0 24px rgba(59,130,246,0.08)',
            }}
          >
            <button
              type="button"
              aria-label="Más opciones"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: menuOpen ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.16)',
                border: `1px solid ${T.lineSoft}`, color: T.ice, cursor: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .2s',
              }}
            >
              <motion.svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                animate={{ rotate: menuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </motion.svg>
            </button>

            <input
              ref={inputRef}
              className="holo-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? 'Te escucho…' : 'Escribe tu mensaje...'}
              aria-label="Escribe tu mensaje"
              disabled={loading}
              readOnly={listening}
              autoFocus={!isTouch}
              autoComplete="off"
              maxLength={500}
              style={{
                flex: 1, minWidth: 0, height: '100%', padding: 0,
                background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none',
                fontFamily: SANS, fontSize: 15, color: T.ice,
              }}
            />

            <button
              type={micMode ? 'button' : 'submit'}
              onClick={micMode ? (listening ? stopListening : startListening) : undefined}
              disabled={micMode && loading}
              aria-label={rightLabel}
              aria-pressed={micMode ? listening : undefined}
              className={listening ? 'holo-live' : undefined}
              style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: listening
                  ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                  : `linear-gradient(135deg, ${T.accent}, #1d4ed8)`,
                border: 'none', color: '#fff', cursor: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: listening ? undefined : '0 0 16px rgba(59,130,246,0.45)',
                opacity: micMode && loading ? 0.5 : loading && !speaking ? 0.85 : 1,
                transition: 'background .2s',
              }}
            >
              {showSend ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : micMode && !listening ? (
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                  <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" fill="currentColor" />
                  <path d="M3 7.5a5 5 0 0 0 10 0M8 12.5V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <span className={`holo-eq ${listening || speaking || loading ? 'on' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 16 }}>
                  <i /><i /><i /><i /><i />
                </span>
              )}
            </button>
          </form>
        </div>

        <div style={{
          fontFamily: SANS, fontSize: 11, color: '#5d7099', textAlign: 'center',
          padding: '10px 1.25rem max(14px, env(safe-area-inset-bottom))', zIndex: 2,
        }}>
          Asistente de IA con el contexto de Héctor. Puede cometer errores.
        </div>

        {/* PANELES */}
        <AnimatePresence>
          {panel && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setPanel(null)}
              style={{
                position: 'absolute', inset: 0, zIndex: 30,
                background: 'rgba(2,4,12,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 'clamp(8px, 3vw, 28px)',
              }}
            >
              <motion.div
                initial={{ y: 14, scale: 0.985 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 14, scale: 0.985 }}
                transition={{ duration: 0.22 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-label={PANELS[panel]}
                style={{
                  width: 'min(920px, 100%)', height: 'min(100%, 680px)',
                  display: 'flex', flexDirection: 'column',
                  background: T.panel, border: `1px solid ${T.line}`, borderRadius: 18,
                  boxShadow: '0 30px 80px rgba(0,0,0,0.65), 0 0 40px rgba(59,130,246,0.1)',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  height: 52, flexShrink: 0, padding: '0 14px 0 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: `1px solid ${T.lineSoft}`,
                }}>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: T.ice }}>{PANELS[panel]}</span>
                  <button type="button" onClick={() => setPanel(null)} aria-label="Cerrar" style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'transparent',
                    border: `1px solid ${T.lineSoft}`, color: T.muted, cursor: 'none', fontSize: 14,
                  }}>✕</button>
                </div>
                <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
                    {panel === 'history' && <HistoryPanel msgs={msgs} />}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}