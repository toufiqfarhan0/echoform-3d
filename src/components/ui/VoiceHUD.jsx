import React, { useState } from 'react'
import { Mic, MicOff, Power, Sparkles, Volume2, Loader2, Zap } from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'
import { voiceAgent } from '../../services/voiceAgentClient'

export default function VoiceHUD() {
  const voiceState = useRoomStore((state) => state.voiceState)
  const audioLevel = useRoomStore((state) => state.audioLevel)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleToggleConnection = async () => {
    if (voiceState.isConnected) {
      voiceAgent.disconnect()
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
      {/* Error Alert */}
      {errorMessage && (
        <div className="voice-error-banner">
          <span>{errorMessage}</span>
          <button
            className="error-dismiss-btn"
            onClick={() => setErrorMessage(null)}
          >
            Dismiss
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
              {voiceState.isConnected ? 'Live AssemblyAI Voice Agent' : 'Voice Agent Offline'}
            </span>
            {voiceState.lastToolCall && (
              <span className="tool-executed-badge">
                <Zap size={11} />
                <span>Executed: {voiceState.lastToolCall.name.replace('_', ' ')}</span>
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

        {/* Right Audio-Reactive Visualizer Bars */}
        <div className="voice-eq-bars">
          {[...Array(6)].map((_, i) => {
            const heightMultiplier = voiceState.isConnected
              ? Math.min(100, Math.max(15, audioLevel * 100 * (1 + (i % 3) * 0.4)))
              : 20
            return (
              <div
                key={i}
                className={`eq-bar ${voiceState.isConnected ? 'active' : ''}`}
                style={{
                  height: `${heightMultiplier}%`,
                  transition: 'height 80ms ease-out',
                }}
              />
            )
          })}
        </div>

        {/* Mute Toggle if Connected */}
        {voiceState.isConnected && (
          <button
            className={`voice-mute-btn ${isMuted ? 'muted' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}
