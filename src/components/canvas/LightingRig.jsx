import React, { useRef } from 'react'
import { useRoomStore, LIGHTING_PRESETS } from '../../store/useRoomStore'

export default function LightingRig() {
  const currentPreset = useRoomStore((state) => state.lightingPreset)
  const preset = LIGHTING_PRESETS[currentPreset] || LIGHTING_PRESETS.golden_hour

  const sunRef = useRef()

  return (
    <group>
      {/* 1. Global Ambient Light */}
      <ambientLight color={preset.ambientColor} intensity={preset.ambientIntensity} />

      {/* 2. Primary Directional Sunlight streaming in through the Window */}
      <directionalLight
        ref={sunRef}
        position={[-6.5, preset.sunPosition[1], preset.sunPosition[2]]}
        color={preset.sunColor}
        intensity={preset.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />

      {/* 3. Soft Interior Fill Light to lift deep shadows */}
      <directionalLight
        position={[4, 5, 4]}
        color="#ffffff"
        intensity={currentPreset === 'moody_night' ? 0.2 : 0.45}
      />

      {/* 4. Architectural Window Glow Area */}
      <pointLight
        position={[-3.8, 2.5, 0.5]}
        color={preset.windowGlow}
        intensity={preset.sunIntensity * 0.8}
        distance={7}
        decay={2}
      />
    </group>
  )
}
