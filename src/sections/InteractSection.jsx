import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { THINK_STEPS, SYSTEM_PROMPT } from '../data/index.js'

/* ─── CHAT ────────────────────────────────────────────────────── */
const QUICK_QS = [
  '¿Qué tecnologías conoces mejor?',
  '¿Por qué usaste IA en tus proyectos?',
  '¿Qué tipo de trabajo buscas?',
  '¿Cuál ha sido tu mayor aprendizaje?',
]

function ChatMode() {
  const [msgs,    setMsgs]    = useState([{ role: 'bot', text: 'Hola! Soy el asistente de Héctor. Puedo responderte sobre su experiencia, proyectos o forma de trabajar. ¿Qué quieres saber?' }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [showQs,  setShowQs]  = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) {
      const container = bottomRef.current.parentElement
      if (container) container.scrollTop = container.scrollHeight
    }
  }, [msgs])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput(''); setShowQs(false)
    setMsgs(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    const newHist = [...history, { role: 'user', content: msg }]
    setHistory(newHist)
    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHist,
        })
      })
      const data  = await res.json()
      const reply = data.content?.[0]?.text || 'Error al procesar la respuesta.'
      setHistory(prev => [...prev, { role: 'assistant', content: reply }])
      setMsgs(prev => [...prev, { role: 'bot', text: reply }])
    } catch {
      setMsgs(prev => [...prev, { role: 'bot', text: 'Error de conexión. Prueba de nuevo.' }])
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        minHeight: 300, maxHeight: 400,
        overflowY: 'auto',
        padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`chat-msg ${m.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}
          >
            {m.text}
          </motion.div>
        ))}
        {loading && (
          <div className="chat-msg chat-msg-bot">
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {showQs && (
          <motion.div exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 0' }}>
            {QUICK_QS.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                padding: '5px 12px',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--muted2)', cursor: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--purple)'; e.target.style.color = 'var(--purple2)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted2)' }}
              >{q}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Escribe tu pregunta..."
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="btn-cyber"
          style={{ padding: '10px 20px', fontSize: 12, opacity: loading || !input.trim() ? 0.4 : 1 }}
        >
          enviar
        </button>
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
        ✦ asistente IA con contexto real de héctor · powered by claude
      </p>
    </div>
  )
}

/* ─── DEBUG ───────────────────────────────────────────────────── */
function DebugMode() {
  const [answer,   setAnswer]   = useState('')
  const [revealed, setRevealed] = useState(false)

  return (
    <div>
      <p style={{ fontSize: 13.5, color: 'var(--muted2)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
        Bug real de mi proyecto de presupuestos. ¿Puedes encontrar qué falla?
      </p>

      <div className="code-block">
<span className="ck">def</span> <span className="cf">procesar_gasto</span>(texto_usuario, categorias):
    <span className="cc"># Llamar a la IA para clasificar el gasto</span>
    respuesta = llamar_openai(texto_usuario)

    datos     = json.loads(respuesta)
    categoria = datos[<span className="cs">"categoria"</span>]
    importe   = datos[<span className="cs">"importe"</span>]

    <span className="ck">if</span> categoria <span className="ck">in</span> categorias:  <span className="ch"><span className="cc">  ← falla aquí a veces</span></span>
        guardar_en_bd(categoria, importe)
        <span className="ck">return</span> <span className="cs">"Gasto guardado correctamente"</span>
    <span className="ck">else</span>:
        <span className="ck">return</span> <span className="cs">"Categoría no reconocida"</span>
      </div>

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: '0.75rem', color: 'var(--text)', marginTop: '1rem' }}>
        ¿Qué crees que falla? ¿Y cómo lo arreglarías?
      </div>

      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Escribe tu diagnóstico..."
        style={{ marginBottom: 12 }}
      />

      <button
        onClick={() => { if (answer.trim()) setRevealed(true) }}
        className="btn-cyber"
        style={{ fontSize: 13, padding: '10px 22px' }}
      >
        ver mi diagnóstico real
      </button>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '1.25rem', padding: '1.25rem',
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green2)', marginBottom: 10 }}>
              ✓ lo que encontré yo:
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--muted2)', lineHeight: 1.7, marginBottom: 8 }}>
              La IA a veces devuelve la categoría con espacios extra o mayúsculas diferentes.
              Si mis categorías son ["gasolina"] y la IA devuelve "Gasolina", el{' '}
              <code style={{ color: 'var(--purple2)' }}>in</code> de Python no lo encuentra.
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--muted2)', lineHeight: 1.7, marginBottom: 8 }}>
              Fix: <code style={{ color: 'var(--green2)' }}>categoria.strip().lower()</code> antes de comparar.
            </p>
            <p style={{ fontSize: 13, color: 'var(--green2)', fontStyle: 'italic' }}>
              Lección: cuando integras IA, nunca asumas que el output tendrá el formato exacto que esperas.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── THINK ───────────────────────────────────────────────────── */
function ThinkMode() {
  return (
    <div>
      <p style={{ fontSize: 13.5, color: 'var(--muted2)', marginBottom: '2rem', lineHeight: 1.7 }}>
        Cuando me enfrento a un problema, sigo este proceso.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {THINK_STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}
          >
            <div style={{
              flexShrink: 0, width: 40, height: 40,
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--purple2)',
              boxShadow: '0 0 12px rgba(139,92,246,0.15)',
            }}>{step.num}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{step.title}</div>
              <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, marginBottom: 4 }}>{step.desc}</p>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green2)', display: 'block' }}>
                {step.example}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─── MAIN ────────────────────────────────────────────────────── */
const MODES = [
  { id: 'chat',  label: '💬 Habla conmigo' },
  { id: 'debug', label: '🐛 Debug challenge' },
  { id: 'think', label: '🧠 Cómo pienso' },
]

export default function InteractSection() {
  const [mode, setMode] = useState('chat')
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="interactuar" className="section" style={{ padding: '120px 3rem', maxWidth: 860, margin: '0 auto' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: '2.5rem' }}
      >
        <div className="section-eyebrow">./interact --mode=all</div>
        <h2 className="section-title">Prueba cómo pienso</h2>
        <p style={{ color: 'var(--muted2)', maxWidth: 480, lineHeight: 1.7 }}>
          Tres formas de interactuar. Elige la que más te interese.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '2rem' }}
      >
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              padding: '9px 18px',
              background: mode === m.id ? 'rgba(139,92,246,0.1)' : 'var(--bg2)',
              border: `1px solid ${mode === m.id ? 'var(--purple)' : 'var(--border)'}`,
              color: mode === m.id ? 'var(--text)' : 'var(--muted)',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              cursor: 'none', transition: 'all 0.2s',
              boxShadow: mode === m.id ? '0 0 16px rgba(139,92,246,0.2)' : 'none',
            }}
          >{m.label}</button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="cyber-card"
        style={{ padding: '1.75rem' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {mode === 'chat'  && <ChatMode />}
            {mode === 'debug' && <DebugMode />}
            {mode === 'think' && <ThinkMode />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
