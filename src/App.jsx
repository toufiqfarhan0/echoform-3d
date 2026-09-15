import React, { useState } from 'react'
import RoomScene from './components/canvas/RoomScene'
import HeaderHUD from './components/ui/HeaderHUD'
import StagingControls from './components/ui/StagingControls'
import VoiceHUD from './components/ui/VoiceHUD'
import SettingsModal from './components/ui/SettingsModal'
import ToolCallToast from './components/ui/ToolCallToast'

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <main className="app-viewport">
      {/* 3D WebGL Canvas Layer */}
      <RoomScene />

      {/* Futuristic Spatial Overlay UI Layer */}
      <div className="ui-overlay">
        <HeaderHUD onOpenSettings={() => setIsSettingsOpen(true)} />
        <StagingControls />
        <VoiceHUD onOpenSettings={() => setIsSettingsOpen(true)} />
        <ToolCallToast />
      </div>

      {/* API Key Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  )
}
