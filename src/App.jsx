import React from 'react'
import RoomScene from './components/canvas/RoomScene'
import HeaderHUD from './components/ui/HeaderHUD'
import StagingControls from './components/ui/StagingControls'
import StyleGuidanceChips from './components/ui/StyleGuidanceChips'
import VoiceHUD from './components/ui/VoiceHUD'
import ToolCallToast from './components/ui/ToolCallToast'
import WorkspaceDrawer from './components/ui/WorkspaceDrawer'
import AuthModal from './components/ui/AuthModal'
import { useRoomStore } from './store/useRoomStore'

export default function App() {
  const isAuthModalOpen = useRoomStore((state) => state.isAuthModalOpen)
  const setIsAuthModalOpen = useRoomStore((state) => state.setIsAuthModalOpen)

  return (
    <main className="app-viewport">
      {/* 3D WebGL Canvas Layer */}
      <RoomScene />

      {/* Spatial Overlay UI Layer */}
      <div className="ui-overlay">
        <HeaderHUD />
        <StagingControls />
        <div className="bottom-voice-stack">
          <StyleGuidanceChips />
          <VoiceHUD />
        </div>
        <ToolCallToast />
      </div>

      {/* Workspace & Conversation History Slide-out Drawer */}
      <WorkspaceDrawer />

      {/* Supabase & 1-Click Demo Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  )
}
