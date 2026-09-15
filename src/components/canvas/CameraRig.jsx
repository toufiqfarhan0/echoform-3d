import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRoomStore, CAMERA_VIEWS } from '../../store/useRoomStore'

export default function CameraRig({ controlsRef }) {
  const cameraView = useRoomStore((state) => state.cameraView)
  const targetConfig = CAMERA_VIEWS[cameraView] || CAMERA_VIEWS.overview

  const { camera } = useThree()
  const targetVec = useRef(new THREE.Vector3(...targetConfig.position))
  const lookAtVec = useRef(new THREE.Vector3(...targetConfig.target))

  useEffect(() => {
    targetVec.current.set(...targetConfig.position)
    lookAtVec.current.set(...targetConfig.target)
  }, [cameraView, targetConfig])

  useFrame((state, delta) => {
    // Smooth camera damping towards target view
    const step = Math.min(delta * 2.8, 1)
    camera.position.lerp(targetVec.current, step)

    if (controlsRef.current) {
      controlsRef.current.target.lerp(lookAtVec.current, step)
      controlsRef.current.update()
    }
  })

  return null
}
