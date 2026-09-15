import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRoomStore } from '../../store/useRoomStore'

export default function AcousticRipples() {
  const ripple1Ref = useRef()
  const ripple2Ref = useRef()
  const ripple3Ref = useRef()

  const audioLevel = useRoomStore((state) => state.audioLevel)
  const voiceState = useRoomStore((state) => state.voiceState)

  const rippleColor = voiceState.isSpeaking
    ? '#f59e0b' // Amber when agent speaks
    : voiceState.isListening
    ? '#06b6d4' // Cyan when user speaks
    : '#475569'

  const material = useRef(
    new THREE.MeshBasicMaterial({
      color: rippleColor,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    })
  )

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const active = voiceState.isSpeaking || voiceState.isListening || audioLevel > 0.05
    const boost = Math.max(audioLevel * 2.5, active ? 0.4 : 0.05)

    material.current.color.set(rippleColor)

    if (ripple1Ref.current) {
      const scale1 = 1.0 + ((t * 0.8) % 1.5) * 1.6 * boost
      ripple1Ref.current.scale.set(scale1, scale1, 1)
      ripple1Ref.current.material.opacity = Math.max(0, (1 - ((t * 0.8) % 1.5) / 1.5) * 0.35 * boost)
    }

    if (ripple2Ref.current) {
      const scale2 = 1.0 + (((t * 0.8 + 0.5) % 1.5) * 1.6 * boost)
      ripple2Ref.current.scale.set(scale2, scale2, 1)
      ripple2Ref.current.material.opacity = Math.max(0, (1 - (((t * 0.8 + 0.5) % 1.5) / 1.5)) * 0.25 * boost)
    }

    if (ripple3Ref.current) {
      const scale3 = 1.0 + (((t * 0.8 + 1.0) % 1.5) * 1.6 * boost)
      ripple3Ref.current.scale.set(scale3, scale3, 1)
      ripple3Ref.current.material.opacity = Math.max(0, (1 - (((t * 0.8 + 1.0) % 1.5) / 1.5)) * 0.18 * boost)
    }
  })

  return (
    <group position={[-0.2, 0.015, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Concentric expanding acoustic rings */}
      <mesh ref={ripple1Ref} material={material.current}>
        <ringGeometry args={[0.7, 0.74, 48]} />
      </mesh>
      <mesh ref={ripple2Ref} material={material.current}>
        <ringGeometry args={[0.85, 0.89, 48]} />
      </mesh>
      <mesh ref={ripple3Ref} material={material.current}>
        <ringGeometry args={[1.05, 1.08, 48]} />
      </mesh>
    </group>
  )
}
