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
  }

  async connect() {
    if (this.isConnected) return

    useRoomStore.getState().setVoiceState({
      lastAgentReply: 'Connecting to AssemblyAI Voice Agent...',
    })

    // 1. Fetch short-lived token from serverless endpoint (no keys exposed to client)
    const token = await this.fetchToken()

    // 2. Open WebSocket connection
    const wsUrl = `wss://agents.assemblyai.com/v1/ws?token=${encodeURIComponent(token)}`
    this.ws = new WebSocket(wsUrl)

    // 3. Setup Audio Player for Agent Speech (24kHz mono PCM)
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
        useRoomStore.getState().setAudioLevel(micVolume)
        useRoomStore.getState().setVoiceState({ isListening: micVolume > 0.05 })
      }
    )

    return new Promise((resolve, reject) => {
      this.ws.onopen = async () => {
        console.log('[VoiceAgentClient] WebSocket Connected to AssemblyAI!')
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
          lastAgentReply: 'AssemblyAI connection failed. Ensure ASSEMBLYAI_API_KEY is in .env',
        })
        reject(err)
      }

      this.ws.onclose = () => {
        console.log('[VoiceAgentClient] WebSocket Closed')
        this.disconnect()
      }
    })
  }

  async fetchToken() {
    let res = await fetch('/api/voice-agent-token')
    if (!res.ok) {
      // Fallback to /api/token
      res = await fetch('/api/token')
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to mint AssemblyAI temporary token. Check .env configuration.')
    }

    const data = await res.json()
    if (!data.token) {
      throw new Error('AssemblyAI returned no token')
    }
    return data.token
  }

  sendSessionUpdate() {
    const greetingText =
      "Hello! I am EchoForm, your spatial interior designer. What style inspires you today — sleek modern minimalist or warm vintage mid-century? And what color palette do you envision for your room?"

    const payload = {
      type: 'session.update',
      session: {
        system_prompt: `You are EchoForm, a world-class architectural interior designer and spatial staging agent.
You proactively consult with the user to design their 3D living room in real-time.

Key Behavioral Guidelines:
1. Always offer curated options (e.g., "Do you like a modern minimalist vibe or warm vintage mid-century? What colors do you prefer?").
2. Whenever the user indicates a preference for furniture material, shape, lighting atmosphere, or camera angle, immediately call the corresponding tool.
3. Keep spoken replies concise, enthusiastic, and sophisticated (1-2 sentences maximum).
4. After making a change, proactively suggest the next aesthetic element to adjust (e.g., "I've set the sofa to warm bouclé. Would you like a Nordic oak or black marble coffee table to complement it?").

Available Options & Tools:
- Sofa materials: boucle, leather, velvet, charcoal, emerald.
- Coffee table materials: marble, black_marble, oak, walnut, smoked_glass. Shape: oval, rectangle.
- Lighting presets: golden_hour, daylight, moody_night, cyberpunk_neon.
- Camera views: overview, sofa_focus, overhead_plan, window_view.
- Fixtures: floor_lamp (on/off), plant (on/off).`,
        greeting: greetingText,
        input: {
          format: { encoding: 'audio/pcm' },
        },
        output: {
          voice: 'anna',
          format: { encoding: 'audio/pcm' },
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

    console.log('[VoiceAgentClient] Sending session.update:', payload)
    this.ws.send(JSON.stringify(payload))
  }

  async handleMessage(msg, onReadyResolve) {
    console.log('[VoiceAgentClient] Event:', msg.type, msg)

    switch (msg.type) {
      case 'session.error': {
        console.error('[VoiceAgentClient] Session error received:', msg)
        const errorDetail =
          msg.error || msg.message || msg.detail || (typeof msg === 'object' ? JSON.stringify(msg) : String(msg))
        useRoomStore.getState().setVoiceState({
          isConnected: false,
          lastAgentReply: `Agent Error: ${errorDetail}`,
        })
        break
      }

      case 'session.ready': {
        this.isConnected = true
        useRoomStore.getState().setVoiceState({
          isConnected: true,
          lastAgentReply: "I'm listening. Ask me about modern or vintage styles, colors, and lighting.",
        })
        // Record greeting in workspace history
        useRoomStore.getState().addTranscriptToHistory(
          'agent',
          "Hello! I am EchoForm, your spatial interior designer. What style inspires you today — sleek modern minimalist or warm vintage mid-century?"
        )
        // Start microphone
        await this.audioCapture.start()
        if (onReadyResolve) onReadyResolve()
        break
      }

      case 'reply.audio': {
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
        console.log('[VoiceAgentClient] Barge-in detected: clearing audio queue')
        this.audioPlayer.clearQueue()
        useRoomStore.getState().setVoiceState({ isSpeaking: false })
        break
      }

      case 'transcript': {
        if (msg.transcript) {
          if (msg.role === 'user') {
            useRoomStore.getState().setVoiceState({ lastTranscript: msg.transcript })
            useRoomStore.getState().addTranscriptToHistory('user', msg.transcript)
          } else {
            useRoomStore.getState().setVoiceState({ lastAgentReply: msg.transcript })
            useRoomStore.getState().addTranscriptToHistory('agent', msg.transcript)
          }
        }
        break
      }

      case 'tool.call': {
        const { call_id, name, arguments: args } = msg
        let parsedArgs = {}
        try {
          parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
        } catch (e) {
          parsedArgs = args || {}
        }

        useRoomStore.getState().setVoiceState({
          lastToolCall: { name, args: parsedArgs, timestamp: Date.now() },
        })

        const result = ToolDispatcher.execute(name, parsedArgs)

        // Add tool action to conversation history
        useRoomStore.getState().addTranscriptToHistory(
          'agent',
          `[Action Applied] ${name.replace('_', ' ')}`,
          { name, args: parsedArgs }
        )

        // Send confirmation back to AssemblyAI
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
    useRoomStore.getState().setVoiceState({ isListening: !this.isMuted })
    return this.isMuted
  }

  disconnect() {
    if (this.audioCapture) {
      this.audioCapture.stop()
      this.audioCapture = null
    }
    if (this.audioPlayer) {
      this.audioPlayer.stop()
      this.audioPlayer = null
    }
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close()
      }
      this.ws = null
    }
    this.isConnected = false
    this.isMuted = false
    useRoomStore.getState().setVoiceState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      lastAgentReply: 'Voice Agent disconnected. Click to reconnect.',
      audioLevel: 0,
    })
    useRoomStore.getState().setAudioLevel(0)
  }
}

export const voiceAgent = new VoiceAgentClient()
