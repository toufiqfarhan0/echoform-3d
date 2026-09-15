import React from 'react'
import { Sparkles, Mic, Layers, Info } from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'

export default function HeaderHUD() {
  const voiceState = useRoomStore((state) => state.voiceState)

  return (
    <header className="header-hud">
      {/* Brand Identity */}
      <div className="brand-group">
        <div className="brand-icon">
          <Sparkles size={18} className="text-amber-400" />
        </div>
        <div>
          <div className="brand-title">
            Echo<span className="brand-highlight">Form</span>
            <span className="version-badge">v1.0 (Phase 1)</span>
          </div>
          <p className="brand-tagline">Voice-Orchestrated 3D Spatial Staging</p>
        </div>
      </div>

      {/* Center Status Pill */}
      <div className="status-pill">
        <span className="status-dot"></span>
        <Mic size={14} className="opacity-80" />
        <span className="status-text">
          {voiceState.isConnected ? 'Voice Connected (AssemblyAI)' : '3D Spatial Stager Ready'}
        </span>
      </div>

      {/* Right Meta Info */}
      <div className="header-actions">
        <div className="tech-badge">
          <Layers size={13} />
          <span>Three.js + R3F</span>
        </div>
        <div className="tech-badge-sub">
          <span className="tech-chip">AssemblyAI</span>
          <span className="tech-chip">Groq</span>
        </div>
      </div>
    </header>
  )
}
