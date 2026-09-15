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
          server.middlewares.use('/api/token', async (req, res, next) => {
            if (req.method !== 'POST') {
              return next()
            }

            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })

            req.on('end', async () => {
              try {
                let parsed = {}
                if (body) {
                  try {
                    parsed = JSON.parse(body)
                  } catch (e) {}
                }

                const apiKey =
                  parsed.apiKey ||
                  req.headers['x-assemblyai-key'] ||
                  env.VITE_ASSEMBLYAI_API_KEY

                if (!apiKey) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(
                    JSON.stringify({
                      error: 'Missing AssemblyAI API Key. Please provide it in settings or .env.',
                    })
                  )
                }

                const cleanKey = apiKey.trim()
                const authHeader = cleanKey.startsWith('Bearer ')
                  ? cleanKey
                  : `Bearer ${cleanKey}`

                // Call AssemblyAI Voice Agent token minting endpoint (GET request)
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
                  res.statusCode = response.status
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(
                    JSON.stringify({
                      error: `AssemblyAI Token Error (${response.status}): ${errText}`,
                    })
                  )
                }

                const data = await response.json()
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: error.message }))
              }
            })
          })
        },
      },
    ],
  }
})
