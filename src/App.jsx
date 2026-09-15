import React from 'react'
import RoomScene from './components/canvas/RoomScene'
import HeaderHUD from './components/ui/HeaderHUD'
import StagingControls from './components/ui/StagingControls'
import VoiceHUD from './components/ui/VoiceHUD'

export default function App() {
  return (
    <main className="app-viewport">
      {/* 3D WebGL Canvas Layer */}
      <RoomScene />

      {/* Futuristic Spatial Overlay UI Layer */}
      <div className="ui-overlay">
        <HeaderHUD />
        <StagingControls />
        <VoiceHUD />
      </div>
    </main>
  )
}
