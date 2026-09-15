import React, { useState } from 'react'
import { Mic, MicOff, Power, Sparkles, Volume2, Loader2, Zap } from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'
import { voiceAgent } from '../../services/voiceAgentClient'
import { ToolDispatcher } from '../../services/toolDispatcher'

export default function VoiceHUD({ onOpenSettings }) {
  const voiceState = useRoomStore((state) => state.voiceState)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleToggleConnection = async () => {
    if (voiceState.isConnected) {
      voiceAgent.disconnect()
      return
    }

    // Check if keys are present
    const hasAaiKey =
      localStorage.getItem('echoform_aai_key') || import.meta.env.VITE_ASSEMBLYAI_API_KEY
    const hasGroqKey =
      localStorage.getItem('echoform_groq_key') || import.meta.env.VITE_GROQ_API_KEY

    if (!hasAaiKey || !hasGroqKey) {
      if (onOpenSettings) onOpenSettings()
      return
    }

    try {
      setIsConnecting(true)
      setErrorMessage(null)
      await voiceAgent.connect()
    } catch (err) {
      console.error('Failed to connect voice agent:', err)
      setErrorMessage(err.message)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleToggleMute = () => {
    const muted = voiceAgent.toggleMute()
    setIsMuted(muted)
  }

  return (
    <div className="voice-hud-container">
      {/* Error Banner */}
      {errorMessage && (
        <div className="voice-error-banner">
          <span>{errorMessage}</span>
          <button className="error-fix-btn" onClick={onOpenSettings}>
            Open Settings
          </button>
        </div>
      )}

      {/* Main Voice Pill Bar */}
      <div className={`voice-pill-bar ${voiceState.isConnected ? 'connected' : ''}`}>
        {/* Connection / Mic Action Button */}
        <button
          className={`voice-mic-icon-btn ${voiceState.isConnected ? (isMuted ? 'muted' : 'active') : ''}`}
          onClick={handleToggleConnection}
          disabled={isConnecting}
          title={voiceState.isConnected ? 'Click to Disconnect' : 'Click to Start Voice Agent'}
        >
          {isConnecting ? (
            <Loader2 size={18} className="animate-spin text-amber-300" />
          ) : voiceState.isConnected ? (
            isMuted ? (
              <MicOff size={18} className="text-rose-400" />
            ) : (
              <Mic size={18} className="text-amber-300 animate-pulse" />
            )
          ) : (
            <Power size={18} className="text-slate-300" />
          )}
        </button>

        {/* Live Speech & Agent Context */}
        <div className="voice-content">
          <div className="voice-title-row">
            <span className="voice-tag">
              {voiceState.isConnected ? 'Live Agent (AssemblyAI + Groq)' : 'Voice Agent Offline'}
            </span>
            {voiceState.lastToolCall && (
              <span className="tool-executed-badge">
                <Zap size={11} />
                <span>Executed: {voiceState.lastToolCall.name}</span>
              </span>
            )}
          </div>

          <div className="voice-transcript-text">
            {voiceState.lastTranscript && (
              <span className="user-utterance">You: "{voiceState.lastTranscript}" — </span>
            )}
            <span className="agent-utterance">"{voiceState.lastAgentReply}"</span>
          </div>
        </div>

        {/* Active Controls & Audio Wave */}
        <div className="voice-actions-right">
          {voiceState.isConnected && (
            <button
              className={`mute-toggle-btn ${isMuted ? 'active' : ''}`}
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
          )}

          {/* Soundwave Bars reacting to speech */}
          <div
            className={`soundwave-indicator ${voiceState.isSpeaking || voiceState.isListening ? 'active' : 'idle'}`}
          >
            <span className="sound-bar bar-1"></span>
            <span className="sound-bar bar-2"></span>
            <span className="sound-bar bar-3"></span>
            <span className="sound-bar bar-4"></span>
            <span className="sound-bar bar-5"></span>
            <span className="sound-bar bar-6"></span>
            <span className="sound-bar bar-7"></span>
            <span className="sound-bar bar-8"></span>
          </div>
        </div>
      </div>

      {/* Suggested Voice Prompts / Quick Interactive Simulators */}
      <div className="sample-prompts-row">
        <span className="prompts-label">Quick Prompt Triggers:</span>
        {[
          {
            text: 'Golden Hour Sunset',
            speech: 'Echo, set the room to golden hour sunset',
            tool: 'adjust_lighting',
            args: { preset: 'golden_hour' },
            reply: 'Setting the atmospheric lighting to warm golden hour sunset.',
          },
          {
            text: 'Italian Leather Sofa',
            speech: 'Change the sofa to Italian leather',
            tool: 'update_furniture',
            args: { category: 'sofa', material: 'leather' },
            reply: 'Upholstering the 3-seater sofa with rich Italian saddle leather.',
          },
          {
            text: 'Nero Marble Table',
            speech: 'Switch coffee table to black marble',
            tool: 'update_furniture',
            args: { category: 'coffee_table', material: 'black_marble' },
            reply: 'Replaced the coffee table top with polished Nero Marquina marble.',
          },
          {
            text: 'Sofa Close-Up',
            speech: 'Zoom in to the sofa',
            tool: 'set_camera_view',
            args: { view: 'sofa_focus' },
            reply: 'Focusing cinematic camera perspective on the sofa arrangement.',
          },
          {
            text: 'Cyberpunk Neon',
            speech: 'Switch to Cyberpunk Neon lighting',
            tool: 'adjust_lighting',
            args: { preset: 'cyberpunk_neon' },
            reply: 'Illuminating the room with electric cyberpunk violet and cyan accents.',
          },
        ].map((item, idx) => (
          <button
            key={idx}
            className="prompt-chip clickable"
            onClick={() => {
              // 1. Update UI Speech Transcript
              useRoomStore.getState().setVoiceState({
                lastTranscript: item.speech,
                lastAgentReply: item.reply,
                isSpeaking: true,
                lastToolCall: { name: item.tool, args: item.args, timestamp: Date.now() },
              })

              // 2. Pulse 3D EchoCore
              useRoomStore.getState().setAudioLevel(0.85)

              // 3. Execute 3D Tool
              ToolDispatcher.execute(item.tool, item.args)

              // 4. Audibly speak the agent reply through browser speakers
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel()
                const utterance = new SpeechSynthesisUtterance(item.reply)
                utterance.rate = 1.05
                utterance.pitch = 1.0
                const voices = window.speechSynthesis.getVoices()
                const naturalVoice = voices.find(
                  (v) =>
                    v.lang.startsWith('en') &&
                    (v.name.includes('Natural') ||
                      v.name.includes('Google') ||
                      v.name.includes('Samantha') ||
                      v.name.includes('Ava') ||
                      v.name.includes('Victoria') ||
                      v.name.includes('Zira'))
                )
                if (naturalVoice) utterance.voice = naturalVoice

                utterance.onend = () => {
                  useRoomStore.getState().setVoiceState({ isSpeaking: false })
                  useRoomStore.getState().setAudioLevel(0)
                }
                utterance.onerror = () => {
                  useRoomStore.getState().setVoiceState({ isSpeaking: false })
                  useRoomStore.getState().setAudioLevel(0)
                }
                window.speechSynthesis.speak(utterance)
              } else {
                setTimeout(() => {
                  useRoomStore.getState().setVoiceState({ isSpeaking: false })
                  useRoomStore.getState().setAudioLevel(0)
                }, 2500)
              }
            }}
          >
            <Sparkles size={11} className="text-amber-400" />
            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
