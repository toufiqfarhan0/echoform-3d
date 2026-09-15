import { AudioCapture } from './audioCapture'
import { AudioPlayer } from './audioPlayer'
import { ToolDispatcher } from './toolDispatcher'
import { useRoomStore } from '../store/useRoomStore'

export class VoiceAgentClient {
  constructor() {
    this.ws = null
    this.audioCapture = null
    this.audioPlayer = null
    this.isConnected = false
    this.isMuted = false
    this.assemblyAiKey = null
    this.groqKey = null
  }

  async connect(assemblyAiKey, groqKey) {
    if (this.isConnected) return

    this.assemblyAiKey =
      assemblyAiKey ||
      import.meta.env.VITE_ASSEMBLYAI_API_KEY ||
      localStorage.getItem('echoform_aai_key')

    this.groqKey =
      groqKey ||
      import.meta.env.VITE_GROQ_API_KEY ||
      localStorage.getItem('echoform_groq_key')

    if (!this.assemblyAiKey) {
      throw new Error('AssemblyAI API Key is required. Please add it in settings or .env.')
    }
    if (!this.groqKey) {
      throw new Error('Groq API Key is required. Please add it in settings or .env.')
    }

    useRoomStore.getState().setVoiceState({
      lastAgentReply: 'Minting secure temporary token...',
    })

    // 1. Fetch short-lived token from backend middleware
    const token = await this.fetchToken(this.assemblyAiKey)

    useRoomStore.getState().setVoiceState({
      lastAgentReply: 'Connecting to AssemblyAI Voice Agent WebSocket...',
    })

    // 2. Open WebSocket connection
    const wsUrl = `wss://agents.assemblyai.com/v1/ws?token=${token}`
    this.ws = new WebSocket(wsUrl)

    // 3. Setup Audio Player for Agent Speech
    this.audioPlayer = new AudioPlayer((agentVolume) => {
      useRoomStore.getState().setAudioLevel(agentVolume)
      useRoomStore.getState().setVoiceState({ isSpeaking: agentVolume > 0.05 })
    })

    // 4. Setup Audio Capture for User Microphone
    this.audioCapture = new AudioCapture(
      (base64Chunk) => {
        if (this.isConnected && !this.isMuted && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: 'input.audio',
              audio: base64Chunk,
            })
          )
        }
      },
      (micVolume) => {
        // Microphone volume for real-time 3D visualizer and soundwave HUD
        useRoomStore.getState().setAudioLevel(micVolume)
        useRoomStore.getState().setVoiceState({ isListening: micVolume > 0.05 })
      }
    )

    return new Promise((resolve, reject) => {
      this.ws.onopen = async () => {
        console.log('[VoiceAgentClient] WebSocket Connected!')
        this.sendSessionUpdate()
      }

      this.ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data)
          this.handleMessage(msg, resolve)
        } catch (e) {
          console.error('[VoiceAgentClient] Error parsing message:', e, event.data)
        }
      }

      this.ws.onerror = (err) => {
        console.error('[VoiceAgentClient] WebSocket Error:', err)
        useRoomStore.getState().setVoiceState({
          isConnected: false,
          lastAgentReply: 'Connection error. Check API keys and network.',
        })
        reject(err)
      }

      this.ws.onclose = () => {
        console.log('[VoiceAgentClient] WebSocket Closed')
        this.disconnect()
      }
    })
  }

  async fetchToken(apiKey) {
    const res = await fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to mint AssemblyAI token')
    }

    const data = await res.json()
    return data.token
  }

  sendSessionUpdate() {
    const payload = {
      type: 'session.update',
      session: {
        system_prompt: `You are EchoForm, an elite architectural interior staging agent. You help users style and customize their 3D modern living room in real time.

When the user asks to change furniture, lighting, or camera angles, call the appropriate tool immediately and give a concise, sophisticated confirmation (1-2 sentences max).

Available options:
- Sofa materials: boucle, leather, velvet, charcoal, emerald.
- Coffee table materials: marble (white), black_marble, oak, walnut, smoked_glass. Shape: oval, rectangle.
- Lighting presets: golden_hour, daylight, moody_night, cyberpunk_neon.
- Camera views: overview, sofa_focus, overhead_plan, window_view.
- Fixtures: floor_lamp (on/off), plant (on/off).`,
        voice: 'ivy',
        llm: {
          base_url: 'https://api.groq.com/openai/v1',
          model: 'llama-3.3-70b-versatile',
          api_key: this.groqKey,
        },
        tools: [
          {
            type: 'function',
            name: 'update_furniture',
            description: 'Change furniture material, color, or shape in the 3D room',
            parameters: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['sofa', 'coffee_table', 'table', 'rug'],
                },
                material: {
                  type: 'string',
                  description: 'Material choice (e.g. leather, velvet, boucle, marble, oak, walnut)',
                },
                color: {
                  type: 'string',
                  description: 'Optional custom color hex or name',
                },
                shape: {
                  type: 'string',
                  enum: ['oval', 'rectangle'],
                },
              },
              required: ['category'],
            },
          },
          {
            type: 'function',
            name: 'adjust_lighting',
            description: 'Change the atmospheric lighting and time of day in the 3D room',
            parameters: {
              type: 'object',
              properties: {
                preset: {
                  type: 'string',
                  enum: ['golden_hour', 'daylight', 'moody_night', 'cyberpunk_neon'],
                },
              },
              required: ['preset'],
            },
          },
          {
            type: 'function',
            name: 'set_camera_view',
            description: 'Transition the 3D camera viewpoint',
            parameters: {
              type: 'object',
              properties: {
                view: {
                  type: 'string',
                  enum: ['overview', 'sofa_focus', 'overhead_plan', 'window_view'],
                },
              },
              required: ['view'],
            },
          },
          {
            type: 'function',
            name: 'toggle_fixture',
            description: 'Toggle lamps or plants in the room',
            parameters: {
              type: 'object',
              properties: {
                fixture: {
                  type: 'string',
                  enum: ['floor_lamp', 'plant'],
                },
                state: {
                  type: 'string',
                  enum: ['on', 'off', 'toggle'],
                },
              },
              required: ['fixture'],
            },
          },
        ],
      },
    }

    console.log('[VoiceAgentClient] Sending session.update...')
    this.ws.send(JSON.stringify(payload))
  }

  async handleMessage(msg, onReadyResolve) {
    console.log('[VoiceAgentClient] Event:', msg.type, msg)

    switch (msg.type) {
      case 'session.ready': {
        this.isConnected = true
        useRoomStore.getState().setVoiceState({
          isConnected: true,
          lastAgentReply: "I'm listening. Ask me to change materials, lighting, or views.",
        })
        // Start capturing microphone input
        await this.audioCapture.start()
        if (onReadyResolve) onReadyResolve()
        break
      }

      case 'reply.audio': {
        // Stream incoming agent speech to speakers
        if (msg.audio) {
          useRoomStore.getState().setVoiceState({ isSpeaking: true })
          this.audioPlayer.playChunk(msg.audio)
        }
        break
      }

      case 'reply.done': {
        useRoomStore.getState().setVoiceState({ isSpeaking: false })
        break
      }

      case 'turn.interrupted': {
        // Natural interruption / barge-in
        console.log('[VoiceAgentClient] Barge-in detected: clearing playback buffer')
        this.audioPlayer.clearQueue()
        useRoomStore.getState().setVoiceState({ isSpeaking: false })
        break
      }

      case 'transcript': {
        if (msg.transcript) {
          if (msg.role === 'user') {
            useRoomStore.getState().setVoiceState({ lastTranscript: msg.transcript })
          } else {
            useRoomStore.getState().setVoiceState({ lastAgentReply: msg.transcript })
          }
        }
        break
      }

      case 'tool.call': {
        // Execute tool call and respond with tool.result
        const { call_id, name, arguments: args } = msg
        useRoomStore.getState().setVoiceState({
          lastToolCall: { name, args, timestamp: Date.now() },
        })

        let parsedArgs = {}
        try {
          parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
        } catch (e) {
          parsedArgs = args || {}
        }

        const result = ToolDispatcher.execute(name, parsedArgs)

        // Send back confirmation to AssemblyAI
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: 'tool.result',
              call_id,
              result: JSON.stringify(result),
            })
          )
        }
        break
      }

      default:
        break
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  disconnect() {
    this.isConnected = false
    if (this.audioCapture) {
      this.audioCapture.stop()
      this.audioCapture = null
    }
    if (this.audioPlayer) {
      this.audioPlayer.stop()
      this.audioPlayer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    useRoomStore.getState().setVoiceState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      lastAgentReply: 'Voice agent disconnected. Click to start session.',
    })
  }
}

// Singleton instance
export const voiceAgent = new VoiceAgentClient()
