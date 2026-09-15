import React from 'react'
import { Mic, Volume2, Sparkles, MessageSquare, Terminal } from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'

export default function VoiceHUD() {
  const voiceState = useRoomStore((state) => state.voiceState)

  return (
    <div className="voice-hud-container">
      {/* Floating Spatial Voice Pill */}
      <div className="voice-pill-bar">
        <div className="voice-mic-icon">
          <Mic size={18} className="text-amber-300" />
        </div>

        <div className="voice-content">
          <div className="voice-title-row">
            <span className="voice-tag">Voice Agent Channel</span>
            <span className="voice-hint">(Connecting in Phase 3 with AssemblyAI)</span>
          </div>
          <div className="voice-transcript-text">
            "{voiceState.lastAgentReply}"
          </div>
        </div>

        {/* Audio Reactive Waveform Mock (Ready for Web Audio Analyser in Phase 3) */}
        <div className="soundwave-indicator">
          <span className="sound-bar bar-1"></span>
          <span className="sound-bar bar-2"></span>
          <span className="sound-bar bar-3"></span>
          <span className="sound-bar bar-4"></span>
          <span className="sound-bar bar-5"></span>
        </div>
      </div>

      {/* Suggested Voice Commands Chip Row */}
      <div className="sample-prompts-row">
        <span className="prompts-label">Try Voice Command Previews:</span>
        <span className="prompt-chip">"Set the room to golden hour sunset"</span>
        <span className="prompt-chip">"Change the sofa to Italian leather"</span>
        <span className="prompt-chip">"Switch coffee table to black marble"</span>
        <span className="prompt-chip">"Turn on the floor lamp"</span>
      </div>
    </div>
  )
}
