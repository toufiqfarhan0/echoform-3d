import React, { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

import RoomArchitecture from './RoomArchitecture'
import LightingRig from './LightingRig'
import CameraRig from './CameraRig'
import Sofa from './furniture/Sofa'
import CoffeeTable from './furniture/CoffeeTable'
import FloorLamp from './furniture/FloorLamp'
import Plant from './furniture/Plant'
import Rug from './furniture/Rug'
import WallArt from './furniture/WallArt'
import EchoCore from './EchoCore'
import SunBeams from './SunBeams'

function SceneContent() {
  const controlsRef = useRef()

  return (
    <>
      {/* Dynamic Lighting Setup */}
      <LightingRig />

      {/* Smooth Camera Director */}
      <CameraRig controlsRef={controlsRef} />

      {/* Full Orbit & Touch Controls */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={2.5}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below floor
        minPolarAngle={0.2}
      />

      {/* Architectural Shell */}
      <RoomArchitecture />

      {/* Staged Living Room Furniture Group */}
      <group position={[0, 0, 0]}>
        <Rug />
        <Sofa />
        <CoffeeTable />
        <FloorLamp />
        <Plant />
        <WallArt />
      </group>

      {/* Floating 3D Audio-Reactive AI Core */}
      <EchoCore />

      {/* Floating Atmospheric Sunbeams through the Window */}
      <SunBeams />

      {/* Ultra-Soft Contact Shadows on the Wood Floor */}
      <ContactShadows
        position={[0, 0.008, 0]}
        opacity={0.7}
        scale={10}
        blur={1.8}
        far={4.5}
        resolution={1024}
        color="#1c130b"
      />
    </>
  )
}

export default function RoomScene() {
  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ position: [4.5, 3.8, 6.2], fov: 45 }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
