import React from 'react'
import { Sparkles, Mic, Layers, Settings } from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'

export default function HeaderHUD({ onOpenSettings }) {
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
            <span className="version-badge">v2.0 (Phase 2)</span>
          </div>
          <p className="brand-tagline">Voice-Orchestrated 3D Spatial Staging</p>
        </div>
      </div>

      {/* Center Status Pill */}
      <div className={`status-pill ${voiceState.isConnected ? 'live' : ''}`}>
        <span className={`status-dot ${voiceState.isConnected ? 'live' : ''}`}></span>
        <Mic size={14} className="opacity-80" />
        <span className="status-text">
          {voiceState.isConnected ? 'Live Agent (AssemblyAI + Groq)' : 'Voice Agent Ready'}
        </span>
      </div>

      {/* Right Meta Info & Settings */}
      <div className="header-actions">
        <div className="tech-badge">
          <Layers size={13} />
          <span>Three.js + R3F</span>
        </div>

        <button
          className="settings-trigger-btn"
          onClick={onOpenSettings}
          title="Configure AssemblyAI & Groq API Keys"
        >
          <Settings size={15} />
          <span>API Keys</span>
        </button>
      </div>
    </header>
  )
}
