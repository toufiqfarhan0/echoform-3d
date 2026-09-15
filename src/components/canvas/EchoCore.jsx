import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRoomStore } from '../../store/useRoomStore'

export default function EchoCore(props) {
  const coreRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const lightRef = useRef()

  const voiceState = useRoomStore((state) => state.voiceState)
  const audioLevel = useRoomStore((state) => state.audioLevel)

  // Determine active holographic aura color
  const coreColor = useMemo(() => {
    if (voiceState.isSpeaking) return '#f59e0b' // Radiant warm amber
    if (voiceState.isListening) return '#06b6d4' // Electric cyan
    if (voiceState.isConnected) return '#10b981' // Connected emerald
    return '#64748b' // Idle slate
  }, [voiceState.isSpeaking, voiceState.isListening, voiceState.isConnected])

  // Materials
  const coreMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: coreColor,
        emissive: coreColor,
        emissiveIntensity: 1.8,
        roughness: 0.1,
        metalness: 0.9,
      }),
    [coreColor]
  )

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: coreColor,
        emissive: coreColor,
        emissiveIntensity: 0.8,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      }),
    [coreColor]
  )

  useFrame((state, delta) => {
    if (!coreRef.current) return

    const t = state.clock.getElapsedTime()
    const reactiveBoost = audioLevel * 1.5

    // Idle gentle floating bob
    coreRef.current.position.y = 2.4 + Math.sin(t * 1.5) * 0.08

    // Gyroscopic rotations
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.8
      ring1Ref.current.rotation.y = t * 1.2
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.9
      ring2Ref.current.rotation.z = t * 0.6
    }

    // Audio reactive pulse
    const targetScale = 1.0 + (voiceState.isSpeaking || voiceState.isListening ? 0.3 + reactiveBoost : 0)
    coreRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      Math.min(delta * 8, 1)
    )

    // Dynamic light emission
    if (lightRef.current) {
      lightRef.current.intensity = (voiceState.isSpeaking ? 2.5 : 0.8) + reactiveBoost * 2
    }
  })

  return (
    <group ref={coreRef} position={[2.8, 2.4, -0.5]}>
      {/* Central Glowing Orb */}
      <mesh material={coreMaterial}>
        <sphereGeometry args={[0.18, 32, 32]} />
      </mesh>

      {/* Outer Gyroscopic Ring 1 */}
      <mesh ref={ring1Ref} material={ringMaterial}>
        <torusGeometry args={[0.32, 0.015, 16, 48]} />
      </mesh>

      {/* Outer Gyroscopic Ring 2 */}
      <mesh ref={ring2Ref} material={ringMaterial}>
        <torusGeometry args={[0.42, 0.012, 16, 48]} />
      </mesh>

      {/* Dynamic Spatial Light Source */}
      <pointLight
        ref={lightRef}
        color={coreColor}
        intensity={1.2}
        distance={4.5}
        decay={2}
      />
    </group>
  )
}
