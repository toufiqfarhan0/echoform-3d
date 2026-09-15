import React, { useMemo } from 'react'
import * as THREE from 'three'

export default function WallArt(props) {
  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#18181b', // Matte black slim aluminum gallery frame
        metalness: 0.8,
        roughness: 0.3,
      }),
    []
  )

  const canvasBackgroundMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.9,
      }),
    []
  )

  const artGraphic1 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b45309', // Warm ochre geometric arc
        roughness: 0.7,
      }),
    []
  )

  const artGraphic2 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e293b', // Deep slate geometric block
        roughness: 0.6,
      }),
    []
  )

  const artGraphic3 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#047857', // Sage circle
        roughness: 0.65,
      }),
    []
  )

  return (
    <group {...props} position={[-0.2, 2.2, -1.94]}>
      {/* Outer Thin Frame */}
      <mesh castShadow material={frameMaterial}>
        <boxGeometry args={[1.9, 1.3, 0.04]} />
      </mesh>

      {/* Canvas Face */}
      <mesh position={[0, 0, 0.022]} receiveShadow material={canvasBackgroundMaterial}>
        <planeGeometry args={[1.82, 1.22]} />
      </mesh>

      {/* Modern Abstract Bauhaus Composition on Canvas */}
      <group position={[0, 0, 0.024]}>
        {/* Ochre Semicircle Arc */}
        <mesh position={[-0.3, 0.1, 0]}>
          <circleGeometry args={[0.35, 32, 0, Math.PI]} />
          <primitive object={artGraphic1} attach="material" />
        </mesh>

        {/* Deep Slate Block */}
        <mesh position={[0.35, -0.15, 0]}>
          <planeGeometry args={[0.5, 0.6]} />
          <primitive object={artGraphic2} attach="material" />
        </mesh>

        {/* Sage Circle Accent */}
        <mesh position={[0.2, 0.28, 0]}>
          <circleGeometry args={[0.18, 32]} />
          <primitive object={artGraphic3} attach="material" />
        </mesh>

        {/* Minimalist Axis Line */}
        <mesh position={[-0.3, -0.25, 0]}>
          <planeGeometry args={[0.8, 0.015]} />
          <primitive object={artGraphic2} attach="material" />
        </mesh>
      </group>
    </group>
  )
}
