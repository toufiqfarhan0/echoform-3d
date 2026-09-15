import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useRoomStore, FURNITURE_MATERIALS } from '../../../store/useRoomStore'

export default function Sofa(props) {
  const sofaConfig = useRoomStore((state) => state.furniture.sofa)
  const matConfig = FURNITURE_MATERIALS.sofa[sofaConfig.material] || FURNITURE_MATERIALS.sofa.boucle
  const mainColor = sofaConfig.customColor || matConfig.color

  // Procedural PBR materials
  const upholsteryMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: mainColor,
        roughness: matConfig.roughness,
        metalness: matConfig.metalness,
      }),
    [mainColor, matConfig]
  )

  const cushionMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: sofaConfig.cushionColor || '#c2410c',
        roughness: 0.8,
        metalness: 0.05,
      }),
    [sofaConfig.cushionColor]
  )

  const legMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        metalness: 0.85,
        roughness: 0.25,
      }),
    []
  )

  const baseWoodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2e1f14',
        roughness: 0.6,
      }),
    []
  )

  return (
    <group {...props} position={[-0.2, 0, -0.6]} rotation={[0, 0, 0]}>
      {/* Wooden Base Plinth */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow material={baseWoodMaterial}>
        <boxGeometry args={[2.5, 0.1, 1.1]} />
      </mesh>

      {/* Main Seat Cushions (3-Seater) */}
      <group position={[0, 0.32, 0.05]}>
        <mesh position={[-0.75, 0, 0]} castShadow receiveShadow material={upholsteryMaterial}>
          <boxGeometry args={[0.72, 0.32, 0.9]} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow receiveShadow material={upholsteryMaterial}>
          <boxGeometry args={[0.72, 0.32, 0.9]} />
        </mesh>
        <mesh position={[0.75, 0, 0]} castShadow receiveShadow material={upholsteryMaterial}>
          <boxGeometry args={[0.72, 0.32, 0.9]} />
        </mesh>
      </group>

      {/* Backrest Cushions */}
      <group position={[0, 0.68, -0.38]}>
        <mesh position={[-0.75, 0, 0]} castShadow receiveShadow material={upholsteryMaterial}>
          <boxGeometry args={[0.72, 0.48, 0.25]} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow receiveShadow material={upholsteryMaterial}>
          <boxGeometry args={[0.72, 0.48, 0.25]} />
        </mesh>
        <mesh position={[0.75, 0, 0]} castShadow receiveShadow material={upholsteryMaterial}>
          <boxGeometry args={[0.72, 0.48, 0.25]} />
        </mesh>
      </group>

      {/* Back Support Frame */}
      <mesh position={[0, 0.55, -0.48]} castShadow receiveShadow material={upholsteryMaterial}>
        <boxGeometry args={[2.5, 0.75, 0.12]} />
      </mesh>

      {/* Left Armrest */}
      <mesh position={[-1.28, 0.45, -0.02]} castShadow receiveShadow material={upholsteryMaterial}>
        <boxGeometry args={[0.22, 0.55, 1.05]} />
      </mesh>

      {/* Right Armrest */}
      <mesh position={[1.28, 0.45, -0.02]} castShadow receiveShadow material={upholsteryMaterial}>
        <boxGeometry args={[0.22, 0.55, 1.05]} />
      </mesh>

      {/* Accent Throw Pillows */}
      <mesh
        position={[-0.95, 0.48, -0.15]}
        rotation={[0.1, 0.4, 0.2]}
        castShadow
        material={cushionMaterial}
      >
        <boxGeometry args={[0.36, 0.36, 0.12]} />
      </mesh>
      <mesh
        position={[0.95, 0.48, -0.15]}
        rotation={[0.1, -0.35, -0.15]}
        castShadow
        material={cushionMaterial}
      >
        <boxGeometry args={[0.36, 0.36, 0.12]} />
      </mesh>

      {/* Metal Cylindrical Legs with Floor Caps */}
      {[
        [-1.15, 0.05, 0.45],
        [1.15, 0.05, 0.45],
        [-1.15, 0.05, -0.45],
        [1.15, 0.05, -0.45],
      ].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} castShadow material={legMaterial}>
          <cylinderGeometry args={[0.025, 0.025, 0.1, 16]} />
        </mesh>
      ))}
    </group>
  )
}
