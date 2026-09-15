import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useRoomStore, FURNITURE_MATERIALS } from '../../../store/useRoomStore'

export default function CoffeeTable(props) {
  const tableConfig = useRoomStore((state) => state.furniture.table)
  const matConfig = FURNITURE_MATERIALS.table[tableConfig.material] || FURNITURE_MATERIALS.table.marble
  const mainColor = tableConfig.customColor || matConfig.color

  const topMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: matConfig.roughness,
      metalness: matConfig.metalness,
      transparent: matConfig.opacity !== undefined,
      opacity: matConfig.opacity ?? 1.0,
    })
  }, [mainColor, matConfig])

  const legMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c5a059', // Brushed brass
        metalness: 0.85,
        roughness: 0.25,
      }),
    []
  )

  const bookMaterial1 = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 }),
    []
  )
  const bookMaterial2 = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 }),
    []
  )
  const vaseMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#78716c', roughness: 0.3, metalness: 0.1 }),
    []
  )

  return (
    <group {...props} position={[-0.2, 0, 0.7]}>
      {/* Table Top (Oval or Chamfered Rectangular) */}
      {tableConfig.shape === 'oval' ? (
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow material={topMaterial}>
          <cylinderGeometry args={[0.75, 0.75, 0.05, 48]} />
        </mesh>
      ) : (
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow material={topMaterial}>
          <boxGeometry args={[1.3, 0.05, 0.75]} />
        </mesh>
      )}

      {/* Designer Brass Legs (Tripod or 4-Point Base) */}
      {[
        [-0.45, 0.18, 0.25],
        [0.45, 0.18, 0.25],
        [-0.45, 0.18, -0.25],
        [0.45, 0.18, -0.25],
      ].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} castShadow material={legMaterial}>
          <cylinderGeometry args={[0.02, 0.015, 0.36, 16]} />
        </mesh>
      ))}

      {/* Decorative Table Staging: Stacked Art Books */}
      <group position={[-0.22, 0.42, 0.05]} rotation={[0, 0.15, 0]}>
        <mesh castShadow material={bookMaterial1}>
          <boxGeometry args={[0.26, 0.03, 0.2]} />
        </mesh>
        <mesh position={[0.01, 0.03, -0.01]} rotation={[0, -0.2, 0]} castShadow material={bookMaterial2}>
          <boxGeometry args={[0.24, 0.025, 0.18]} />
        </mesh>
      </group>

      {/* Ceramic Sculptural Mini Vase */}
      <mesh position={[0.25, 0.48, -0.05]} castShadow material={vaseMaterial}>
        <cylinderGeometry args={[0.06, 0.09, 0.16, 24]} />
      </mesh>
    </group>
  )
}
