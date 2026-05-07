export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, system } = req.body
  const API_KEY = process.env.GEMINI_API_KEY

  if (!API_KEY) return res.status(500).json({ error: 'API key not configured' })

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents: messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    generationConfig: { maxOutputTokens: 800, temperature: 0.75 }
  })

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
      )
      const data = await response.json()
      if (data.error) {
        if (attempt < 2) { await new Promise(r => setTimeout(r, 2000)); continue }
        return res.status(500).json({ error: data.error.message })
      }
      const parts = data.candidates?.[0]?.content?.parts || []
      const replyPart = parts.find(p => !p.thought) || parts[parts.length - 1]
      return res.status(200).json({ reply: replyPart?.text || 'Error al procesar.' })
    } catch (e) {
      if (attempt < 2) { await new Promise(r => setTimeout(r, 2000)); continue }
      return res.status(500).json({ error: e.message })
    }
  }
}
