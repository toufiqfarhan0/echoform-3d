import React, { useState } from 'react'
import { Mic, MicOff, Power, Sparkles, Volume2, Loader2, Zap } from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'
import { voiceAgent } from '../../services/voiceAgentClient'

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
          </div>
        </div>
      </div>

      {/* Suggested Voice Prompts */}
      <div className="sample-prompts-row">
        <span className="prompts-label">Try Voice Instructions:</span>
        <span className="prompt-chip">"Echo, change the sofa to Italian leather"</span>
        <span className="prompt-chip">"Set the room to golden hour sunset"</span>
        <span className="prompt-chip">"Switch coffee table to black marble"</span>
        <span className="prompt-chip">"Zoom in to the sofa"</span>
      </div>
    </div>
  )
}
