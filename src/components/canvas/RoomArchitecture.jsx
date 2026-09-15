import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useRoomStore, LIGHTING_PRESETS } from '../../store/useRoomStore'

export default function RoomArchitecture() {
  const currentPreset = useRoomStore((state) => state.lightingPreset)
  const preset = LIGHTING_PRESETS[currentPreset] || LIGHTING_PRESETS.golden_hour

  // Floor: Luxury Nordic Engineered Wood
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8b6f4e', // Warm oak tone
        roughness: 0.35,
        metalness: 0.05,
      }),
    []
  )

  // Walls: Architectural Off-White Plaster
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f4f3ef',
        roughness: 0.9,
        metalness: 0.0,
      }),
    []
  )

  // Trim & Baseboards
  const trimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e5e5e0',
        roughness: 0.6,
      }),
    []
  )

  // Window Frames: Sleek Anodized Charcoal Aluminum
  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e2022',
        metalness: 0.85,
        roughness: 0.3,
      }),
    []
  )

  // Glass Window Pane
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transmission: 0.95,
        opacity: 1,
        transparent: true,
        roughness: 0.05,
        ior: 1.5,
      }),
    []
  )

  // Outdoor Skyline / Horizon Backdrop
  const skyMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: preset.skyColor,
      }),
    [preset.skyColor]
  )

  const citySilMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: preset.fogColor,
      }),
    [preset.fogColor]
  )

  return (
    <group>
      {/* 1. Main Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={floorMaterial}>
        <planeGeometry args={[12, 12]} />
      </mesh>

      {/* Floor Wood Planks Detail Lines (Subtle Grid) */}
      <gridHelper
        args={[12, 24, '#735b3c', '#735b3c']}
        position={[0, 0.002, 0]}
        material-opacity={0.25}
        material-transparent
      />

      {/* 2. Back Wall */}
      <mesh position={[0, 2.5, -2.0]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[8, 5]} />
      </mesh>

      {/* Back Wall Baseboard Trim */}
      <mesh position={[0, 0.06, -1.98]} castShadow material={trimMaterial}>
        <boxGeometry args={[8, 0.12, 0.04]} />
      </mesh>

      {/* 3. Right Wall */}
      <mesh position={[4.0, 2.5, 2.0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[8, 5]} />
      </mesh>
      <mesh position={[3.98, 0.06, 2.0]} rotation={[0, -Math.PI / 2, 0]} castShadow material={trimMaterial}>
        <boxGeometry args={[8, 0.12, 0.04]} />
      </mesh>

      {/* 4. Left Wall with Floor-to-Ceiling Panoramic Window */}
      {/* Left Wall Solid Top Header */}
      <mesh position={[-3.98, 4.3, 0.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[5, 1.4]} />
      </mesh>
      {/* Left Wall Solid Lower Knee Wall */}
      <mesh position={[-3.98, 0.25, 0.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[5, 0.5]} />
      </mesh>
      {/* Left Wall Back Pillar */}
      <mesh position={[-3.98, 2.5, -1.7]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[0.6, 5]} />
      </mesh>

      {/* Panoramic Architectural Window Frame */}
      <group position={[-3.96, 2.05, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        {/* Outer Frame */}
        <mesh material={frameMaterial}>
          <boxGeometry args={[4.4, 3.1, 0.08]} />
        </mesh>

        {/* Vertical Mullion */}
        <mesh position={[0, 0, 0.01]} material={frameMaterial}>
          <boxGeometry args={[0.06, 3.0, 0.1]} />
        </mesh>

        {/* Horizontal Mullion */}
        <mesh position={[0, 0.4, 0.01]} material={frameMaterial}>
          <boxGeometry args={[4.3, 0.06, 0.1]} />
        </mesh>

        {/* Glass Panes */}
        <mesh position={[0, 0, 0]} material={glassMaterial}>
          <planeGeometry args={[4.3, 3.0]} />
        </mesh>
      </group>

      {/* 5. Outdoor Horizon Skyline Backdrop (Visible through the Window) */}
      <group position={[-8.5, 2.5, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        {/* Sky Gradient Plane */}
        <mesh material={skyMaterial}>
          <planeGeometry args={[16, 12]} />
        </mesh>

        {/* Stylized Architectural City Skyline Silhouettes */}
        {[
          [-4.5, -1.0, 0.05, 1.8, 3.5],
          [-2.2, -1.2, 0.05, 1.4, 2.8],
          [-0.5, -0.6, 0.05, 2.0, 4.2],
          [1.5, -1.4, 0.05, 1.6, 2.5],
          [3.8, -0.8, 0.05, 2.2, 3.8],
        ].map(([x, y, z, w, h], index) => (
          <mesh key={index} position={[x, y, z]} material={citySilMaterial}>
            <planeGeometry args={[w, h]} />
          </mesh>
        ))}
      </group>

      {/* 6. Ceiling Plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.0, 0]} material={wallMaterial}>
        <planeGeometry args={[12, 12]} />
      </mesh>
    </group>
  )
}
