import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useRoomStore } from '../../../store/useRoomStore'

export default function Plant(props) {
  const plantConfig = useRoomStore((state) => state.furniture.plant)

  const potMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f4f4f5', // Off-white textured ceramic
        roughness: 0.85,
        metalness: 0.05,
      }),
    []
  )

  const soilMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#271d17',
        roughness: 0.95,
      }),
    []
  )

  const leafMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#15803d', // Lush deep tropical green
        roughness: 0.4,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
    []
  )

  const leafMaterialAccent = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#166534',
        roughness: 0.35,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
    []
  )

  const stemMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#14532d',
        roughness: 0.6,
      }),
    []
  )

  if (!plantConfig.isVisible) return null

  // Procedural Monstera Leaf shape
  const leaves = [
    { pos: [0.15, 0.95, 0.15], rot: [0.35, 0.4, -0.2], scale: [1, 1, 1], mat: leafMaterial },
    { pos: [-0.18, 0.88, 0.12], rot: [0.4, -0.6, 0.25], scale: [0.9, 0.9, 0.9], mat: leafMaterialAccent },
    { pos: [0.22, 0.82, -0.15], rot: [-0.3, 0.9, -0.3], scale: [0.85, 0.85, 0.85], mat: leafMaterial },
    { pos: [-0.15, 0.78, -0.18], rot: [-0.4, -0.8, 0.3], scale: [0.95, 0.95, 0.95], mat: leafMaterialAccent },
    { pos: [0, 1.15, 0], rot: [0.15, 0.1, 0], scale: [1.1, 1.1, 1.1], mat: leafMaterial },
    { pos: [-0.25, 0.65, 0.22], rot: [0.6, -0.3, 0.4], scale: [0.8, 0.8, 0.8], mat: leafMaterial },
  ]

  return (
    <group {...props} position={[-1.75, 0, -0.8]}>
      {/* Ceramic Fluted Planter Pot */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow material={potMaterial}>
        <cylinderGeometry args={[0.22, 0.18, 0.5, 32]} />
      </mesh>

      {/* Dark Soil */}
      <mesh position={[0, 0.48, 0]} material={soilMaterial}>
        <cylinderGeometry args={[0.21, 0.21, 0.03, 24]} />
      </mesh>

      {/* Central Trunk / Stem base */}
      <mesh position={[0, 0.65, 0]} material={stemMaterial}>
        <cylinderGeometry args={[0.02, 0.03, 0.35, 8]} />
      </mesh>

      {/* Layered Monstera Tropical Foliage */}
      {leaves.map((leaf, index) => (
        <group key={index} position={leaf.pos} rotation={leaf.rot} scale={leaf.scale}>
          {/* Stem reaching out */}
          <mesh position={[0, -0.12, 0]} material={stemMaterial}>
            <cylinderGeometry args={[0.008, 0.012, 0.25, 8]} />
          </mesh>
          {/* Broad Fan/Heart Shaped Leaf */}
          <mesh castShadow material={leaf.mat}>
            <circleGeometry args={[0.24, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
