import React, { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Zap,
  Volume2,
  Loader2,
  Compass,
  MessageSquare,
  Bot,
  User,
} from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'
import { voiceAgent } from '../../services/voiceAgentClient'

export default function VoiceChatSidebar() {
  const voiceState = useRoomStore((state) => state.voiceState)
  const audioLevel = useRoomStore((state) => state.audioLevel)
  const liveDeltaTranscript = useRoomStore((state) => state.liveDeltaTranscript)
  const workspaces = useRoomStore((state) => state.workspaces)
  const activeWorkspaceId = useRoomStore((state) => state.activeWorkspaceId)

  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [typedInput, setTypedInput] = useState('')
  const [connectionError, setConnectionError] = useState(null)

  const chatScrollRef = useRef(null)

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0]
  const history = activeWorkspace?.history || []

  // Auto-scroll chat to bottom on new messages or live deltas
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [history, liveDeltaTranscript])

  const handleToggleVoice = async () => {
    if (voiceState.isConnected) {
      voiceAgent.disconnect()
      return
    }

    try {
      setIsConnecting(true)
      setConnectionError(null)
      await voiceAgent.connect()
    } catch (err) {
      console.error('Failed to start voice agent:', err)
      setConnectionError(err.message)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleToggleMute = (e) => {
    e.stopPropagation()
    const muted = voiceAgent.toggleMute()
    setIsMuted(muted)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!typedInput.trim()) return
    voiceAgent.submitTextMessage(typedInput)
    setTypedInput('')
  }

  const handleQuickPrompt = (promptText) => {
    voiceAgent.submitTextMessage(promptText)
  }

  // Calculate audio-reactive orb scale and glow
  const orbScale = voiceState.isConnected
    ? 1 + (voiceState.isSpeaking || voiceState.isListening ? audioLevel * 0.25 : 0)
    : 1
  const orbGlow = voiceState.isConnected
    ? Math.max(30, audioLevel * 120)
    : 20

  return (
    <aside className="voice-chat-sidebar">
      {/* Top Section: The Glowing Voice Orb */}
      <div className="sidebar-orb-section">
        <div
          className={`voice-orb-wrapper ${voiceState.isConnected ? 'active' : ''} ${voiceState.isSpeaking ? 'speaking' : ''} ${voiceState.isListening ? 'listening' : ''}`}
          onClick={handleToggleVoice}
          title={voiceState.isConnected ? 'Click to Stop Voice Session' : 'Click to Start Voice Session'}
        >
          {/* Concentric orbital rings with dots */}
          <div className="orb-orbital-ring ring-1">
            <span className="orbital-dot dot-1"></span>
            <span className="orbital-dot dot-2"></span>
          </div>
          <div className="orb-orbital-ring ring-2"></div>

          {/* Glowing Gradient Sphere Orb */}
          <div
            className="voice-sphere-orb"
            style={{
              transform: `scale(${orbScale})`,
              boxShadow: `0 0 ${orbGlow}px rgba(168, 85, 247, ${voiceState.isConnected ? 0.65 : 0.35}), inset 0 0 25px rgba(255, 255, 255, 0.4)`,
            }}
          >
            <div className="orb-specular-highlight"></div>
            {isConnecting && (
              <div className="orb-loading-spinner">
                <Loader2 size={32} className="animate-spin text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Status Text under the Orb */}
        <div className="orb-status-group" onClick={handleToggleVoice}>
          <h3 className="orb-status-title">
            {isConnecting
              ? 'Connecting...'
              : voiceState.isConnected
              ? voiceState.isSpeaking
                ? 'EchoForm Speaking...'
                : voiceState.isListening
                ? 'Listening to you...'
                : 'Voice Active'
              : 'Start voice'}
          </h3>
          <p className="orb-status-subtitle">
            {voiceState.isConnected ? (
              <span className="tap-disconnect-text">
                Tap orb to end call {isMuted ? '(Muted)' : ''}
              </span>
            ) : (
              'Tap to begin'
            )}
          </p>
        </div>

        {/* Mute Button if Connected */}
        {voiceState.isConnected && (
          <button
            className={`orb-mute-btn ${isMuted ? 'muted' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
        )}

        {/* Error Banner if any */}
        {connectionError && (
          <div className="sidebar-error-banner">
            <span>{connectionError}</span>
            <button onClick={() => setConnectionError(null)}>✕</button>
          </div>
        )}
      </div>

      {/* Middle Section: Real-time Live Conversation Feed */}
      <div className="sidebar-chat-section">
        <div className="chat-section-header">
          <div className="chat-header-title">
            <MessageSquare size={14} className="text-amber-400" />
            <span>Live Spatial Dialogue</span>
          </div>
          <span className="chat-workspace-badge">
            {activeWorkspace?.name}
          </span>
        </div>

        <div className="chat-messages-container" ref={chatScrollRef}>
          {history.map((msg) => {
            const isAgent = msg.role === 'agent'
            return (
              <div
                key={msg.id}
                className={`chat-bubble-wrapper ${isAgent ? 'agent' : 'user'}`}
              >
                <div className="chat-avatar-icon">
                  {isAgent ? (
                    <Bot size={13} className="text-amber-300" />
                  ) : (
                    <User size={13} className="text-sky-300" />
                  )}
                </div>

                <div className="chat-bubble-body">
                  <div className="chat-bubble-header">
                    <span className="chat-sender-name">
                      {isAgent ? 'EchoForm' : 'You'}
                    </span>
                    <span className="chat-time-stamp">{msg.timestamp}</span>
                  </div>

                  <p className="chat-message-text">{msg.text}</p>

                  {msg.toolCall && (
                    <div className="chat-tool-pill">
                      <Zap size={10} className="text-amber-400" />
                      <span>
                        Action: {msg.toolCall.name.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Live Streaming Delta Bubble (captions in real-time) */}
          {liveDeltaTranscript && liveDeltaTranscript.text && (
            <div
              className={`chat-bubble-wrapper ${liveDeltaTranscript.role === 'agent' ? 'agent' : 'user'} live-streaming`}
            >
              <div className="chat-avatar-icon">
                {liveDeltaTranscript.role === 'agent' ? (
                  <Bot size={13} className="text-amber-300 animate-pulse" />
                ) : (
                  <User size={13} className="text-sky-300 animate-pulse" />
                )}
              </div>
              <div className="chat-bubble-body">
                <div className="chat-bubble-header">
                  <span className="chat-sender-name">
                    {liveDeltaTranscript.role === 'agent' ? 'EchoForm' : 'You'} (speaking...)
                  </span>
                </div>
                <p className="chat-message-text live-text">
                  {liveDeltaTranscript.text}
                  <span className="live-typing-cursor">▌</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="sidebar-quick-prompts">
        <span className="quick-prompts-label">Quick Suggestions:</span>
        <div className="quick-prompts-scroll">
          <button
            className="quick-prompt-btn"
            onClick={() => handleQuickPrompt('What are the available options?')}
          >
            "What are the available options?"
          </button>
          <button
            className="quick-prompt-btn"
            onClick={() => handleQuickPrompt('Make it a modern minimalist interior with bouclé')}
          >
            "Modern minimalist with bouclé"
          </button>
          <button
            className="quick-prompt-btn"
            onClick={() => handleQuickPrompt('Give me a vintage mid-century style with leather')}
          >
            "Vintage mid-century with leather"
          </button>
          <button
            className="quick-prompt-btn"
            onClick={() => handleQuickPrompt('Switch to Cyberpunk Neon lighting')}
          >
            "Cyberpunk Neon lighting"
          </button>
          <button
            className="quick-prompt-btn"
            onClick={() => handleQuickPrompt('Show me the overhead floor plan')}
          >
            "Overhead floor plan"
          </button>
        </div>
      </div>

      {/* Bottom Section: Text Input bar fallback */}
      <form className="sidebar-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="sidebar-text-input"
          placeholder="Type or speak a design instruction..."
          value={typedInput}
          onChange={(e) => setTypedInput(e.target.value)}
        />
        <button
          type="submit"
          className="sidebar-send-btn"
          disabled={!typedInput.trim()}
          title="Send instruction"
        >
          <Send size={14} />
        </button>
      </form>
    </aside>
  )
}
