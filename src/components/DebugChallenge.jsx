import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BUGS = [
  {
    id: 1,
    title: 'App de Presupuestos — Categoría no reconocida',
    difficulty: 'FÁCIL',
    diffColor: 'var(--green2)',
    context: 'La función procesa gastos usando IA. Funciona bien en pruebas pero falla aleatoriamente en producción.',
    error: 'KeyError: "gasolina" not found in categories',
    code: `def procesar_gasto(texto, categorias):
    respuesta = llamar_openai(texto)
    datos     = json.loads(respuesta)
    categoria = datos["categoria"]
    importe   = datos["importe"]

    if categoria in categorias:  # ← falla aquí
        guardar_en_bd(categoria, importe)
        return "Guardado"
    else:
        return "Categoría no reconocida"`,
    hints: [
      '¿Qué pasa si la IA devuelve "Gasolina" con mayúscula?',
      'Piensa en espacios al principio o al final del string.',
      'Python distingue entre "gasolina" y "Gasolina".',
    ],
    solution: 'categoria.strip().lower()',
    explanation: 'La IA devuelve strings con mayúsculas o espacios extra. Normalizando con .strip().lower() antes de comparar se resuelve. Lección: nunca asumir el formato exacto de un output de IA.',
  },
  {
    id: 2,
    title: 'Reproductor de Música — App se cuelga al rotar',
    difficulty: 'MEDIO',
    diffColor: 'var(--accent3, #f09f27)',
    context: 'La app Flutter funciona bien pero al rotar la pantalla se congela y a veces crashea.',
    error: 'FlutterError: setState() called after dispose()',
    code: `class PlayerScreen extends StatefulWidget {
  @override
  _PlayerScreenState createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  AudioPlayer player = AudioPlayer();

  @override
  void initState() {
    super.initState();
    player.play(AssetSource('song.mp3'));
    player.onDurationChanged.listen((d) {
      setState(() { /* update UI */ }); // ← falla aquí
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(/* ... */);
  }
  // dispose() no implementado
}`,
    hints: [
      '¿Qué pasa con el listener cuando el widget se destruye?',
      'Al rotar, Flutter destruye y recrea el widget.',
      'Necesitas limpiar los recursos en algún método del ciclo de vida.',
    ],
    solution: '@override void dispose() { player.dispose(); super.dispose(); }',
    explanation: 'Al rotar, Flutter destruye el widget pero el listener sigue activo e intenta llamar setState() en un widget ya eliminado. La solución es implementar dispose() para limpiar el AudioPlayer.',
  },
  {
    id: 3,
    title: 'App de Presupuestos — Costes de API disparados',
    difficulty: 'DIFÍCIL',
    diffColor: 'var(--pink, #ec4899)',
    context: 'La app funciona bien pero el coste de la API de OpenAI es 10x mayor de lo esperado.',
    error: 'Factura de $47 en vez de $4 estimados',
    code: `def clasificar_gasto(texto_nuevo, historial):
    # Llamar a la IA para clasificar
    respuesta = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            # Incluir todo el historial para "contexto"
            *[{"role": "user", "content": g} for g in historial],
            {"role": "user", "content": texto_nuevo}
        ]
    )
    return respuesta.choices[0].message.content`,
    hints: [
      '¿Cuántos tokens se envían en cada llamada?',
      'El historial crece con cada gasto añadido.',
      'Para clasificar UN gasto, ¿necesitas el historial completo?',
    ],
    solution: 'Eliminar el historial del prompt. Solo enviar SYSTEM_PROMPT + texto_nuevo.',
    explanation: 'Cada llamada enviaba todo el historial de gastos, multiplicando los tokens por el número de entradas. Para clasificar un gasto nuevo no necesitas el historial — solo el sistema prompt y el texto actual.',
  },
]

const PROMPT_PREFIXES = ['❯ ', '$ ', '> ']

export default function DebugChallenge() {
  const [bugIdx,    setBugIdx]    = useState(0)
  const [phase,     setPhase]     = useState('intro') // intro | debug | solved
  const [lines,     setLines]     = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [hintIdx,   setHintIdx]   = useState(0)
  const [solved,    setSolved]    = useState(false)
  const termRef   = useRef(null)
  const inputRef  = useRef(null)
  const bug = BUGS[bugIdx]

  useEffect(() => {
    // Reset when bug changes
    setPhase('intro')
    setLines([])
    setHintIdx(0)
    setSolved(false)
    setInput('')
  }, [bugIdx])

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [lines])

  const addLine = (text, type = 'output') => {
    setLines(prev => [...prev, { text, type, id: Date.now() + Math.random() }])
  }

  const startDebug = () => {
    setPhase('debug')
    addLine(`Cargando bug #${bug.id}: ${bug.title}`, 'system')
    addLine(`Dificultad: ${bug.difficulty}`, 'system')
    addLine('', 'empty')
    addLine('CONTEXTO:', 'label')
    addLine(bug.context, 'info')
    addLine('', 'empty')
    addLine('ERROR:', 'label')
    addLine(bug.error, 'error')
    addLine('', 'empty')
    addLine('Escribe tu diagnóstico o un comando. Prueba: hint, solve, reset', 'system')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleCommand = async (cmd) => {
    const c = cmd.trim().toLowerCase()
    addLine(`❯ ${cmd}`, 'cmd')
    setInput('')

    if (c === 'hint') {
      if (hintIdx < bug.hints.length) {
        addLine(`💡 PISTA ${hintIdx + 1}: ${bug.hints[hintIdx]}`, 'hint')
        setHintIdx(prev => prev + 1)
      } else {
        addLine('No hay más pistas. Escribe "solve" para ver la solución.', 'system')
      }
      return
    }

    if (c === 'solve' || c === 'solution' || c === 'solucion') {
      addLine('', 'empty')
      addLine('✓ SOLUCIÓN DE HÉCTOR:', 'success')
      addLine(bug.solution, 'code')
      addLine('', 'empty')
      addLine('EXPLICACIÓN:', 'label')
      addLine(bug.explanation, 'info')
      setSolved(true)
      setPhase('solved')
      return
    }

    if (c === 'reset' || c === 'clear') {
      setLines([])
      setPhase('intro')
      return
    }

    if (c === 'next') {
      setBugIdx(prev => (prev + 1) % BUGS.length)
      return
    }

    if (c === 'bugs' || c === 'list') {
      BUGS.forEach((b, i) => addLine(`[${i + 1}] ${b.title} — ${b.difficulty}`, 'info'))
      return
    }

    if (c.startsWith('bug ') || c.startsWith('select ')) {
      const n = parseInt(c.split(' ')[1]) - 1
      if (n >= 0 && n < BUGS.length) { setBugIdx(n); return }
    }

    // Send to AI for evaluation
    setLoading(true)
    addLine('Analizando...', 'system')

    try {
      const isProd = window.location.hostname !== 'localhost'
      let reply

      if (isProd) {
        const systemPrompt = `Eres Héctor Álvarez evaluando el diagnóstico de un bug de sus proyectos reales.

BUG: ${bug.title}
CONTEXTO: ${bug.context}
ERROR: ${bug.error}
CÓDIGO:
${bug.code}
SOLUCIÓN REAL: ${bug.solution}
EXPLICACIÓN: ${bug.explanation}

El usuario ha escrito este diagnóstico. Evalúalo brevemente en español:
- Si va bien encaminado: confirma y da una pista más concreta
- Si está equivocado: redirige sin dar la solución directamente
- Si es correcto: felicítale y muestra la solución completa
- Máximo 3 líneas. Sin markdown. Sin asteriscos.`

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: cmd }],
            system: systemPrompt
          })
        })
        const data = await res.json()
        reply = data.reply
      } else {
        reply = 'Modo local: escribe "hint" para pistas o "solve" para la solución.'
      }

      // Remove "Analizando..." line
      setLines(prev => prev.filter(l => l.text !== 'Analizando...'))
      addLine(reply, 'ai')

      // Check if AI says it's correct
      if (reply.toLowerCase().includes('correcto') || reply.toLowerCase().includes('exacto') || reply.toLowerCase().includes('bien')) {
        setTimeout(() => {
          addLine('', 'empty')
          addLine('✓ SOLUCIÓN COMPLETA:', 'success')
          addLine(bug.solution, 'code')
          addLine(bug.explanation, 'info')
          setSolved(true)
        }, 500)
      }
    } catch {
      setLines(prev => prev.filter(l => l.text !== 'Analizando...'))
      addLine('Error de conexión. Usa "hint" o "solve".', 'error')
    }
    setLoading(false)
  }

  const getLineStyle = (type) => {
    const base = { fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7, marginBottom: 2, wordBreak: 'break-word' }
    const styles = {
      cmd:    { ...base, color: 'var(--text)' },
      output: { ...base, color: 'var(--muted2)' },
      system: { ...base, color: 'var(--muted)', fontStyle: 'italic' },
      error:  { ...base, color: '#f87171', background: 'rgba(248,113,113,0.08)', padding: '2px 6px' },
      success:{ ...base, color: 'var(--green2)' },
      hint:   { ...base, color: 'var(--cyan, #06b6d4)' },
      info:   { ...base, color: 'var(--muted2)' },
      label:  { ...base, color: 'var(--purple2)', fontWeight: 700 },
      code:   { ...base, color: 'var(--green2)', background: 'rgba(52,211,153,0.06)', padding: '4px 8px' },
      ai:     { ...base, color: 'var(--purple2)' },
      empty:  { ...base, height: 6 },
    }
    return styles[type] || base
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Bug selector */}
      <div style={{
        display: 'flex', gap: 6, padding: '8px 1rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0, overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {BUGS.map((b, i) => (
          <button key={b.id} onClick={() => setBugIdx(i)} style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            padding: '4px 12px', whiteSpace: 'nowrap',
            background: bugIdx === i ? 'rgba(139,92,246,0.15)' : 'var(--bg3)',
            border: `1px solid ${bugIdx === i ? 'var(--purple)' : 'var(--border)'}`,
            color: bugIdx === i ? 'var(--purple2)' : 'var(--muted)',
            cursor: 'pointer', transition: 'all 0.15s',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <span style={{ color: b.diffColor, marginRight: 4 }}>●</span>
            Bug #{b.id}
          </button>
        ))}
      </div>

      {/* Terminal */}
      <div ref={termRef} style={{
        flex: 1, overflowY: 'auto', minHeight: 0,
        background: '#06060a',
        padding: '1rem',
        fontFamily: 'var(--font-mono)',
      }}>
        {phase === 'intro' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <div style={{ color: 'var(--green2)', fontSize: 11, marginBottom: 8 }}>
              ══ BUG #{bug.id}: {bug.title} ══
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>DIFICULTAD:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: bug.diffColor, fontWeight: 700 }}>{bug.difficulty}</span>
            </div>
            <div style={{ color: 'var(--muted2)', fontSize: 12, lineHeight: 1.7, marginBottom: 12 }}>
              {bug.context}
            </div>
            <div style={{ color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: 11,
              background: 'rgba(248,113,113,0.08)', padding: '8px 12px', marginBottom: 12 }}>
              ERROR: {bug.error}
            </div>
            {/* Code */}
            <div style={{
              background: '#03030a', border: '1px solid var(--border)',
              padding: '12px', fontSize: 11, lineHeight: 1.8,
              color: '#c9d1d9', overflowX: 'auto', marginBottom: 16,
              whiteSpace: 'pre',
            }}>
              {bug.code}
            </div>
            <button onClick={startDebug} style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              padding: '10px 20px', alignSelf: 'flex-start',
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid var(--green2)',
              color: 'var(--green2)', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s',
            }}>
              ❯ iniciar_debug()
            </button>
          </motion.div>
        ) : (
          <>
            {lines.map(line => (
              <div key={line.id} style={getLineStyle(line.type)}>
                {line.type !== 'empty' && line.text}
              </div>
            ))}
            {loading && (
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
              >
                procesando...
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      {phase === 'debug' && (
        <div style={{
          borderTop: '1px solid var(--border)',
          background: '#06060a', padding: '8px 1rem',
          display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ color: 'var(--green2)', fontFamily: 'var(--font-mono)', fontSize: 13, flexShrink: 0 }}>❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && input.trim() && !loading) handleCommand(input) }}
            placeholder="escribe tu diagnóstico o: hint / solve / next"
            disabled={loading}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12,
              outline: 'none', padding: '4px 0',
            }}
          />
          <button onClick={() => input.trim() && !loading && handleCommand(input)}
            style={{
              background: 'none', border: '1px solid var(--border)',
              color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 11,
              padding: '4px 10px', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              flexShrink: 0,
            }}>
            run
          </button>
        </div>
      )}

      {/* Solved - next bug */}
      {phase === 'solved' && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '10px 1rem', display: 'flex', gap: 10,
          alignItems: 'center', flexShrink: 0, flexWrap: 'wrap',
          background: 'rgba(52,211,153,0.04)',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green2)' }}>
            ✓ Bug resuelto
          </span>
          <button onClick={() => setBugIdx(prev => (prev + 1) % BUGS.length)} style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            padding: '5px 14px',
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid var(--purple)',
            color: 'var(--purple2)', cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}>
            siguiente bug →
          </button>
          <button onClick={() => { setPhase('intro'); setLines([]); setSolved(false); setHintIdx(0) }} style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            padding: '5px 14px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--muted)', cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}>
            reintentar
          </button>
        </div>
      )}
    </div>
  )
}