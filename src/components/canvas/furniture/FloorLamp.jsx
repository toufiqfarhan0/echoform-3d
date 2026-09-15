import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useRoomStore } from '../../../store/useRoomStore'

export default function FloorLamp(props) {
  const lampConfig = useRoomStore((state) => state.furniture.lamp)

  const metalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        metalness: 0.9,
        roughness: 0.2,
      }),
    []
  )

  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4af37',
        metalness: 0.85,
        roughness: 0.3,
      }),
    []
  )

  const baseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#18181b', // Nero Marquina marble base
        metalness: 0.1,
        roughness: 0.3,
      }),
    []
  )

  const bulbMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: lampConfig.isOn ? lampConfig.color : '#444444',
        emissive: lampConfig.isOn ? lampConfig.color : '#000000',
        emissiveIntensity: lampConfig.isOn ? 2.5 : 0,
        roughness: 0.1,
      }),
    [lampConfig.isOn, lampConfig.color]
  )

  return (
    <group {...props} position={[1.65, 0, -0.9]}>
      {/* Heavy Cylindrical Marble Base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow material={baseMaterial}>
        <cylinderGeometry args={[0.22, 0.22, 0.16, 32]} />
      </mesh>

      {/* Vertical Stem */}
      <mesh position={[0, 1.05, 0]} castShadow material={metalMaterial}>
        <cylinderGeometry args={[0.016, 0.016, 1.8, 16]} />
      </mesh>

      {/* Upper Arch Extension toward the Sofa */}
      <group position={[0, 1.95, 0]} rotation={[0, -0.6, 0]}>
        {/* Horizontal Cantilever Arm */}
        <mesh position={[-0.45, 0.05, 0.45]} rotation={[0, Math.PI / 4, 0]} castShadow material={metalMaterial}>
          <cylinderGeometry args={[0.014, 0.014, 1.3, 16]} />
        </mesh>

        {/* Downward Drop to Shade */}
        <mesh position={[-0.9, -0.2, 0.9]} castShadow material={brassMaterial}>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 16]} />
        </mesh>

        {/* Bell / Dome Lamp Shade */}
        <mesh position={[-0.9, -0.42, 0.9]} castShadow material={metalMaterial}>
          <coneGeometry args={[0.24, 0.22, 32, 1, true]} />
        </mesh>

        {/* Emissive Light Bulb */}
        <mesh position={[-0.9, -0.45, 0.9]} material={bulbMaterial}>
          <sphereGeometry args={[0.07, 24, 24]} />
        </mesh>

        {/* Dynamic Light Source */}
        {lampConfig.isOn && (
          <pointLight
            position={[-0.9, -0.55, 0.9]}
            color={lampConfig.color}
            intensity={lampConfig.intensity * 2.8}
            distance={5.5}
            decay={2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.001}
          />
        )}
      </group>
    </group>
  )
}
