import { useState, useRef, useEffect, useCallback } from 'react'
import Figure3D from '../components/Figure3D.jsx'
import { useWindowSize } from '../hooks/useWindowSize.js'
import { motion, AnimatePresence } from 'framer-motion'
import { SYSTEM_PROMPT, THINK_STEPS } from '../data/index.js'
import Cursor from '../components/Cursor.jsx'

/* ══════════════════════════════════════════════════════════
   MATRIX RAIN
══════════════════════════════════════════════════════════ */
function MatrixRain() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.width  = c.offsetWidth
    c.height = c.offsetHeight
    const ctx   = c.getContext('2d')
    const chars = '01アイウエオ</>{}[]();:=+-*&#ABCDEF'
    const cols  = Math.floor(c.width / 13)
    const drops = Array.from({ length: cols }, () => Math.random() * c.height)
    const tick  = () => {
      ctx.fillStyle = 'rgba(5,5,7,0.13)'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.font = '11px "Space Mono",monospace'
      drops.forEach((y, i) => {
        const ch     = chars[Math.floor(Math.random() * chars.length)]
        const bright = Math.random() > 0.92
        ctx.fillStyle = bright ? 'rgba(139,92,246,0.95)' : 'rgba(139,92,246,0.16)'
        ctx.fillText(ch, i * 13, y)
        drops[i] = y > c.height + Math.random() * 80 ? 0 : y + 13
      })
    }
    const iv = setInterval(tick, 50)
    return () => clearInterval(iv)
  }, [])
  return (
    <canvas ref={ref}
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.5 }}
    />
  )
}

/* ══════════════════════════════════════════════════════════
   GLITCH STRIPES (dentro del SVG, sobre la figura)
══════════════════════════════════════════════════════════ */
function GlitchStripes() {
  // Use plain rects with CSS animations to avoid framer-motion SVG width bug
  const stripes = Array.from({ length: 20 }, (_, i) => ({
    id:  i,
    y:   12 + i * 14,
    w:   50 + Math.random() * 90,
    x:   Math.random() * 40,
    op:  0.2 + Math.random() * 0.6,
    dur: (0.07 + Math.random() * 0.1).toFixed(3),
    dly: (1.5 + Math.random() * 6).toFixed(2),
  }))
  return (
    <>
      <style>{`
        @keyframes glitch-stripe {
          0%,100% { opacity: var(--op); transform: translateX(0); }
          45%      { opacity: 0.05;      transform: translateX(var(--dx)); }
          50%      { opacity: var(--op); transform: translateX(0); }
        }
      `}</style>
      {stripes.map(s => (
        <rect
          key={s.id}
          x={s.x} y={s.y}
          width={s.w} height={2}
          fill="rgba(255,255,255,0.85)"
          style={{
            opacity: s.op,
            animation: `glitch-stripe ${s.dur}s ${s.dly}s infinite`,
            '--op': s.op,
            '--dx': `${Math.random() > 0.5 ? 10 : -10}px`,
          }}
        />
      ))}
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   FIGURA HUMANA — una sola, centrada
══════════════════════════════════════════════════════════ */
function HumanFigure() {
  // mask path compartido para base + capas glitch
  const maskPath = (
    <>
      {/* Cabeza */}
      <ellipse cx="80" cy="36" rx="24" ry="30" fill="white"/>
      {/* Cuello */}
      <rect x="73" y="62" width="14" height="14" fill="white"/>
      {/* Hombros */}
      <path d="M32,76 Q80,68 128,76 L124,112 Q80,108 36,112 Z" fill="white"/>
      {/* Torso superior */}
      <path d="M36,112 Q80,108 124,112 L122,158 Q80,154 38,158 Z" fill="white"/>
      {/* Torso inferior / caderas */}
      <path d="M38,158 Q80,154 122,158 L126,196 Q80,200 34,196 Z" fill="white"/>
      {/* Brazo izquierdo */}
      <path d="M32,78 Q20,100 16,140 Q14,160 20,176 Q28,180 34,174 Q36,154 38,132 Q42,108 44,88 Z" fill="white"/>
      {/* Brazo derecho */}
      <path d="M128,78 Q140,100 144,140 Q146,160 140,176 Q132,180 126,174 Q124,154 122,132 Q118,108 116,88 Z" fill="white"/>
      {/* Pierna izquierda */}
      <path d="M38,196 Q46,200 56,200 L60,272 Q58,282 50,284 Q42,282 40,272 Z" fill="white"/>
      {/* Pierna derecha */}
      <path d="M122,196 Q114,200 104,200 L100,272 Q102,282 110,284 Q118,282 120,272 Z" fill="white"/>
      {/* Pie izquierdo */}
      <ellipse cx="50" cy="285" rx="13" ry="6" fill="white"/>
      {/* Pie derecho */}
      <ellipse cx="110" cy="285" rx="13" ry="6" fill="white"/>
    </>
  )

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2,
    }}>
      {/* Glow detrás */}
      <motion.div
        animate={{ opacity:[0.25,0.55,0.25], scale:[1,1.07,1] }}
        transition={{ duration:3.5, repeat:Infinity }}
        style={{
          position:'absolute',
          width:180, height:320,
          background:'radial-gradient(ellipse, rgba(139,92,246,0.55) 0%, transparent 65%)',
          filter:'blur(18px)', borderRadius:'50%',
        }}
      />

      {/* SVG BASE */}
      <div style={{ position:'relative', width:160, height:300 }}>
        <svg viewBox="0 0 160 300" xmlns="http://www.w3.org/2000/svg"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
          <defs>
            <linearGradient id="fg" x1="0%" y1="0%" x2="15%" y2="100%">
              <stop offset="0%"   stopColor="#c4b5fd" stopOpacity="0.95"/>
              <stop offset="45%"  stopColor="#8b5cf6" stopOpacity="0.85"/>
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.4"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <mask id="fm">{maskPath}</mask>
          </defs>
          {/* Silueta */}
          <rect x="0" y="0" width="160" height="300" fill="url(#fg)" mask="url(#fm)" filter="url(#glow)"/>
          {/* Líneas glitch encima */}
          <g mask="url(#fm)"><GlitchStripes /></g>
        </svg>

        {/* Capa CYAN glitch */}
        <motion.svg viewBox="0 0 160 300" xmlns="http://www.w3.org/2000/svg"
          animate={{
            x:        [-4, 6, -3, 2, 0],
            opacity:  [0, 0.65, 0, 0.5, 0],
            clipPath: [
              'inset(38% 0 48% 0)',
              'inset(18% 0 68% 0)',
              'inset(62% 0 22% 0)',
              'inset(8%  0 82% 0)',
              'inset(38% 0 48% 0)',
            ],
          }}
          transition={{ duration:0.16, repeat:Infinity, repeatDelay:2.6, ease:'linear' }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', mixBlendMode:'screen' }}
        >
          <defs><mask id="fc">{maskPath}</mask></defs>
          <rect x="0" y="0" width="160" height="300" fill="rgba(6,182,212,0.85)" mask="url(#fc)"/>
        </motion.svg>

        {/* Capa PINK glitch */}
        <motion.svg viewBox="0 0 160 300" xmlns="http://www.w3.org/2000/svg"
          animate={{
            x:        [3, -6, 4, -2, 0],
            opacity:  [0, 0.6, 0, 0.45, 0],
            clipPath: [
              'inset(62% 0 18% 0)',
              'inset(28% 0 58% 0)',
              'inset(5%  0 88% 0)',
              'inset(48% 0 38% 0)',
              'inset(62% 0 18% 0)',
            ],
          }}
          transition={{ duration:0.13, repeat:Infinity, repeatDelay:3.4, delay:0.9, ease:'linear' }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', mixBlendMode:'screen' }}
        >
          <defs><mask id="fp">{maskPath}</mask></defs>
          <rect x="0" y="0" width="160" height="300" fill="rgba(236,72,153,0.75)" mask="url(#fp)"/>
        </motion.svg>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   HUD
══════════════════════════════════════════════════════════ */
function HUD() {
  return (
    <>
      {[
        { top:12,    left:12,  borderTop:'1px solid var(--purple)', borderLeft:'1px solid var(--purple)' },
        { top:12,    right:12, borderTop:'1px solid var(--purple)', borderRight:'1px solid var(--purple)' },
        { bottom:12, left:12,  borderBottom:'1px solid var(--purple)', borderLeft:'1px solid var(--purple)' },
        { bottom:12, right:12, borderBottom:'1px solid var(--purple)', borderRight:'1px solid var(--purple)' },
      ].map((s,i) => (
        <motion.div key={i}
          animate={{ opacity:[0.3,1,0.3] }}
          transition={{ duration:2.2, delay:i*0.4, repeat:Infinity }}
          style={{ position:'absolute', width:20, height:20, zIndex:10, ...s }}
        />
      ))}
      {[
        { t:'ID: H.ALVAREZ',  style:{ left:'5%',  top:'5%'    } },
        { t:'STATUS: ONLINE', style:{ right:'5%', top:'5%'    } },
        { t:'DAM // 2025',    style:{ left:'5%',  bottom:'30%'} },
        { t:'BUILDER_MODE',   style:{ right:'5%', bottom:'30%'} },
      ].map((l,i) => (
        <motion.div key={i}
          animate={{ opacity:[0.25,0.9,0.25] }}
          transition={{ duration:2.8, delay:i*0.55, repeat:Infinity }}
          style={{
            position:'absolute', zIndex:10,
            fontFamily:'var(--font-mono)', fontSize:9,
            color:'var(--green2)', letterSpacing:'0.1em',
            ...l.style,
          }}
        >{l.t}</motion.div>
      ))}
      {/* Sweeping scanline */}
      <motion.div
        animate={{ y:['-5%','110%'] }}
        transition={{ duration:4, repeat:Infinity, ease:'linear', repeatDelay:2 }}
        style={{
          position:'absolute', left:0, right:0, height:3, zIndex:9,
          background:'linear-gradient(90deg,transparent,rgba(52,211,153,0.5),rgba(139,92,246,0.9),rgba(52,211,153,0.5),transparent)',
          boxShadow:'0 0 18px rgba(139,92,246,0.8)',
        }}
      />
      {/* CRT texture */}
      <div style={{
        position:'absolute', inset:0, zIndex:8, pointerEvents:'none',
        background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.055) 3px,rgba(0,0,0,0.055) 4px)',
      }}/>
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   WAVEFORM
══════════════════════════════════════════════════════════ */
function Waveform({ active }) {
  return (
    <div style={{ display:'flex', gap:2, alignItems:'center', height:22, marginTop:10 }}>
      {Array.from({ length:32 }).map((_,i) => (
        <motion.div key={i}
          animate={{ height: active ? [2, 4+Math.random()*14, 2] : [2,4,2] }}
          transition={{
            duration: active ? 0.2+Math.random()*0.3 : 1.4,
            repeat:Infinity, ease:'easeInOut', delay:Math.random()*0.4
          }}
          style={{ width:2, background:'var(--purple)', borderRadius:1, opacity:0.35+Math.random()*0.5 }}
        />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   CHAT MODE
══════════════════════════════════════════════════════════ */
const QUICK_QS = [
  '¿Qué proyectos has hecho?',
  '¿Qué tecnologías dominas?',
  '¿Qué tipo de trabajo buscas?',
  '¿Cómo aprendes cosas nuevas?',
  '¿Por qué te interesa la IA?',
]

function ChatMode({ onLoadingChange }) {
  const [msgs,    setMsgs]    = useState([{
    role:'bot',
    text:'Hola! Soy el asistente de Héctor. Puedo responderte sobre su experiencia, proyectos o forma de trabajar. ¿Qué quieres saber?'
  }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [showQs,  setShowQs]  = useState(true)
  const [retrying, setRetrying] = useState(false)
  const msgsRef  = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [msgs, loading])

  const send = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setShowQs(false)
    setMsgs(prev => [...prev, { role:'user', text:msg }])
    setLoading(true)
    onLoadingChange?.(true)
    const hist = [...history, { role:'user', content:msg }]
    setHistory(hist)
    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
      if (!API_KEY || API_KEY === 'tu_api_key_aqui') {
        setMsgs(prev => [...prev, { role:'bot', text:'⚠️ Falta la API key. Crea .env con VITE_GEMINI_API_KEY=tu_key y reinicia.' }])
        setLoading(false); onLoadingChange?.(false)
        return
      }
      console.log('[Gemma] usando key:', API_KEY.slice(0,8) + '...')

      const gemmaBody = JSON.stringify({
        contents: [
          { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Entendido.' }] },
          ...hist.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        ],
        generationConfig: { maxOutputTokens: 800, temperature: 0.75 }
      })
      const gemmaURL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${API_KEY}`

      let data
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(gemmaURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: gemmaBody,
        })
        data = await res.json()
        if (!data.error) break
        if (attempt < 2) await new Promise(r => setTimeout(r, 2000))
      }
      if (data.error) {
        console.error('[Gemma] error:', data.error)
        throw new Error(data.error.message || 'api_error')
      }
      const parts = data.candidates?.[0]?.content?.parts || []
      // Gemma-4 devuelve parts con thought:true (razonamiento) y thought:false (respuesta)
      // Filtramos solo la respuesta final
      const replyPart = parts.find(p => !p.thought) || parts[parts.length - 1]
      let reply = replyPart?.text || 'Error al procesar.'
      // Quitar cualquier bloque de thinking que se cuele como texto
      reply = reply.replace(/\*[^*]+\*/g, '').replace(/^[\s\n]+/, '').trim()
      setHistory(prev => [...prev, { role:'assistant', content:reply }])
      setMsgs(prev => [...prev, { role:'bot', text:reply }])
    } catch {
      setMsgs(prev => [...prev, { role:'bot', text:'Error de conexión. Prueba de nuevo.' }])
    }
    setLoading(false)
    onLoadingChange?.(false)
    inputRef.current?.focus()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Mensajes */}
      <div ref={msgsRef} style={{
        flex:1, overflowY:'auto', padding:'1rem 1.25rem',
        display:'flex', flexDirection:'column', gap:10,
      }}>
        {msgs.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity:0, y:8 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.25 }}
            style={{ alignSelf: m.role==='user' ? 'flex-end' : 'flex-start', maxWidth:'80%' }}
          >
            {m.role === 'bot' && (
              <div style={{
                fontFamily:'var(--font-mono)', fontSize:9,
                color:'var(--purple2)', letterSpacing:'0.1em', marginBottom:3,
              }}>HÉCTOR</div>
            )}
            <div style={{
              padding:'9px 13px',
              fontFamily:'var(--font-mono)', fontSize:12.5, lineHeight:1.65,
              background: m.role==='user' ? 'rgba(139,92,246,0.12)' : 'var(--bg3)',
              border: `1px solid ${m.role==='user' ? 'rgba(139,92,246,0.35)' : 'var(--border)'}`,
              color: m.role==='user' ? 'var(--text)' : 'var(--muted2)',
              clipPath: m.role==='user'
                ? 'polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,0 100%)'
                : 'polygon(7px 0,100% 0,100% 100%,0 100%,0 7px)',
            }}>{m.text}</div>
          </motion.div>
        ))}
        {loading && (
          <div style={{ alignSelf:'flex-start' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--purple2)', letterSpacing:'0.1em', marginBottom:3 }}>HÉCTOR</div>
            <div style={{
              padding:'11px 14px', background:'var(--bg3)', border:'1px solid var(--border)',
              clipPath:'polygon(7px 0,100% 0,100% 100%,0 100%,0 7px)',
              display:'flex', gap:5, alignItems:'center',
            }}>
              {retrying
                ? <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--green2)' }}>rate limit · reintentando...</span>
                : [0,1,2].map(i => (
                <motion.div key={i}
                  animate={{ y:[0,-5,0] }}
                  transition={{ duration:0.7, delay:i*0.15, repeat:Infinity }}
                  style={{ width:5, height:5, borderRadius:'50%', background:'var(--purple2)' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick questions */}
      <AnimatePresence>
        {showQs && (
          <motion.div
            exit={{ opacity:0, height:0, overflow:'hidden' }}
            style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'4px 1.25rem 8px' }}
          >
            {QUICK_QS.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                fontFamily:'var(--font-mono)', fontSize:10, padding:'5px 10px',
                background:'var(--bg3)', border:'1px solid var(--border)',
                color:'var(--muted2)', cursor:'none', transition:'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.borderColor='var(--purple)'; e.target.style.color='var(--purple2)' }}
                onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--muted2)' }}
              >{q}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div style={{ padding:'0.75rem 1.25rem', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center' }}>
        <div style={{ flex:1, position:'relative' }}>
          <span style={{
            position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
            fontFamily:'var(--font-mono)', fontSize:12, color:'var(--green2)', pointerEvents:'none',
          }}>❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Escribe tu pregunta..."
            disabled={loading}
            autoFocus
            style={{
              paddingLeft:26, height:40, fontSize:12,
              clipPath:'polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,0 100%)',
            }}
          />
        </div>
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="btn-cyber"
          style={{ height:40, padding:'0 16px', fontSize:11, opacity: loading||!input.trim() ? 0.4 : 1 }}
        >
          enviar
        </button>
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', padding:'3px 1.25rem 8px', letterSpacing:'0.08em' }}>
        ✦ IA con contexto real de héctor · powered by gemma 4
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   DEBUG MODE
══════════════════════════════════════════════════════════ */
function DebugMode() {
  const [answer,   setAnswer]   = useState('')
  const [revealed, setRevealed] = useState(false)

  return (
    <div style={{ padding:'1.25rem', overflowY:'auto', height:'100%', color:'var(--text)' }}>
      <p style={{ fontSize:13, color:'var(--muted2)', marginBottom:'1rem', lineHeight:1.7 }}>
        Bug real de mi proyecto de presupuestos. ¿Puedes encontrar qué falla?
      </p>
      <div className="code-block" style={{ marginBottom:'1rem', fontSize:12 }}>
<span className="ck">def</span> <span className="cf">procesar_gasto</span>(texto, categorias):
    respuesta = llamar_openai(texto)
    datos     = json.loads(respuesta)
    categoria = datos[<span className="cs">"categoria"</span>]
    importe   = datos[<span className="cs">"importe"</span>]

    <span className="ck">if</span> categoria <span className="ck">in</span> categorias: <span className="ch"><span className="cc"> ← falla a veces</span></span>
        guardar_en_bd(categoria, importe)
        <span className="ck">return</span> <span className="cs">"Guardado"</span>
    <span className="ck">else</span>:
        <span className="ck">return</span> <span className="cs">"Categoría no reconocida"</span>
      </div>
      <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text)', marginBottom:8 }}>
        ¿Qué crees que falla? ¿Cómo lo arreglarías?
      </div>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Escribe tu diagnóstico..."
        style={{ marginBottom:10, fontSize:12, minHeight:72, width:'100%' }}
      />
      <button
        onClick={() => { if (answer.trim()) setRevealed(true) }}
        className="btn-cyber"
        style={{ fontSize:12, padding:'8px 18px' }}
      >
        ver diagnóstico real
      </button>
      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            style={{ marginTop:'1rem', padding:'1rem', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.2)' }}
          >
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--green2)', marginBottom:8 }}>✓ lo que encontré yo:</div>
            <p style={{ fontSize:13, color:'var(--muted2)', lineHeight:1.7, marginBottom:6 }}>
              La IA devuelve <code style={{color:'var(--purple2)'}}>{"\"Gasolina\""}</code> pero mis categorías tienen <code style={{color:'var(--purple2)'}}>{"\"gasolina\""}</code>. El <code style={{color:'var(--purple2)'}}>in</code> de Python falla por diferencia de mayúsculas.
            </p>
            <p style={{ fontSize:12, color:'var(--green2)', fontStyle:'italic' }}>
              Fix: <code>categoria.strip().lower()</code> antes de comparar.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   THINK MODE
══════════════════════════════════════════════════════════ */
function ThinkMode() {
  return (
    <div style={{ padding:'1.25rem', overflowY:'auto', height:'100%' }}>
      <p style={{ fontSize:13, color:'var(--muted2)', marginBottom:'1.5rem', lineHeight:1.7 }}>
        Mi proceso cuando me enfrento a un problema:
      </p>
      {THINK_STEPS.map((step, i) => (
        <motion.div key={step.num}
          initial={{ opacity:0, x:-16 }}
          animate={{ opacity:1, x:0 }}
          transition={{ duration:0.5, delay:i * 0.1 }}
          style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:'1.25rem' }}
        >
          <div style={{
            flexShrink:0, width:36, height:36,
            background:'rgba(139,92,246,0.1)',
            border:'1px solid rgba(139,92,246,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-mono)', fontSize:11, color:'var(--purple2)',
            boxShadow:'0 0 10px rgba(139,92,246,0.15)',
          }}>{step.num}</div>
          <div>
            <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text)', marginBottom:3 }}>{step.title}</div>
            <p style={{ fontSize:12.5, color:'var(--muted2)', lineHeight:1.7, marginBottom:3 }}>{step.desc}</p>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--green2)' }}>{step.example}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}


function FigureResponsive() {
  const { width } = useWindowSize()
  const isMobile  = width < 768
  const figW = isMobile ? Math.min(width * 0.65, 220) : 220
  const figH = Math.round(figW * 1.45)
  return <Figure3D width={Math.round(figW)} height={figH} />
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
const MODES = [
  { id:'chat',  label:'💬 Habla conmigo' },
  { id:'debug', label:'🐛 Debug challenge' },
  { id:'think', label:'🧠 Cómo pienso' },
]

export default function ChatPage() {
  const [mode,    setMode]    = useState('chat')
  const [loading, setLoading] = useState(false)

  return (
    <div style={{
      height:'100vh', width:'100vw',
      background:'var(--bg)',
      display:'flex', flexDirection:'column',
      overflow:'hidden',
    }}>
      <Cursor />

      {/* TOP BAR */}
      <div style={{
        height:52, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 1.5rem',
        borderBottom:'1px solid var(--border)',
        background:'rgba(5,5,7,0.92)',
        backdropFilter:'blur(20px)',
        zIndex:10,
      }}>
        <a href="/" style={{ textDecoration:'none', cursor:'none' }}>
          <motion.span whileHover={{ color:'var(--purple2)' }}
            style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--muted)', transition:'color 0.2s' }}>
            ← hector.dev
          </motion.span>
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <motion.div
            animate={{ opacity:[0.3,1,0.3] }}
            transition={{ duration:1.4, repeat:Infinity }}
            style={{ width:7, height:7, borderRadius:'50%', background:'var(--green2)', boxShadow:'0 0 8px var(--green)' }}
          />
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--green2)', letterSpacing:'0.1em' }}>
            HÉCTOR ÁLVAREZ · EN LÍNEA
          </span>
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)' }}>POWERED BY GEMMA 4</span>
      </div>

      {/* BODY */}
      <div className="chat-layout" style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>

        {/* ── IZQUIERDA: FIGURA ── */}
        <div className="chat-figure-panel" style={{
          width:'34%', flexShrink:0,
          position:'relative',
          borderRight:'1px solid var(--border)',
          overflow:'hidden',
          background:'var(--bg)',
        }}>
          <MatrixRain />
          <FigureResponsive />
          <HUD />

          {/* Info inferior */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, zIndex:11,
            padding:'0.9rem 1.1rem',
            background:'linear-gradient(to top, rgba(5,5,7,0.98) 60%, transparent)',
          }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted)', marginBottom:3, letterSpacing:'0.12em' }}>
              HABLANDO CON
            </div>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:18, fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em' }}>
              Héctor Álvarez
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--purple2)', marginTop:1 }}>
              Programador · DAM 2025
            </div>
            <Waveform active={mode==='chat' && loading} />
          </div>
        </div>

        {/* ── DERECHA: INTERACT ── */}
        <div className="chat-interact-panel" style={{
          flex:1, display:'flex', flexDirection:'column',
          minWidth:0, overflow:'hidden',
          background:'var(--bg)',
        }}>
          {/* Header + tabs */}
          <div style={{
            padding:'1rem 1.25rem 0',
            borderBottom:'1px solid var(--border)',
            flexShrink:0,
            background:'var(--bg)',
          }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--green2)', letterSpacing:'0.12em', marginBottom:5 }}>
              ./interact --mode=all
            </div>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:'1.1rem', fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:12 }}>
              Prueba cómo pienso
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} style={{
                  padding:'7px 14px', fontSize:11,
                  fontFamily:'var(--font-mono)',
                  background:  mode===m.id ? 'rgba(139,92,246,0.12)' : 'transparent',
                  border:      `1px solid ${mode===m.id ? 'var(--purple)' : 'var(--border)'}`,
                  borderBottom: mode===m.id ? '1px solid var(--bg)' : '1px solid var(--border)',
                  color:       mode===m.id ? 'var(--text)' : 'var(--muted)',
                  cursor:'none', transition:'all 0.2s',
                  marginBottom: mode===m.id ? '-1px' : '0',
                  position:'relative', zIndex:1,
                  boxShadow: mode===m.id ? '0 0 12px rgba(139,92,246,0.2)' : 'none',
                }}>{m.label}</button>
              ))}
            </div>
          </div>

          {/* Panel content */}
          <div style={{ flex:1, minHeight:0, overflow:'hidden', position:'relative' }}>
            <AnimatePresence mode="wait">
              <motion.div key={mode}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-8 }}
                transition={{ duration:0.2 }}
                style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}
              >
                {mode==='chat'  && <ChatMode onLoadingChange={setLoading} />}
                {mode==='debug' && <DebugMode />}
                {mode==='think' && <ThinkMode />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
