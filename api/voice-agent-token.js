export default async function handler(req, res) {
  const apiKey =
    process.env.ASSEMBLYAI_API_KEY ||
    process.env.VITE_ASSEMBLYAI_API_KEY ||
    req.headers['x-assemblyai-key']

  if (!apiKey) {
    return res.status(500).json({
      error: 'AssemblyAI is not configured. Please set ASSEMBLYAI_API_KEY in your environment.',
    })
  }

  try {
    const cleanKey = apiKey.trim()
    const authHeader = cleanKey.startsWith('Bearer ')
      ? cleanKey
      : `Bearer ${cleanKey}`

    const response = await fetch(
      'https://agents.assemblyai.com/v1/token?expires_in_seconds=300&max_session_duration_seconds=900',
      {
        method: 'GET',
        headers: {
          Authorization: authHeader,
        },
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      return res
        .status(response.status)
        .json({ error: 'AssemblyAI token request failed', detail: errText })
    }

    const payload = await response.json()
    if (!payload.token) {
      return res.status(502).json({ error: 'AssemblyAI returned no temporary token' })
    }

    return res.status(200).json({
      token: payload.token,
      expiresInSeconds: payload.expires_in_seconds ?? 300,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
