export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const apiKey =
      req.body?.apiKey ||
      req.headers['x-assemblyai-key'] ||
      process.env.VITE_ASSEMBLYAI_API_KEY

    if (!apiKey) {
      return res.status(400).json({
        error: 'Missing AssemblyAI API Key. Please provide it in settings or environment variables.',
      })
    }

    const cleanKey = apiKey.trim()
    const authHeader = cleanKey.startsWith('Bearer ')
      ? cleanKey
      : `Bearer ${cleanKey}`

    const response = await fetch(
      'https://agents.assemblyai.com/v1/token?expires_in_seconds=600',
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
        .json({ error: `AssemblyAI Token Error: ${errText}` })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
