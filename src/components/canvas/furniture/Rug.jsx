import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useRoomStore, FURNITURE_MATERIALS } from '../../../store/useRoomStore'

export default function Rug(props) {
  const rugConfig = useRoomStore((state) => state.furniture.rug)
  const style = FURNITURE_MATERIALS.rug[rugConfig.style] || FURNITURE_MATERIALS.rug.cream_geometric

  const rugMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: style.color,
        roughness: 0.95,
        metalness: 0.0,
      }),
    [style.color]
  )

  const borderMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: style.patternColor,
        roughness: 0.9,
      }),
    [style.patternColor]
  )

  return (
    <group {...props} position={[-0.2, 0.005, 0.2]}>
      {/* Main Carpet Base */}
      <mesh receiveShadow material={rugMaterial}>
        <boxGeometry args={[3.2, 0.01, 2.5]} />
      </mesh>

      {/* Modern Inset Minimal Border Frame */}
      <mesh position={[0, 0.008, 0]} receiveShadow material={borderMaterial}>
        <boxGeometry args={[3.0, 0.005, 2.3]} />
      </mesh>

      {/* Inner Plush Layer */}
      <mesh position={[0, 0.012, 0]} receiveShadow material={rugMaterial}>
        <boxGeometry args={[2.85, 0.005, 2.15]} />
      </mesh>
    </group>
  )
}
