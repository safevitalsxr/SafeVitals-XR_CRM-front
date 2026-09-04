"use client"

import React, { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, OrbitControls, ContactShadows, useGLTF } from "@react-three/drei"
import * as THREE from "three"

function RealisticHeadset() {
  const group = useRef<THREE.Group>(null)
  
  // Load the gorgeous model downloaded from Sketchfab
  const { scene } = useGLTF("/models/vr_headset/scene.gltf")

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={2} position={[0, 0.3, 0]} />
    </group>
  )
}

export function VRHeadsetCanvas() {
  return (
    <div className="w-full h-full absolute inset-0 z-10 flex items-center justify-center touch-none">
      <Canvas shadows camera={{ position: [0, 2, 6], fov: 45 }}>
        
        {/* Significantly boosted lighting for visibility */}
        <ambientLight intensity={4} />
        <pointLight position={[10, 10, 10]} intensity={8} color="#ffffff" />
        <pointLight position={[-10, 10, -10]} intensity={6} color="#c7d2fe" />
        <directionalLight position={[-5, 5, -5]} intensity={5} color="#ffffff" />
        <directionalLight position={[0, 5, 5]} intensity={4} color="#e2e8f0" />
        <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={5} castShadow />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={false}
        />
        
        <Float rotationIntensity={0.4} floatIntensity={2} speed={1.5}>
          <React.Suspense fallback={null}>
            <RealisticHeadset />
          </React.Suspense>
        </Float>

        <ContactShadows position={[0, -1.4, 0]} opacity={0.7} scale={10} blur={2.5} far={4} />
      </Canvas>
    </div>
  )
}

useGLTF.preload("/models/vr_headset/scene.gltf")
