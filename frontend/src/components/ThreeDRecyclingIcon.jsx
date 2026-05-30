import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Single interactive 3D mesh model renderer
function IconMesh({ type, isHovered }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Smooth idle bobbing
    meshRef.current.position.y = Math.sin(time * 1.5) * 0.12;
    
    // Smooth rotation: spins faster and tilts when hovered
    if (isHovered) {
      meshRef.current.rotation.y += 0.09;
      meshRef.current.rotation.x = Math.sin(time * 3) * 0.2;
    } else {
      meshRef.current.rotation.y = time * 0.6;
      meshRef.current.rotation.x = 0.25; // elegant base tilt
    }
  });

  if (type === 'bottle') {
    return (
      <group ref={meshRef}>
        {/* Bottle Body */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.9, 16]} />
          <meshPhysicalMaterial 
            color="#06b6d4" 
            transparent 
            opacity={0.65} 
            roughness={0.05} 
            metalness={0.1}
            transmission={0.9}
            thickness={1.2}
          />
        </mesh>
        {/* Bottle Neck */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.3, 16]} />
          <meshPhysicalMaterial color="#06b6d4" transparent opacity={0.65} roughness={0.05} transmission={0.9} />
        </mesh>
        {/* Bottle Cap */}
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.1, 16]} />
          <meshStandardMaterial color="#facc15" roughness={0.3} />
        </mesh>
      </group>
    );
  }

  if (type === 'paper') {
    return (
      <group ref={meshRef}>
        {/* Folded Sheet of Recycled Paper */}
        <mesh rotation={[0.2, 0, 0.1]}>
          <boxGeometry args={[0.8, 0.9, 0.03]} />
          <meshStandardMaterial color="#f3f4f6" roughness={0.8} metalness={0.05} />
        </mesh>
        {/* Text lines details */}
        <mesh position={[0, 0.2, 0.02]} rotation={[0.2, 0, 0.1]}>
          <boxGeometry args={[0.5, 0.04, 0.01]} />
          <meshStandardMaterial color="#10b981" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation={[0.2, 0, 0.1]}>
          <boxGeometry args={[0.6, 0.04, 0.01]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.2, 0.02]} rotation={[0.2, 0, 0.1]}>
          <boxGeometry args={[0.4, 0.04, 0.01]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  if (type === 'can') {
    return (
      <group ref={meshRef}>
        {/* Metal Can Body */}
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 1.0, 20]} />
          <meshStandardMaterial 
            color="#e5e7eb" 
            metalness={0.95} 
            roughness={0.15} 
          />
        </mesh>
        {/* Can Ridges */}
        <mesh position={[0, 0.45, 0]}>
          <torusGeometry args={[0.35, 0.03, 8, 24]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <torusGeometry args={[0.35, 0.03, 8, 24]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>
    );
  }

  if (type === 'leaf') {
    return (
      <group ref={meshRef}>
        {/* Primary leaf body */}
        <mesh rotation={[0.1, 0, 0.2]}>
          <boxGeometry args={[0.65, 0.65, 0.06]} />
          <meshStandardMaterial color="#10b981" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Secondary curve leaf tip */}
        <mesh position={[0.2, 0.2, 0.02]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.4, 0.4, 0.04]} />
          <meshStandardMaterial color="#34d399" roughness={0.4} />
        </mesh>
        {/* Stem */}
        <mesh position={[-0.38, -0.38, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#047857" roughness={0.7} />
        </mesh>
      </group>
    );
  }

  return null;
}

export default function ThreeDRecyclingIcon({ type }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="w-28 h-28 mx-auto relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic atmospheric back glow ring */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 scale-90 ${
          isHovered ? 'opacity-40 scale-110' : 'opacity-10 scale-90'
        } ${
          type === 'bottle' ? 'bg-cyan-500' :
          type === 'leaf' ? 'bg-emerald-500' :
          type === 'can' ? 'bg-slate-400' : 'bg-green-400'
        }`} 
      />

      <Canvas 
        camera={{ position: [0, 0, 2.0], fov: 45 }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 3, 2]} intensity={1.5} />
        <pointLight position={[-2, -1, -2]} intensity={0.4} color="#10b981" />
        
        <IconMesh type={type} isHovered={isHovered} />
      </Canvas>
    </div>
  );
}
