import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRoomStore } from '../../store/useRoomStore'

export default function SunBeams() {
  const particlesRef = useRef()
  const currentPreset = useRoomStore((state) => state.lightingPreset)

  const count = 40
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Concentrate particles in the window-to-sofa light cone
      pos[i * 3 + 0] = -3.5 + Math.random() * 4.5 // X: window to center
      pos[i * 3 + 1] = 0.5 + Math.random() * 3.0 // Y: height
      pos[i * 3 + 2] = -1.2 + Math.random() * 3.0 // Z: room depth
      spd[i] = 0.2 + Math.random() * 0.4
    }
    return [pos, spd]
  }, [])

  const particleColor = useMemo(() => {
    if (currentPreset === 'golden_hour') return '#ffc078'
    if (currentPreset === 'cyberpunk_neon') return '#00f0ff'
    if (currentPreset === 'moody_night') return '#8da2fb'
    return '#ffffff'
  }, [currentPreset])

  useFrame((state, delta) => {
    if (!particlesRef.current) return

    const posAttr = particlesRef.current.geometry.attributes.position
    const posArr = posAttr.array

    for (let i = 0; i < count; i++) {
      // Gentle downward and drifting motion
      posArr[i * 3 + 1] -= speeds[i] * delta * 0.15
      posArr[i * 3 + 0] += Math.sin(state.clock.elapsedTime + i) * delta * 0.05

      // Reset to top when drifting too low
      if (posArr[i * 3 + 1] < 0.2) {
        posArr[i * 3 + 1] = 3.2
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={particleColor}
        transparent
        opacity={currentPreset === 'moody_night' ? 0.3 : 0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
