export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages = [], activeFile = '', fileContent = '', customApiKey = '' } = req.body || {}
    const apiKey = (customApiKey || process.env.GROQ_API_KEY || '').trim()

    if (!apiKey) {
      return res.status(200).json({
        reply: 'GROQ_API_KEY belum disetel. Silakan tambahkan GROQ_API_KEY pada Environment Variables Vercel atau masukkan API Key di menu Pengaturan aplikasi.'
      })
    }

    const systemPrompt = `Kamu adalah AI Voice & Code Assistant.
Bantu user memahami kode, membuat kode baru, atau merefaktor kode.
Gunakan format markdown yang jelas jika menyertakan kode.
${activeFile ? `File aktif saat ini: ${activeFile}` : ''}
${fileContent ? `Isi file:\n${fileContent}` : ''}`

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10)
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        temperature: 0.2
      })
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const msg = errData?.error?.message || `Groq API Error: ${response.statusText}`
      return res.status(200).json({ reply: `Gagal memproses permintaan: ${msg}` })
    }

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content || 'Tidak ada balasan dari AI.'

    return res.status(200).json({ reply })
  } catch (error) {
    return res.status(200).json({
      reply: `Terjadi kendala sistem: ${error.message}`
    })
  }
}
