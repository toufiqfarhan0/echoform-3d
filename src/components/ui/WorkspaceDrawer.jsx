import React, { useState } from 'react'
import {
  X,
  Plus,
  Layers,
  MessageSquare,
  Check,
  Clock,
  Sparkles,
  Zap,
  Box,
  Palette,
  Sun,
  Camera,
} from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'

export default function WorkspaceDrawer() {
  const isOpen = useRoomStore((state) => state.isWorkspaceDrawerOpen)
  const setIsOpen = useRoomStore((state) => state.setIsWorkspaceDrawerOpen)
  const workspaces = useRoomStore((state) => state.workspaces)
  const activeWorkspaceId = useRoomStore((state) => state.activeWorkspaceId)
  const switchWorkspace = useRoomStore((state) => state.switchWorkspace)
  const createWorkspace = useRoomStore((state) => state.createWorkspace)
  const furniture = useRoomStore((state) => state.furniture)
  const lightingPreset = useRoomStore((state) => state.lightingPreset)

  const [activeTab, setActiveTab] = useState('workspaces') // 'workspaces' | 'history' | 'specs'
  const [newWsName, setNewWsName] = useState('')
  const [newWsStyle, setNewWsStyle] = useState('Modern Minimalist')

  if (!isOpen) return null

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0]

  const handleCreateWorkspace = (e) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    createWorkspace(newWsName.trim(), newWsStyle)
    setNewWsName('')
  }

  return (
    <div className="workspace-drawer-overlay">
      <div className="workspace-drawer-backdrop" onClick={() => setIsOpen(false)} />

      <aside className="workspace-drawer-panel">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <Layers size={18} className="text-amber-400" />
            <h3 className="drawer-title">Spatial Workspaces & History</h3>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsOpen(false)}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="drawer-tabs">
          <button
            className={`drawer-tab-btn ${activeTab === 'workspaces' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspaces')}
          >
            <Layers size={14} />
            <span>Workspaces ({workspaces.length})</span>
          </button>

          <button
            className={`drawer-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <MessageSquare size={14} />
            <span>Voice History ({activeWorkspace?.history?.length || 0})</span>
          </button>

          <button
            className={`drawer-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            <Box size={14} />
            <span>Active Scene Specs</span>
          </button>
        </div>

        {/* Tab 1: Workspaces List & Creator */}
        {activeTab === 'workspaces' && (
          <div className="drawer-tab-content">
            <div className="workspace-list">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspaceId
                return (
                  <div
                    key={ws.id}
                    className={`workspace-card ${isActive ? 'active' : ''}`}
                    onClick={() => switchWorkspace(ws.id)}
                  >
                    <div className="workspace-card-info">
                      <div className="workspace-card-title-row">
                        <h4 className="workspace-card-name">{ws.name}</h4>
                        {isActive && (
                          <span className="workspace-active-tag">
                            <Check size={12} /> Active
                          </span>
                        )}
                      </div>
                      <span className="workspace-card-style">{ws.style}</span>
                      <div className="workspace-card-meta">
                        <span>Lighting: {ws.lightingPreset || 'golden_hour'}</span>
                        <span>•</span>
                        <span>{ws.history?.length || 0} voice exchanges</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Create New Workspace Form */}
            <form className="create-workspace-form" onSubmit={handleCreateWorkspace}>
              <h4 className="create-ws-title">Create New Interior Workspace</h4>
              <input
                type="text"
                className="create-ws-input"
                placeholder="e.g. Kyoto Zen Garden Penthouse"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
              />
              <div className="create-ws-row">
                <select
                  className="create-ws-select"
                  value={newWsStyle}
                  onChange={(e) => setNewWsStyle(e.target.value)}
                >
                  <option value="Modern Minimalist">Modern Minimalist</option>
                  <option value="Vintage Mid-Century">Vintage Mid-Century</option>
                  <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                  <option value="Scandinavian Warmth">Scandinavian Warmth</option>
                  <option value="Industrial Loft">Industrial Loft</option>
                </select>
                <button type="submit" className="create-ws-btn">
                  <Plus size={14} />
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Conversation & Staging History */}
        {activeTab === 'history' && (
          <div className="drawer-tab-content">
            <div className="history-header-bar">
              <span className="history-workspace-label">
                Session for: <strong>{activeWorkspace?.name}</strong>
              </span>
            </div>

            <div className="history-timeline">
              {activeWorkspace?.history && activeWorkspace.history.length > 0 ? (
                activeWorkspace.history.map((item) => {
                  const isUser = item.role === 'user'
                  return (
                    <div
                      key={item.id}
                      className={`history-entry ${isUser ? 'user' : 'agent'}`}
                    >
                      <div className="history-entry-meta">
                        <span className="history-role-tag">
                          {isUser ? 'You' : 'EchoForm Agent'}
                        </span>
                        <span className="history-time">{item.timestamp}</span>
                      </div>

                      <p className="history-entry-text">{item.text}</p>

                      {item.toolCall && (
                        <div className="history-tool-badge">
                          <Zap size={11} className="text-amber-400" />
                          <span>
                            Executed: {item.toolCall.name} (
                            {Object.entries(item.toolCall.args || {})
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                            )
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="history-empty-state">
                  <MessageSquare size={32} className="opacity-30 mx-auto mb-2" />
                  <p>No conversation yet in this workspace.</p>
                  <span>Connect your voice agent or click a style chip to begin.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Active Scene Specs */}
        {activeTab === 'specs' && (
          <div className="drawer-tab-content">
            <div className="specs-card">
              <h4 className="specs-title">Real-Time Staging Manifest</h4>

              <div className="spec-row">
                <Palette size={14} className="text-amber-400" />
                <span className="spec-key">Sofa Material:</span>
                <span className="spec-val capitalize">{furniture.sofa.material}</span>
              </div>

              <div className="spec-row">
                <Box size={14} className="text-sky-400" />
                <span className="spec-key">Coffee Table:</span>
                <span className="spec-val capitalize">
                  {furniture.table.material} ({furniture.table.shape})
                </span>
              </div>

              <div className="spec-row">
                <Sun size={14} className="text-orange-400" />
                <span className="spec-key">Lighting Preset:</span>
                <span className="spec-val capitalize">{lightingPreset.replace('_', ' ')}</span>
              </div>

              <div className="spec-row">
                <Layers size={14} className="text-emerald-400" />
                <span className="spec-key">Rug Design:</span>
                <span className="spec-val capitalize">
                  {furniture.rug.style.replace('_', ' ')}
                </span>
              </div>

              <div className="spec-row">
                <Camera size={14} className="text-purple-400" />
                <span className="spec-key">Active Camera:</span>
                <span className="spec-val capitalize">{useRoomStore.getState().cameraView}</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
