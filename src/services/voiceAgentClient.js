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
    this.lastEvent = null
    this.pendingTools = []
  }

  async connect() {
    if (this.isConnected) return

    useRoomStore.getState().setVoiceState({
      lastAgentReply: 'Connecting to AssemblyAI Voice Agent...',
      isConnected: false,
    })

    // Pre-initialize audio player with user gesture context
    this.audioPlayer = new AudioPlayer((agentVolume) => {
      useRoomStore.getState().setAudioLevel(agentVolume)
      useRoomStore.getState().setVoiceState({ isSpeaking: agentVolume > 0.04 })
    })
    this.audioPlayer.ensureContext()

    // 1. Fetch short-lived token from server endpoint
    const token = await this.fetchToken()

    // 2. Open WebSocket connection
    const wsUrl = `wss://agents.assemblyai.com/v1/ws?token=${encodeURIComponent(token)}`
    this.ws = new WebSocket(wsUrl)

    // 3. Setup Audio Capture for User Microphone
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
          lastAgentReply: 'AssemblyAI connection failed. Ensure ASSEMBLYAI_API_KEY is configured in .env',
        })
        reject(err)
      }

      this.ws.onclose = (ev) => {
        console.log('[VoiceAgentClient] WebSocket Closed:', ev.code, ev.reason)
        this.disconnect()
      }
    })
  }

  async fetchToken() {
    let res = await fetch('/api/voice-agent-token')
    if (!res.ok) {
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
      "Hi! I'm EchoForm, your spatial interior designer. How can I help style your space today?"

    const payload = {
      type: 'session.update',
      session: {
        system_prompt: `You are EchoForm, an autonomous spatial interior designer who designs full 3D living rooms live via voice.

Core Conversational Flow:
1. Always guide the user proactively by offering aesthetic options:
   - Ask: "Do you want a modern minimalist interior with light oak and bouclé, or an old vintage aesthetic with Italian saddle leather and dark walnut? What colors do you like?"
2. When the user selects or describes a preference, immediately call the matching tool to mutate the 3D room.
3. Keep spoken replies concise, enthusiastic, and sophisticated (1-2 sentences maximum).
4. After applying a change, suggest the next complementary element (e.g., "I've staged Italian leather for the sofa. Would you like a Nero Marquina black marble table or warm golden hour sunset lighting to go with it?").

Tools Available:
- update_furniture(category: 'sofa'|'table'|'rug', material: 'leather'|'boucle'|'velvet'|'charcoal'|'emerald'|'marble'|'black_marble'|'oak'|'walnut'|'smoked_glass', shape: 'oval'|'rectangle')
- adjust_lighting(preset: 'golden_hour'|'daylight'|'moody_night'|'cyberpunk_neon')
- set_camera_view(view: 'overview'|'sofa_focus'|'overhead_plan'|'window_view')
- toggle_fixture(fixture: 'floor_lamp'|'plant', state: 'on'|'off'|'toggle')`,
        greeting: greetingText,
        input: {
          format: { encoding: 'audio/pcm' },
          turn_detection: {
            vad_threshold: 0.5,
            min_silence: 700,
            max_silence: 2500,
            interrupt_response: true,
          },
        },
        output: {
          voice: 'ivy',
          format: { encoding: 'audio/pcm' },
          volume: 100,
        },
        tools: [
          {
            type: 'function',
            name: 'update_furniture',
            description: 'Change furniture material, color, or shape in the 3D room. Call this when the user asks to change, customize, or style the sofa, coffee table, or rug.',
            parameters: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['sofa', 'coffee_table', 'table', 'rug'],
                },
                material: {
                  type: 'string',
                  description: 'Material choice: leather, velvet, boucle, charcoal, emerald, marble, black_marble, oak, walnut, smoked_glass',
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
            execution_mode: 'interactive',
          },
          {
            type: 'function',
            name: 'adjust_lighting',
            description: 'Change the atmospheric lighting and time of day in the 3D room. Call this when the user asks for golden hour, daylight, moody night, or cyberpunk neon.',
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
            execution_mode: 'interactive',
          },
          {
            type: 'function',
            name: 'set_camera_view',
            description: 'Transition the 3D camera viewpoint. Call this when the user asks to zoom in on the sofa, view from overhead, look at the window, or reset to room overview.',
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
            execution_mode: 'interactive',
          },
          {
            type: 'function',
            name: 'toggle_fixture',
            description: 'Toggle floor lamp or plants in the room. Call this when the user asks about the lamp, lighting fixture, or plant.',
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
            execution_mode: 'interactive',
          },
        ],
      },
    }

    console.log('[VoiceAgentClient] Sending session.update:', payload)
    this.ws.send(JSON.stringify(payload))
  }

  async flushPendingTools() {
    if (!this.pendingTools.length) return
    if (this.ws?.readyState !== WebSocket.OPEN) return

    for (const tool of this.pendingTools) {
      this.ws.send(
        JSON.stringify({
          type: 'tool.result',
          call_id: tool.call_id,
          result: JSON.stringify(tool.result),
        })
      )
    }
    this.pendingTools = []
  }

  async handleMessage(msg, onReadyResolve) {
    console.log('[VoiceAgentClient] Event:', msg.type, msg)
    this.lastEvent = msg.type

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
        // Record initial greeting in workspace chat
        useRoomStore.getState().addTranscriptToHistory(
          'agent',
          "Hi! I'm EchoForm, your spatial interior designer. How can I help style your space today?"
        )
        // Start microphone capture
        await this.audioCapture.start()
        if (onReadyResolve) onReadyResolve()
        break
      }

      case 'input.speech.started': {
        // User started speaking (barge-in)
        this.audioPlayer.clearQueue()
        useRoomStore.getState().setVoiceState({ isListening: true, isSpeaking: false })
        break
      }

      case 'input.speech.stopped': {
        useRoomStore.getState().setVoiceState({ isListening: false })
        break
      }

      case 'reply.started': {
        useRoomStore.getState().setVoiceState({ isSpeaking: true })
        break
      }

      case 'reply.audio': {
        // AssemblyAI audio chunks can arrive as msg.data or msg.audio
        const audioChunk = msg.data || msg.audio
        if (audioChunk) {
          useRoomStore.getState().setVoiceState({ isSpeaking: true })
          this.audioPlayer.playChunk(audioChunk)
        }
        break
      }

      case 'reply.done': {
        useRoomStore.getState().setVoiceState({ isSpeaking: false })
        // Drain pending tool calls if any
        if (msg.status !== 'interrupted') {
          await this.flushPendingTools()
        } else {
          this.pendingTools = []
        }
        break
      }

      case 'transcript.user.delta': {
        // Streaming partial user transcript
        if (msg.text) {
          useRoomStore.getState().setLiveDeltaTranscript(msg.text, 'user')
        }
        break
      }

      case 'transcript.user': {
        // Final user transcript
        if (msg.text) {
          useRoomStore.getState().setLiveDeltaTranscript(null, 'user')
          useRoomStore.getState().addTranscriptToHistory('user', msg.text)
        }
        break
      }

      case 'transcript.agent.delta': {
        // Word-by-word streaming agent speech captions
        if (msg.text) {
          useRoomStore.getState().setLiveDeltaTranscript(msg.text, 'agent')
        }
        break
      }

      case 'transcript.agent': {
        // Final agent transcript
        if (msg.text) {
          useRoomStore.getState().setLiveDeltaTranscript(null, 'agent')
          useRoomStore.getState().addTranscriptToHistory('agent', msg.text)
          useRoomStore.getState().setVoiceState({ lastAgentReply: msg.text })
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

        // Add tool action badge to active workspace history
        useRoomStore.getState().addTranscriptToHistory(
          'agent',
          `[Action Applied] ${name.replace('_', ' ')}: ${Object.entries(parsedArgs).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
          { name, args: parsedArgs }
        )

        this.pendingTools.push({ call_id, result })

        // If reply.done already fired, flush immediately
        if (this.lastEvent === 'reply.done') {
          await this.flushPendingTools()
        }
        break
      }

      default:
        break
    }
  }

  /**
   * Typed text fallback / simulation: allows users to submit text instructions
   */
  async submitTextMessage(text) {
    if (!text || !text.trim()) return

    const trimmed = text.trim()
    useRoomStore.getState().addTranscriptToHistory('user', trimmed)

    const lower = trimmed.toLowerCase()
    let responseText = "I've updated the room styling."

    if (lower.includes('vintage') || lower.includes('leather')) {
      ToolDispatcher.execute('update_furniture', { category: 'sofa', material: 'leather' })
      ToolDispatcher.execute('update_furniture', { category: 'table', material: 'walnut', shape: 'rectangle' })
      ToolDispatcher.execute('adjust_lighting', { preset: 'golden_hour' })
      responseText = 'Staged rich Italian saddle leather with an American walnut table and golden hour lighting.'
    } else if (lower.includes('modern') || lower.includes('minimalist') || lower.includes('boucle')) {
      ToolDispatcher.execute('update_furniture', { category: 'sofa', material: 'boucle' })
      ToolDispatcher.execute('update_furniture', { category: 'table', material: 'oak', shape: 'oval' })
      ToolDispatcher.execute('adjust_lighting', { preset: 'daylight' })
      responseText = 'Created a bright modern minimalist interior with warm bouclé and Nordic oak.'
    } else if (lower.includes('cyberpunk') || lower.includes('neon')) {
      ToolDispatcher.execute('update_furniture', { category: 'sofa', material: 'charcoal' })
      ToolDispatcher.execute('update_furniture', { category: 'table', material: 'smoked_glass' })
      ToolDispatcher.execute('adjust_lighting', { preset: 'cyberpunk_neon' })
      responseText = 'Engaged Cyberpunk Neon atmosphere with smoked glass and charcoal weave.'
    } else if (lower.includes('overhead') || lower.includes('plan')) {
      ToolDispatcher.execute('set_camera_view', { view: 'overhead_plan' })
      responseText = 'Switched to overhead architectural floor plan camera.'
    } else if (lower.includes('window')) {
      ToolDispatcher.execute('set_camera_view', { view: 'window_view' })
      responseText = 'Viewing the spatial layout toward the sunlit floor-to-ceiling windows.'
    } else if (lower.includes('lamp')) {
      ToolDispatcher.execute('toggle_fixture', { fixture: 'floor_lamp', state: 'toggle' })
      responseText = 'Toggled the architectural floor lamp.'
    } else if (lower.includes('plant')) {
      ToolDispatcher.execute('toggle_fixture', { fixture: 'plant', state: 'toggle' })
      responseText = 'Toggled the monstera indoor plant fixture.'
    }

    useRoomStore.getState().addTranscriptToHistory('agent', responseText)
    useRoomStore.getState().setVoiceState({ lastAgentReply: responseText })

    // If browser TTS is available and WebSocket not speaking, voice the reply
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !this.isConnected) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(responseText)
      utterance.rate = 1.05
      window.speechSynthesis.speak(utterance)
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
        this.ws.send(JSON.stringify({ type: 'session.end' }))
        this.ws.close()
      }
      this.ws = null
    }
    this.isConnected = false
    this.isMuted = false
    this.pendingTools = []
    useRoomStore.getState().setVoiceState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      lastAgentReply: 'Voice Agent disconnected. Tap orb to start.',
      audioLevel: 0,
    })
    useRoomStore.getState().setLiveDeltaTranscript(null, null)
    useRoomStore.getState().setAudioLevel(0)
  }
}

export const voiceAgent = new VoiceAgentClient()
