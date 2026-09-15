import React from 'react'
import RoomScene from './components/canvas/RoomScene'
import HeaderHUD from './components/ui/HeaderHUD'
import VoiceChatSidebar from './components/ui/VoiceChatSidebar'
import ToolCallToast from './components/ui/ToolCallToast'
import WorkspaceDrawer from './components/ui/WorkspaceDrawer'
import AuthModal from './components/ui/AuthModal'
import { useRoomStore } from './store/useRoomStore'

export default function App() {
  const isAuthModalOpen = useRoomStore((state) => state.isAuthModalOpen)
  const setIsAuthModalOpen = useRoomStore((state) => state.setIsAuthModalOpen)

  return (
    <main className="app-viewport with-sidebar">
      {/* 3D WebGL Canvas Layer (Fills entire screen behind HUD) */}
      <RoomScene />

      {/* Spatial Overlay UI Layer */}
      <div className="ui-overlay">
        <HeaderHUD />
        {/* Left Interactive Voice & Live Chat Sidebar */}
        <VoiceChatSidebar />
        {/* Floating Tool Execution Toast */}
        <ToolCallToast />
      </div>

      {/* Workspace Management Drawer */}
      <WorkspaceDrawer />

      {/* Supabase & 1-Click Demo Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  )
}
