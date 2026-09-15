import React from 'react'
import {
  Sparkles,
  Mic,
  Camera,
  Layers,
  History,
  User,
  ChevronDown,
} from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'
import { captureAndDownloadSnapshot } from '../../utils/snapshotExporter'

export default function HeaderHUD() {
  const voiceState = useRoomStore((state) => state.voiceState)
  const workspaces = useRoomStore((state) => state.workspaces)
  const activeWorkspaceId = useRoomStore((state) => state.activeWorkspaceId)
  const setIsWorkspaceDrawerOpen = useRoomStore(
    (state) => state.setIsWorkspaceDrawerOpen
  )
  const currentUser = useRoomStore((state) => state.currentUser)
  const setIsAuthModalOpen = useRoomStore((state) => state.setIsAuthModalOpen)

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0]

  return (
    <header className="header-hud">
      {/* Brand & Active Workspace Selector */}
      <div className="brand-group">
        <div className="brand-icon">
          <Sparkles size={18} className="text-amber-400" />
        </div>
        <div>
          <div className="brand-title">
            Echo<span className="brand-highlight">Form</span>
            <span className="version-badge">v3.0</span>
          </div>
          <p className="brand-tagline">Voice-Orchestrated 3D Spatial Staging</p>
        </div>

        {/* Workspace Quick Switch Button */}
        <button
          className="workspace-selector-pill"
          onClick={() => setIsWorkspaceDrawerOpen(true)}
          title="Switch or manage 3D workspaces"
        >
          <Layers size={13} className="text-amber-400" />
          <span className="workspace-pill-name">{activeWorkspace?.name}</span>
          <ChevronDown size={13} className="opacity-60" />
        </button>
      </div>

      {/* Center Status Pill */}
      <div className={`status-pill ${voiceState.isConnected ? 'live' : ''}`}>
        <span className={`status-dot ${voiceState.isConnected ? 'live' : ''}`}></span>
        <Mic size={14} className="opacity-80" />
        <span className="status-text">
          {voiceState.isConnected
            ? 'Live Agent (AssemblyAI Voice Agent API)'
            : 'Voice Agent Ready'}
        </span>
      </div>

      {/* Right Actions: History Drawer, Snapshot, User Profile */}
      <div className="header-actions">
        {/* Workspace & History Drawer Trigger */}
        <button
          className="history-trigger-btn"
          onClick={() => setIsWorkspaceDrawerOpen(true)}
          title="View workspaces & conversation history"
        >
          <History size={14} />
          <span>History</span>
          {activeWorkspace?.history?.length > 0 && (
            <span className="history-count-badge">
              {activeWorkspace.history.length}
            </span>
          )}
        </button>

        {/* 3D WebGL Snapshot Exporter */}
        <button
          className="snapshot-btn"
          onClick={() => captureAndDownloadSnapshot()}
          title="Capture High-Resolution 3D Snapshot"
        >
          <Camera size={14} />
          <span>Snapshot</span>
        </button>

        {/* User Profile / Auth Trigger */}
        <button
          className="user-profile-chip"
          onClick={() => setIsAuthModalOpen(true)}
          title="User Account & Workspaces"
        >
          <div className="user-avatar-circle">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="User" className="user-avatar-img" />
            ) : (
              <User size={13} />
            )}
          </div>
          <span className="user-profile-name">
            {currentUser?.isDemo ? 'Demo Guest' : currentUser?.name || 'Account'}
          </span>
        </button>
      </div>
    </header>
  )
}
