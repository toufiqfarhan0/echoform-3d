import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'assemblyai-token-middleware',
        configureServer(server) {
          const handleTokenRequest = async (req, res) => {
            const apiKey =
              env.ASSEMBLYAI_API_KEY ||
              env.VITE_ASSEMBLYAI_API_KEY ||
              process.env.ASSEMBLYAI_API_KEY ||
              process.env.VITE_ASSEMBLYAI_API_KEY ||
              req.headers['x-assemblyai-key']

            if (!apiKey) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              return res.end(
                JSON.stringify({
                  error: 'AssemblyAI API Key is not configured in .env',
                })
              )
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
                res.statusCode = response.status
                res.setHeader('Content-Type', 'application/json')
                return res.end(
                  JSON.stringify({
                    error: `AssemblyAI token request failed (${response.status}): ${errText}`,
                  })
                )
              }

              const payload = await response.json()
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  token: payload.token,
                  expiresInSeconds: payload.expires_in_seconds ?? 300,
                })
              )
            } catch (error) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error.message }))
            }
          }

          server.middlewares.use(async (req, res, next) => {
            const url = req.url ? req.url.split('?')[0] : ''
            if (url === '/api/token' || url === '/api/voice-agent-token') {
              return handleTokenRequest(req, res)
            }
            next()
          })
        },
      },
    ],
  }
})
